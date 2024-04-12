"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsEmailServiceObject = void 0;
const googleapis_1 = require("googleapis");
const credential_1 = __importStar(require("../oauthcredential/credential"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const credential_2 = require("../oauthcredential/credential");
class EmailService {
    // Genrating the google consent page url for the user
    generateGoogleAuthUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serviceScope = [
                    "https://mail.google.com/",
                    "https://www.googleapis.com/auth/gmail.send",
                ];
                const authUrl = credential_1.default.generateAuthUrl({
                    access_type: "offline",
                    scope: serviceScope,
                });
                return authUrl;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    // Exchanging the auth code for access token and set the credentials to googleAuthClient
    connectGoogleAccount(code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tokens } = yield credential_1.default.getToken(code);
                credential_1.default.setCredentials(tokens);
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    // Fetching the mails of the connected gmail account
    fetchEmails() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gmail = googleapis_1.google.gmail({ version: "v1", auth: credential_1.default });
                const res = yield gmail.users.messages.list({
                    userId: "me",
                    labelIds: ["INBOX"],
                    maxResults: 1,
                });
                const messages = res.data.messages || [];
                for (const message of messages) {
                    const msgRes = yield gmail.users.messages.get({
                        userId: "me",
                        id: message.id || "",
                    });
                    const msg = msgRes.data;
                    const emailContent = this.extractEmailContent(msg);
                    const category = yield this.categorizeEmail(emailContent);
                    const response = this.sendAutomatedReply(category, msg);
                    return response;
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    // Extracting the email or body of the mail from msg
    extractEmailContent(message) {
        const emailContent = message.snippet || "";
        return emailContent;
    }
    // CategorizeEmail according to the context of the mail using openai
    categorizeEmail(emailContent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const prompt = `Please categorize this email into one of the following categories: Interested, Not Interested, More Information\nEmail Content: ${emailContent}`;
                // const completionChat = await openai.chat.completions.create({
                //   messages: [{ role: "user", content: `${prompt}` }],
                //   model: "gpt-3.5-turbo",
                //   max_tokens: 50,
                // });
                const prompt = `Please categorize this email into one of the following categories: Interested, Not Interested, More Information\nEmail Content: ${emailContent}`;
                const genrativeAiModel = credential_1.genAI.getGenerativeModel({
                    model: "gemini-pro",
                });
                const responseContent = yield genrativeAiModel.generateContent(prompt);
                const category = responseContent.response.text();
                if (["Interested", "Not Interested", "More Information"].includes(category)) {
                    return category;
                }
                throw new Error("Invalid category");
                // const responseMessage = completionChat.choices[0]?.message?.content;
                // Based on the response text, categorize the email
                // let category = "Other";
                // if (responseMessage?.includes("interested")) {
                //   category = "Interested";
                // } else if (responseMessage?.includes("not interested")) {
                //   category = "Not Interested";
                // } else if (responseMessage?.includes("more information")) {
                //   category = "More Information";
                // }
                // return category;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    // Send automated mail back to the sender of the mail
    sendEmail(replyMsg, to, from) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = replyMsg.replySubject;
            const body = replyMsg.replyBody;
            try {
                const auth = {
                    type: "OAuth2",
                    user: from,
                    clientId: process.env.clientId,
                    clientSecret: process.env.clientSecret,
                    accessToken: credential_1.default.credentials.access_token,
                };
                // Create transporter
                const transport = nodemailer_1.default.createTransport({
                    service: "gmail",
                    auth: auth,
                });
                const mailOptions = {
                    from: from,
                    to: to,
                    subject: subject,
                    text: body,
                    html: `<h1>Hello from Gmail</h1><p>${body}</p>`,
                };
                const response = yield transport.sendMail(mailOptions);
            }
            catch (error) {
                console.error("Error sending email:", error);
            }
        });
    }
    // Generating automated mail on the basis of the category
    sendAutomatedReply(category, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const replyMsg = { replySubject: "", replyBody: "" };
                // Generate reply message based on the category
                switch (category) {
                    case "Interested":
                        replyMsg.replySubject = "Thank you for your interest!";
                        replyMsg.replyBody =
                            "We would be happy to provide more information. Could you please let us know a convenient time for a demo call?";
                        break;
                    case "Not Interested":
                        replyMsg.replySubject = "Thank you for considering our offer.";
                        replyMsg.replyBody =
                            "If you have any further questions, feel free to reach out.";
                        break;
                    case "More Information":
                        replyMsg.replySubject = "Additional information about our product";
                        replyMsg.replyBody =
                            "Sure! Here are some additional details about our product.";
                        break;
                    default:
                        replyMsg.replySubject = "Thank you for your email.";
                        replyMsg.replyBody = "We'll get back to you as soon as possible.";
                        break;
                }
                const recipientEmail = this.extractRecipientEmail(msg)
                    .trim()
                    .toLowerCase();
                const senderEmail = this.extractSenderEmail(msg).trim().toLowerCase();
                // Send the automated reply using Gmail API
                yield this.sendEmail(replyMsg, senderEmail, recipientEmail);
            }
            catch (error) {
                console.error("Error sending automated reply:", error);
            }
        });
    }
    // Extracting them mailId of the reciepeint from the message
    extractRecipientEmail(message) {
        try {
            const headers = message.payload.headers;
            let recipientEmail = "";
            for (const header of headers) {
                if (header.name === "To") {
                    recipientEmail = header.value;
                    break;
                }
            }
            return recipientEmail;
        }
        catch (error) {
            console.error("Error extracting recipient email:", error);
            throw error;
        }
    }
    // Extracting them mailId of the sender from the message
    extractSenderEmail(message) {
        try {
            const headers = message.payload.headers;
            let senderEmail = "";
            for (const header of headers) {
                if (header.name === "From") {
                    console.log(header.value);
                    const emailStartIndex = header.value.indexOf("<");
                    const emailEndIndex = header.value.indexOf(">");
                    senderEmail = header.value.substring(emailStartIndex + 1, emailEndIndex);
                    break;
                }
            }
            return senderEmail;
        }
        catch (error) {
            console.error("Error extracting recipient email:", error);
            throw error;
        }
    }
}
class MsEmailService {
    // Method to connect to Microsoft email service
    connectMsAccount(code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tokenRequest = {
                    code: code || "",
                    scopes: ["openid", "profile", "offline_access", "User.Read"],
                    redirectUri: process.env.msRedirectedUrl || "",
                    clientSecret: process.env.msClientSecret || "",
                    clientId: process.env.msClientId || "",
                    authority: `https://login.microsoftonline.com/${process.env.msTanentId || ""}`,
                };
                const tokens = yield credential_2.pca.acquireTokenByCode(tokenRequest);
                return tokens;
            }
            catch (error) {
                console.error("Error connecting to Microsoft email service:", error);
                throw error;
            }
        });
    }
    generateMsAuthUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            const authCodeUrlParameters = {
                scopes: ["https://graph.microsoft.com/.default"],
                redirectUri: process.env.msRedirectedUrl || "",
            };
            try {
                const authUrl = yield credential_2.pca.getAuthCodeUrl(authCodeUrlParameters);
                return authUrl;
            }
            catch (error) {
                console.error("Error generating Microsoft auth URL:", error);
                throw error;
            }
        });
    }
    getMsAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tokenRequest = {
                    scopes: ["https://graph.microsoft.com/.default"],
                    clientSecret: process.env.msClientSecret || "",
                };
                const response = yield credential_2.cca.acquireTokenByClientCredential(tokenRequest);
                if (response && response.accessToken) {
                    return response.accessToken;
                }
                return "";
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
}
const EmailserviceObject = new EmailService();
const MsEmailServiceObject = new MsEmailService();
exports.MsEmailServiceObject = MsEmailServiceObject;
exports.default = EmailserviceObject;
