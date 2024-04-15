import { google } from "googleapis";
import OpenAI from "openai";
// To obtain access tokens for accessing the Microsoft Graph API or other servie

import { GoogleGenerativeAI } from "@google/generative-ai";

const googleClientId = process.env.clientId || "";
const googleClientSecret = process.env.clientSecret || "";
const googleRedirectedUrl = process.env.redirectedUrl || "";
const openaiKey = process.env.openaiKey || "";
const googleaiKey = process.env.googleaiKey || "";

const googleOAuthClient = new google.auth.OAuth2(
  googleClientId,
  googleClientSecret,
  googleRedirectedUrl
);

const genAI = new GoogleGenerativeAI(googleaiKey);

const openai = new OpenAI({ apiKey: openaiKey });
export default googleOAuthClient;
export { openai, genAI };
