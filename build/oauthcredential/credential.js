"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genAI = exports.openai = void 0;
const googleapis_1 = require("googleapis");
const openai_1 = __importDefault(require("openai"));
// To obtain access tokens for accessing the Microsoft Graph API or other servie
const generative_ai_1 = require("@google/generative-ai");
const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const googleClientSecret = process.env.GOOGLE_SECRET_ID || "";
const googleRedirectedUrl = process.env.GOOGLE_REDIRECT_URL || "";
const openaiKey = process.env.OPEN_AI_KEY || "";
const googleaiKey = process.env.GOOGLE_API_KEY || "";
const googleOAuthClient = new googleapis_1.google.auth.OAuth2(googleClientId, googleClientSecret, googleRedirectedUrl);
const genAI = new generative_ai_1.GoogleGenerativeAI(googleaiKey);
exports.genAI = genAI;
const openai = new openai_1.default({ apiKey: openaiKey });
exports.openai = openai;
exports.default = googleOAuthClient;
