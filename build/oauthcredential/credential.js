"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genAI = exports.pca = exports.cca = exports.openai = void 0;
const googleapis_1 = require("googleapis");
const openai_1 = __importDefault(require("openai"));
// To obtain access tokens for accessing the Microsoft Graph API or other servie
const msal_node_1 = require("@azure/msal-node");
const generative_ai_1 = require("@google/generative-ai");
const googleClientId = process.env.clientId || "";
const googleClientSecret = process.env.clientSecret || "";
const googleRedirectedUrl = process.env.redirectedUrl || "";
const openaiKey = process.env.openaiKey || "";
const googleaiKey = process.env.googleaiKey || "";
const googleOAuthClient = new googleapis_1.google.auth.OAuth2(googleClientId, googleClientSecret, googleRedirectedUrl);
const genAI = new generative_ai_1.GoogleGenerativeAI(googleaiKey);
exports.genAI = genAI;
const clientId = process.env.msClientId || "";
const clientSecret = process.env.msClientSecret || "";
const tenantId = process.env.msTanentId || "";
const redirectUri = process.env.msRedirectedUrl || "";
const msalConfig = {
    auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri,
    },
};
const pca = new msal_node_1.PublicClientApplication(msalConfig);
exports.pca = pca;
const ccaConfig = {
    auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        clientSecret,
    },
};
const cca = new msal_node_1.ConfidentialClientApplication(ccaConfig);
exports.cca = cca;
const openai = new openai_1.default({ apiKey: openaiKey });
exports.openai = openai;
exports.default = googleOAuthClient;
