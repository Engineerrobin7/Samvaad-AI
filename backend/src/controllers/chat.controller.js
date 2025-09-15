import express from "express";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import multer from "multer";
import pool from "../db/pool.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------------------------
// Multer Setup for File Uploads
// -------------------------------------------------
const uploadDir = path.join(__dirname, "../../uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    // Simple example: allow only images and PDFs
    const allowed = ["image/", "application/pdf"];
    if (allowed.some((type) => file.mimetype.startsWith(type))) cb(null, true);
    else cb(new Error("Unsupported file type"));
  },
});

// -------------------------------------------------
// Router
// -------------------------------------------------
const router = express.Router();

// -------------------------------------------------
// 1. Get Chat History with Pagination
// -------------------------------------------------
async function getChatHistory(req, res) {
  try {
    const roomId = req.params.roomId;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT * FROM chat_messages
       WHERE room_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [roomId, limit, offset]
    );

    res.json({ page, limit, messages: result.rows });
  } catch (err) {
    console.error("getChatHistory error:", err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

// -------------------------------------------------
// 2. Delete a Message
// -------------------------------------------------
async function deleteMessage(req, res) {
  try {
    const { messageId } = req.params;
    const result = await pool.query(
      "DELETE FROM chat_messages WHERE id = $1 RETURNING *",
      [messageId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("deleteMessage error:", err);
    res.status(500).json({ error: "Failed to delete message" });
  }
};

// -------------------------------------------------
// 3. Edit a Message
// -------------------------------------------------
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { newText } = req.body;

    const result = await pool.query(
      "UPDATE chat_messages SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [newText, messageId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json({ success: true, message: result.rows[0] });
  } catch (err) {
    console.error("editMessage error:", err);
    res.status(500).json({ error: "Failed to edit message" });
  }
};

// -------------------------------------------------
// 4. Search Messages
// -------------------------------------------------
const searchMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { query } = req.query;
    const result = await pool.query(
      `SELECT * FROM chat_messages
       WHERE room_id = $1 AND content ILIKE $2
       ORDER BY created_at DESC`,
      [roomId, `%${query}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("searchMessages error:", err);
    res.status(500).json({ error: "Search failed" });
  }
};

// -------------------------------------------------
// 5. Get Unread Count for a User
// -------------------------------------------------
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const result = await pool.query(
      `SELECT room_id, COUNT(*) as unread_count
       FROM chat_messages
       WHERE recipient_id = $1 AND is_read = FALSE
       GROUP BY room_id`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getUnreadCount error:", err);
    res.status(500).json({ error: "Failed to get unread count" });
  }
};

// -------------------------------------------------
// 6. Mark Typing Indicator (simple demo)
// -------------------------------------------------
const setTyping = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { isTyping } = req.body;
    // Normally you'd broadcast via WebSocket/Socket.IO
    res.json({ roomId, isTyping });
  } catch (err) {
    console.error("setTyping error:", err);
    res.status(500).json({ error: "Typing update failed" });
  }
};

// -------------------------------------------------
// 7. Create Chat Room
// -------------------------------------------------
const createChatRoom = async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, participants } = req.body;
    const roomId = uuidv4();

    await client.query("BEGIN");
    await client.query(
      "INSERT INTO chat_rooms (id, name) VALUES ($1, $2)",
      [roomId, name]
    );

    if (Array.isArray(participants) && participants.length > 0) {
      const values = [];
      const placeholders = participants
        .map((p, i) => {
          values.push(roomId, p.id);
          return `($${i * 2 + 1}, $${i * 2 + 2})`;
        })
        .join(",");
      await client.query(
        `INSERT INTO chat_participants (room_id, user_id) VALUES ${placeholders}`,
        values
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ roomId, name });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createChatRoom error:", err);
    res.status(500).json({ error: "Failed to create room" });
  } finally {
    client.release();
  }
};

// -------------------------------------------------
// 8. Upload Attachment
// -------------------------------------------------
const uploadAttachment = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const fileUrl = `/uploads/${file.filename}`;
    const { roomId, senderId } = req.body;

    const result = await pool.query(
      `INSERT INTO chat_messages (id, room_id, sender_id, content, type)
       VALUES ($1, $2, $3, $4, 'file')
       RETURNING *`,
      [uuidv4(), roomId, senderId, fileUrl]
    );

    res.status(201).json({ success: true, message: result.rows[0] });
  } catch (err) {
    console.error("uploadAttachment error:", err);
    res.status(500).json({ error: "File upload failed" });
  }
};

// -------------------------------------------------
// Route Bindings
// -------------------------------------------------
router.get("/history/:roomId", getChatHistory);
router.delete("/message/:messageId", deleteMessage);
router.put("/message/:messageId", editMessage);
router.get("/search/:roomId", searchMessages);
router.get("/unread", getUnreadCount);
router.post("/typing/:roomId", setTyping);
router.post("/create-room", createChatRoom);
router.post(
  "/upload",
  upload.single("file"),
  uploadAttachment
);

export { getChatHistory, deleteMessage, editMessage, searchMessages, getUnreadCount, setTyping, createChatRoom, uploadAttachment };
export default router;