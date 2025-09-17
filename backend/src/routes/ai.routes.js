"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var ai_controller_1 = require("../controllers/ai.controller");
var auth_middleware_1 = require("../middleware/auth.middleware");
var router = express_1.default.Router();
// Add a root endpoint for API documentation
router.get('/', function (req, res) {
    res.json({
        message: 'AI-powered translation and chat',
        available_routes: [
            { method: 'POST', path: '/translate', description: 'Translates a piece of text.' },
            { method: 'POST', path: '/translate-image', description: 'Translates the text found in an uploaded image.' },
            { method: 'POST', path: '/chat', description: 'Handles chat messages with the AI.' },
            { method: 'DELETE', path: '/chat/:conversationId', description: 'Clears the history of an AI chat conversation.' },
            { method: 'POST', path: '/upload-pdf', description: 'Uploads a PDF for chatting.' },
            { method: 'POST', path: '/chat-with-pdf', description: 'Handles chat messages with the PDF.' }
        ]
    });
});
// Translation routes
router.post('/translate', auth_middleware_1.authenticate, ai_controller_1.translateText);
router.post('/translate-image', auth_middleware_1.authenticate, ai_controller_1.upload.single('image'), ai_controller_1.translateImage);
// Chat routes
router.post('/chat', auth_middleware_1.authenticate, ai_controller_1.chatWithAI);
router.delete('/chat/:conversationId', auth_middleware_1.authenticate, ai_controller_1.clearChat);
// Chat with PDF routes
router.post('/upload-pdf', auth_middleware_1.authenticate, ai_controller_1.uploadPdf.single('pdf'), ai_controller_1.uploadPdfHandler);
router.post('/chat-with-pdf', auth_middleware_1.authenticate, ai_controller_1.chatWithPdf);
exports.default = router;
