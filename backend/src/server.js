"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var auth_routes_1 = require("./routes/auth.routes");
var chat_routes_1 = require("./routes/chat.routes");
var translate_routes_1 = require("./routes/translate.routes");
var tips_routes_1 = require("./routes/tips.routes");
var ai_routes_1 = require("./routes/ai.routes");
var assistance_routes_1 = require("./routes/assistance.routes");
var server = (0, express_1.default)();
// Middleware
server.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
server.use(express_1.default.json());
// Routes
server.use('/api/auth', auth_routes_1.default);
server.use('/api/chat', chat_routes_1.default);
server.use('/api/translate', translate_routes_1.default);
server.use('/api/tips', tips_routes_1.default);
server.use('/api/ai', ai_routes_1.default);
server.use('/api/assistance', assistance_routes_1.default);
exports.default = server;
