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
exports.authController = void 0;
var pool_1 = require("../db/pool");
exports.authController = {
    // Syncs Clerk user with your local database
    syncUser: function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, clerkId, email, name_1, preferred_language, userExists, user, newUserQuery, newUser, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        _a = req.body, clerkId = _a.clerkId, email = _a.email, name_1 = _a.name, preferred_language = _a.preferred_language;
                        if (!clerkId || !email || !name_1) {
                            return [2 /*return*/, res.status(400).json({ message: 'Missing required user data for sync' })];
                        }
                        return [4 /*yield*/, pool_1.default.query('SELECT * FROM users WHERE clerk_id = $1', [clerkId])];
                    case 1:
                        userExists = _b.sent();
                        if (userExists.rows.length > 0) {
                            user = userExists.rows[0];
                            return [2 /*return*/, res.status(200).json({ message: 'User already synced', user: user })];
                        }
                        newUserQuery = "\n        INSERT INTO users (clerk_id, email, name, preferred_language) \n        VALUES ($1, $2, $3, $4) \n        RETURNING *\n      ";
                        return [4 /*yield*/, pool_1.default.query(newUserQuery, [clerkId, email, name_1, preferred_language || 'en'])];
                    case 2:
                        newUser = _b.sent();
                        res.status(201).json({ message: 'User synced successfully', user: newUser.rows[0] });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.error('User sync error:', error_1);
                        res.status(500).json({ message: 'Server error during user sync' });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    // Get current user's profile
    getProfile: function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, userResult, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        return [4 /*yield*/, pool_1.default.query('SELECT id, clerk_id, name, email, preferred_language, points, level FROM users WHERE id = $1', [userId])];
                    case 1:
                        userResult = _b.sent();
                        if (userResult.rows.length === 0) {
                            return [2 /*return*/, res.status(404).json({ message: "User not found" })];
                        }
                        res.json(userResult.rows[0]);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        console.error('Get profile error:', error_2);
                        res.status(500).json({ message: "Server error" });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
};
