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
exports.aiService = void 0;
// src/services/ai.service.ts
var generative_ai_1 = require("@google/generative-ai");
var fs_1 = require("fs");
var path_1 = require("path");
var AIService = /** @class */ (function () {
    function AIService() {
        this.conversationStore = new Map();
        var apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not configured');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    /**
     * Get system prompt for translation
     */
    AIService.prototype.getTranslationPrompt = function (sourceLanguage, targetLanguage, formalityLevel) {
        return "You are an expert translator specializing in Indian languages with deep cultural understanding.\nTranslate the following text from \"".concat(sourceLanguage, "\" to \"").concat(targetLanguage, "\".\nThe desired formality level is \"").concat(formalityLevel, "\".\n\nYour response MUST be a valid JSON object with exactly two keys:\n1. \"translation\": The translated text\n2. \"culturalContext\": A brief, helpful cultural tip related to the translation (maximum 100 words)\n\nDo not include any other text, explanations, or markdown formatting. Return only the JSON object.");
    };
    /**
     * Get system prompt for image translation
     */
    AIService.prototype.getImageTranslationPrompt = function (targetLanguage) {
        return "You are an expert at extracting and translating text from images, with deep knowledge of Indian languages and culture.\n\nFirst, carefully extract ALL visible text from the provided image.\nThen, translate the extracted text into \"".concat(targetLanguage, "\".\n\nYour response MUST be a valid JSON object with exactly three keys:\n1. \"extractedText\": All text found in the image (in original language)\n2. \"translation\": The translated text in ").concat(targetLanguage, "\n3. \"culturalContext\": A brief cultural tip relevant to the content (maximum 80 words)\n\nIf no text is found, use \"No text detected\" for extractedText and translation.\nReturn only the JSON object with no additional text or formatting.");
    };
    /**
     * Get system prompt for chat
     */
    AIService.prototype.getChatPrompt = function (language) {
        return "You are Samvaad AI, a helpful and culturally-aware multilingual assistant. Your primary goal is to facilitate clear and respectful communication across Indian cultures.\n\nKey guidelines:\n- Respond in ".concat(language, " when the user speaks in ").concat(language, "\n- Provide cultural context when relevant\n- Be helpful, respectful, and encouraging\n- Keep responses concise but informative\n- If asked about something you cannot help with, politely explain your limitations\n\nRemember: You are designed to bridge cultural and linguistic gaps in India.");
    };
    /**
     * Parse JSON response safely
     */
    AIService.prototype.parseAIResponse = function (response, fallback) {
        try {
            // Clean the response - remove any markdown code blocks or extra whitespace
            var cleanResponse = response
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            var parsed = JSON.parse(cleanResponse);
            return parsed;
        }
        catch (error) {
            console.error('Failed to parse AI response:', error);
            console.error('Raw response:', response);
            return fallback;
        }
    };
    /**
     * Get MIME type from file extension
     */
    AIService.prototype.getMimeType = function (filePath) {
        var ext = path_1.default.extname(filePath).toLowerCase();
        var mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.bmp': 'image/bmp',
            '.webp': 'image/webp'
        };
        return mimeTypes[ext] || 'image/jpeg';
    };
    /**
     * Translate text with cultural context
     */
    AIService.prototype.translateText = function (text_1, sourceLanguage_1, targetLanguage_1) {
        return __awaiter(this, arguments, void 0, function (text, sourceLanguage, targetLanguage, formalityLevel) {
            var model, prompt_1, fullPrompt, result, response, responseText, fallback, error_1;
            if (formalityLevel === void 0) { formalityLevel = 'neutral'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
                        prompt_1 = this.getTranslationPrompt(sourceLanguage, targetLanguage, formalityLevel);
                        fullPrompt = "".concat(prompt_1, "\n\nText to translate: \"").concat(text, "\"");
                        return [4 /*yield*/, model.generateContent(fullPrompt)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, result.response];
                    case 2:
                        response = _a.sent();
                        responseText = response.text();
                        fallback = {
                            translation: "[Translation failed] ".concat(text),
                            culturalContext: 'Translation service is temporarily unavailable.'
                        };
                        return [2 /*return*/, this.parseAIResponse(responseText, fallback)];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Translation error:', error_1);
                        throw new Error('Translation service failed');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Translate text from image
     */
    AIService.prototype.translateImage = function (imagePath, targetLanguage) {
        return __awaiter(this, void 0, void 0, function () {
            var model, imageData, base64Data, prompt_2, result, response, responseText, fallback, result_parsed, unlinkError_1, error_2, unlinkError_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 13]);
                        model = this.genAI.getGenerativeModel({ model: "gemini-pro-vision" });
                        return [4 /*yield*/, fs_1.promises.readFile(imagePath)];
                    case 1:
                        imageData = _a.sent();
                        base64Data = imageData.toString('base64');
                        prompt_2 = this.getImageTranslationPrompt(targetLanguage);
                        return [4 /*yield*/, model.generateContent([
                                prompt_2,
                                {
                                    inlineData: {
                                        data: base64Data,
                                        mimeType: this.getMimeType(imagePath)
                                    }
                                }
                            ])];
                    case 2:
                        result = _a.sent();
                        return [4 /*yield*/, result.response];
                    case 3:
                        response = _a.sent();
                        responseText = response.text();
                        fallback = {
                            extractedText: 'Failed to extract text',
                            translation: 'Translation failed',
                            culturalContext: 'Image processing is temporarily unavailable.'
                        };
                        result_parsed = this.parseAIResponse(responseText, fallback);
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, fs_1.promises.unlink(imagePath)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        unlinkError_1 = _a.sent();
                        console.error('Failed to delete uploaded file:', unlinkError_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, result_parsed];
                    case 8:
                        error_2 = _a.sent();
                        console.error('Image translation error:', error_2);
                        _a.label = 9;
                    case 9:
                        _a.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, fs_1.promises.unlink(imagePath)];
                    case 10:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        unlinkError_2 = _a.sent();
                        console.error('Failed to delete uploaded file after error:', unlinkError_2);
                        return [3 /*break*/, 12];
                    case 12: throw new Error('Image translation service failed');
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Start or continue chat conversation
     */
    AIService.prototype.chatWithAI = function (config, messages) {
        return __awaiter(this, void 0, void 0, function () {
            var language, conversationId, systemPrompt, chat, model, prompt_3, lastMessage, result, response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        language = config.language, conversationId = config.conversationId, systemPrompt = config.systemPrompt;
                        chat = this.conversationStore.get(conversationId);
                        if (!chat) {
                            model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
                            prompt_3 = systemPrompt || this.getChatPrompt(language);
                            chat = model.startChat({
                                history: [
                                    {
                                        role: "user",
                                        parts: [{ text: prompt_3 }],
                                    },
                                    {
                                        role: "model",
                                        parts: [{ text: "I understand. I'm Samvaad AI, ready to help you communicate in ".concat(language, " with cultural awareness.") }],
                                    },
                                ],
                                generationConfig: {
                                    maxOutputTokens: 150,
                                    temperature: 0.7,
                                },
                            });
                            this.conversationStore.set(conversationId, chat);
                        }
                        lastMessage = messages[messages.length - 1];
                        return [4 /*yield*/, chat.sendMessage(lastMessage.content)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, result.response];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.text()];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Chat error:', error_3);
                        throw new Error('Chat service failed');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clear conversation history
     */
    AIService.prototype.clearConversation = function (conversationId) {
        this.conversationStore.delete(conversationId);
    };
    /**
     * Chat with AI about a PDF document
     */
    AIService.prototype.chatWithPdf = function (question_1, pdfText_1) {
        return __awaiter(this, arguments, void 0, function (question, pdfText, language) {
            var model, prompt_4, result, response, error_4;
            if (language === void 0) { language = 'en'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
                        prompt_4 = "You are a helpful assistant that answers questions based on the provided text in the specified language.\n      Given the following document, please answer the user's question in ".concat(language, ".\n      \n      Document:\n      ---\n      ").concat(pdfText, "\n      ---\n      \n      Question: ").concat(question, "\n      \n      Answer:");
                        return [4 /*yield*/, model.generateContent(prompt_4)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, result.response];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.text()];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Chat with PDF error:', error_4);
                        throw new Error('Chat with PDF service failed');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get active conversation count
     */
    AIService.prototype.getActiveConversationCount = function () {
        return this.conversationStore.size;
    };
    return AIService;
}());
// Create and export singleton instance
exports.aiService = new AIService();
