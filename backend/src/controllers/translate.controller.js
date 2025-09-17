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
exports.detectLanguage = exports.translateText = void 0;
var redis_1 = require("../config/redis");
// Mock language detection data
var languagePatterns = {
    'hi': /[\u0900-\u097F]/, // Hindi
    'bn': /[\u0980-\u09FF]/, // Bengali
    'te': /[\u0C00-\u0C7F]/, // Telugu
    'mr': /[\u0900-\u097F]/, // Marathi (shares Devanagari with Hindi)
    'ta': /[\u0B80-\u0BFF]/, // Tamil
    'gu': /[\u0A80-\u0AFF]/, // Gujarati
    'kn': /[\u0C80-\u0CFF]/, // Kannada
    'ml': /[\u0D00-\u0D7F]/, // Malayalam
    'pa': /[\u0A00-\u0A7F]/, // Punjabi
};
// Mock cultural context data
var culturalContexts = {
    'hi': [
        'In Hindi, formal speech uses "आप" (aap) while informal uses "तुम" (tum) or "तू" (tu).',
        'Namaste (नमस्ते) is a common greeting that literally means "I bow to the divine in you".',
        'Hindi is the official language of India along with English and is spoken by over 500 million people.'
    ],
    'bn': [
        'Bengali uses "আপনি" (apni) for formal address and "তুমি" (tumi) for informal.',
        'Nomoshkar (নমস্কার) is a common formal greeting in Bengali.',
        'Bengali is the official language of Bangladesh and the Indian states of West Bengal and Tripura.'
    ],
    'te': [
        'Telugu uses "మీరు" (meeru) for formal address and "నువ్వు" (nuvvu) for informal.',
        'Namaskaram (నమస్కారం) is a common formal greeting in Telugu.',
        'Telugu is primarily spoken in Andhra Pradesh and Telangana.'
    ]
};
/**
 * Translate text with cultural context
 * @route POST /api/translate
 */
var translateText = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, text, sourceLanguage, targetLanguage, formalityLevel, cacheKey, cachedResult, translatedText, culturalContext, result, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, text = _a.text, sourceLanguage = _a.sourceLanguage, targetLanguage = _a.targetLanguage, formalityLevel = _a.formalityLevel;
                if (!text || !sourceLanguage || !targetLanguage) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: 'Text, source language, and target language are required'
                        })];
                }
                cacheKey = "translate:".concat(sourceLanguage, ":").concat(targetLanguage, ":").concat(formalityLevel, ":").concat(text);
                return [4 /*yield*/, redis_1.default.get(cacheKey)];
            case 1:
                cachedResult = _b.sent();
                if (cachedResult) {
                    return [2 /*return*/, res.status(200).json(JSON.parse(cachedResult))];
                }
                translatedText = "This is a mock translation from ".concat(sourceLanguage, " to ").concat(targetLanguage, " with ").concat(formalityLevel, " formality.");
                culturalContext = culturalContexts[targetLanguage]
                    ? culturalContexts[targetLanguage][Math.floor(Math.random() * culturalContexts[targetLanguage].length)]
                    : 'No specific cultural context available for this language.';
                result = {
                    success: true,
                    data: {
                        originalText: text,
                        translatedText: translatedText,
                        sourceLanguage: sourceLanguage,
                        targetLanguage: targetLanguage,
                        formalityLevel: formalityLevel,
                        culturalContext: culturalContext
                    }
                };
                // Cache the result
                return [4 /*yield*/, redis_1.default.set(cacheKey, JSON.stringify(result), {
                        EX: 3600 // Expire in 1 hour
                    })];
            case 2:
                // Cache the result
                _b.sent();
                return [2 /*return*/, res.status(200).json(result)];
            case 3:
                error_1 = _b.sent();
                console.error('Translation error:', error_1);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: 'Error processing translation request'
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.translateText = translateText;
/**
 * Detect language of text
 * @route POST /api/translate/detect
 */
var detectLanguage = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var text, detectedLanguage, _i, _a, _b, lang, pattern;
    return __generator(this, function (_c) {
        try {
            text = req.body.text;
            if (!text) {
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: 'Text is required'
                    })];
            }
            detectedLanguage = 'en';
            for (_i = 0, _a = Object.entries(languagePatterns); _i < _a.length; _i++) {
                _b = _a[_i], lang = _b[0], pattern = _b[1];
                if (pattern.test(text)) {
                    detectedLanguage = lang;
                    break;
                }
            }
            return [2 /*return*/, res.status(200).json({
                    success: true,
                    data: {
                        detectedLanguage: detectedLanguage,
                        confidence: 0.9 // Mock confidence score
                    }
                })];
        }
        catch (error) {
            console.error('Language detection error:', error);
            return [2 /*return*/, res.status(500).json({
                    success: false,
                    message: 'Error detecting language'
                })];
        }
        return [2 /*return*/];
    });
}); };
exports.detectLanguage = detectLanguage;
