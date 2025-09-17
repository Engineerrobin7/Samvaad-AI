"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var tips_controller_1 = require("../controllers/tips.controller");
var router = express_1.default.Router();
// Add a root endpoint for API documentation
router.get('/', function (req, res) {
    res.json({
        message: 'Cultural and language tips',
        available_routes: [
            { method: 'GET', path: '/cultural/:language', description: 'Get cultural tips for a specific language.' },
            { method: 'GET', path: '/language/:language', description: 'Get language learning tips.' }
        ]
    });
});
// GET /api/tips/cultural/:language - Get cultural tips for a specific language
router.get('/cultural/:language', tips_controller_1.getCulturalTips);
// GET /api/tips/language/:language - Get language learning tips
router.get('/language/:language', tips_controller_1.getLanguageTips);
exports.default = router;
