import { google } from "googleapis";
import OpenAI from "openai";
// To obtain access tokens for accessing the Microsoft Graph API or other servie

import { GoogleGenerativeAI } from "@google/generative-ai";

const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const googleClientSecret = process.env.GOOGLE_SECRET_ID || "";
const googleRedirectedUrl = process.env.GOOGLE_REDIRECT_URL || "";
const openaiKey = process.env.OPEN_AI_KEY || "";
const googleaiKey = process.env.GOOGLE_API_KEY || "";

const googleOAuthClient = new google.auth.OAuth2(
  googleClientId,
  googleClientSecret,
  googleRedirectedUrl
);

const genAI = new GoogleGenerativeAI(googleaiKey);

const openai = new OpenAI({ apiKey: openaiKey });
export default googleOAuthClient;
export { openai, genAI };
