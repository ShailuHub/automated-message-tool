import { google } from "googleapis";
import OpenAI from "openai";

const googleClientId = process.env.clientId;
const googleClientSecret = process.env.clientSecret;
const googleRedirectedUrl = process.env.redirectedUrl;
const openaiKey = process.env.openaiKey;

const googleOAuthClient = new google.auth.OAuth2(
  googleClientId,
  googleClientSecret,
  googleRedirectedUrl
);

const openai = new OpenAI({ apiKey: openaiKey });
export default googleOAuthClient;
export { openai };
