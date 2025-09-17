"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var translate_controller_1 = require("../controllers/translate.controller");
var router = express_1.default.Router();
// POST /api/translate - Translate text with cultural context
router.post('/', translate_controller_1.translateText);
// POST /api/translate/detect - Detect language of text
router.post('/detect', translate_controller_1.detectLanguage);
exports.default = router;
