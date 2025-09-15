"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var router = express.Router();
var authController = require("../controllers/auth.controller").authController;
var authenticate = require("../middleware/auth.middleware").authenticate;
// Add a root endpoint for API documentation
router.get('/', function (req, res) {
    res.json({
        message: 'Authentication endpoints',
        available_routes: [
            { method: 'POST', path: '/sync', description: 'Creates a user in our DB after they sign up with Clerk.' },
            { method: 'GET', path: '/profile', description: 'Gets the current user\'s profile.' }
        ]
    });
});
// POST /api/auth/sync - Creates a user in our DB after they sign up with Clerk
router.post('/sync', authController.syncUser);
// GET /api/auth/profile - Gets the current user's profile
router.get('/profile', authenticate, authController.getProfile);
exports.default = router;