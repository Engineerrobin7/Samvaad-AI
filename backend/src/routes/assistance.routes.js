"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/assistance.routes.ts
var express_1 = require("express");
var assistance_controller_1 = require("../controllers/assistance.controller");
var auth_middleware_1 = require("../middleware/auth.middleware");
var router = express_1.default.Router();
router.post('/request', auth_middleware_1.authenticate, assistance_controller_1.requestAssistance);
router.get('/requests', auth_middleware_1.authenticate, assistance_controller_1.getAssistanceRequests);
exports.default = router;
