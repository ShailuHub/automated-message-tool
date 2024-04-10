"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
const googleapis_1 = require("googleapis");
const openai_1 = __importDefault(require("openai"));
const googleClientId = process.env.clientId;
const googleClientSecret = process.env.clientSecret;
const googleRedirectedUrl = process.env.redirectedUrl;
const openaiKey = process.env.openaiKey;
const googleOAuthClient = new googleapis_1.google.auth.OAuth2(googleClientId, googleClientSecret, googleRedirectedUrl);
const openai = new openai_1.default({ apiKey: openaiKey });
exports.openai = openai;
exports.default = googleOAuthClient;
