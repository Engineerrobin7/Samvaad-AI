"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearChat = exports.chatWithAI = exports.translateImage = exports.translateText = exports.chatWithPdf = exports.uploadPdfHandler = exports.uploadPdf = exports.upload = void 0;
var pool_1 = require("../db/pool");
var ai_service_1 = require("../services/ai.service");
var multer_1 = require("multer");
var pdf_parse_1 = require("pdf-parse");
var fs_1 = require("fs");
// Configure multer for file uploads
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        var allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only images are allowed.'));
        }
    }
});
var pdfStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/faq');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
exports.uploadPdf = (0, multer_1.default)({
    storage: pdfStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only PDF files are allowed.'));
        }
    }
});
// In-memory cache for PDF content
var pdfCache = new Map();
/**
 * Upload and process a PDF file
 * @route POST /api/ai/upload-pdf
 */
var uploadPdfHandler = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, conversationId, language, file, dataBuffer, data, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, conversationId = _a.conversationId, language = _a.language;
                file = req.file;
                if (!file) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'PDF file is required'
                        })];
                }
                if (!conversationId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Conversation ID is required'
                        })];
                }
                dataBuffer = fs_1.default.readFileSync(file.path);
                return [4 /*yield*/, (0, pdf_parse_1.default)(dataBuffer)];
            case 1:
                data = _b.sent();
                pdfCache.set(conversationId, JSON.stringify({ text: data.text, language: language || 'en' }));
                res.json({
                    success: true,
                    message: 'PDF uploaded and processed successfully'
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                console.error('PDF upload error:', error_1);
                res.status(500).json({
                    success: false,
                    message: 'PDF upload failed',
                    error: error_1 instanceof Error ? error_1.message : 'Unknown error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.uploadPdfHandler = uploadPdfHandler;
/**
 * Chat with AI about a PDF
 * @route POST /api/ai/chat-with-pdf
 */
var chatWithPdf = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, question, conversationId, language, userId, pdfData, _b, pdfText, pdfLanguage, reply, logError_1, error_2;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 6, , 7]);
                _a = req.body, question = _a.question, conversationId = _a.conversationId, language = _a.language;
                userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
                if (!question || !conversationId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Question and Conversation ID are required'
                        })];
                }
                pdfData = pdfCache.get(conversationId);
                if (!pdfData) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: 'PDF not found for this conversation. Please upload a PDF first.'
                        })];
                }
                _b = JSON.parse(pdfData), pdfText = _b.text, pdfLanguage = _b.language;
                return [4 /*yield*/, ai_service_1.aiService.chatWithPdf(question, pdfText, language || pdfLanguage || 'en')];
            case 1:
                reply = _d.sent();
                if (!userId) return [3 /*break*/, 5];
                _d.label = 2;
            case 2:
                _d.trys.push([2, 4, , 5]);
                return [4 /*yield*/, pool_1.default.query('INSERT INTO ai_conversation_logs (conversation_id, user_id, model, message, reply, language) VALUES ($1, $2, $3, $4, $5, $6)', [conversationId, userId, 'gemini-pdf-chat', question, reply, language || pdfLanguage || 'en'])];
            case 3:
                _d.sent();
                return [3 /*break*/, 5];
            case 4:
                logError_1 = _d.sent();
                console.error('Failed to log PDF chat:', logError_1);
                return [3 /*break*/, 5];
            case 5:
                res.json({
                    success: true,
                    data: {
                        reply: reply,
                        conversationId: conversationId
                    }
                });
                return [3 /*break*/, 7];
            case 6:
                error_2 = _d.sent();
                console.error('Chat with PDF error:', error_2);
                res.status(500).json({
                    success: false,
                    message: 'Chat with PDF failed',
                    error: error_2 instanceof Error ? error_2.message : 'Unknown error'
                });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.chatWithPdf = chatWithPdf;
/**
 * Translate text with cultural context
 * @route POST /api/ai/translate
 */
var translateText = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // Implement translation logic here
        res.json({ success: true, translated: "Translated text" });
        return [2 /*return*/];
    });
}); };
exports.translateText = translateText;
var translateImage = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // Implement image translation logic here
        res.json({ success: true, translated: "Translated image text" });
        return [2 /*return*/];
    });
}); };
exports.translateImage = translateImage;
var chatWithAI = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // Implement AI chat logic here
        res.json({ success: true, reply: "AI reply" });
        return [2 /*return*/];
    });
}); };
exports.chatWithAI = chatWithAI;
// Remove this duplicate clearChat export
// export const clearChat = async (req: Request, res: Response) => {
//   // Implement chat clearing logic here
//   res.json({ success: true, message: "Chat cleared" });
// };
var clearChat = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var conversationId;
    return __generator(this, function (_a) {
        try {
            conversationId = req.params.conversationId;
            if (!conversationId) {
                return [2 /*return*/, res.status(400).json({ success: false, message: "Conversation ID is required" })];
            }
            ai_service_1.aiService.clearConversation(conversationId);
            res.json({ success: true, message: "Conversation cleared" });
        }
        catch (error) {
            console.error("Clear chat error:", error);
            res.status(500).json({ success: false, message: "Failed to clear conversation" });
        }
        return [2 /*return*/];
    });
}); };
exports.clearChat = clearChat;
