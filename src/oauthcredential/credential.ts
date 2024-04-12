import { google } from "googleapis";
import OpenAI from "openai";
// To obtain access tokens for accessing the Microsoft Graph API or other servie
import {
  PublicClientApplication,
  ConfidentialClientApplication,
} from "@azure/msal-node";

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

const pca = new PublicClientApplication(msalConfig);

const ccaConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    clientSecret,
  },
};

const cca = new ConfidentialClientApplication(ccaConfig);

const openai = new OpenAI({ apiKey: openaiKey });
export default googleOAuthClient;
export { openai, cca, pca, genAI };
