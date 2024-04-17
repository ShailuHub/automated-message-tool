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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailserviceObject = void 0;
const googleapis_1 = require("googleapis");
const nodemailer_1 = __importDefault(require("nodemailer"));
const credential_1 = __importDefault(require("../oauthcredential/credential"));
const credential_2 = require("../oauthcredential/credential");
class EmailService {
    generateGoogleAuthUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serviceScope = [
                    "https://mail.google.com/",
                    "https://www.googleapis.com/auth/gmail.send",
                    "https://www.googleapis.com/auth/userinfo.profile",
                    "https://www.googleapis.com/auth/userinfo.email",
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
    fetchEmails(req, userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gmail = googleapis_1.google.gmail({ version: "v1", auth: credential_1.default });
                const res = yield gmail.users.messages.list({
                    userId: "me",
                    labelIds: ["INBOX"],
                    maxResults: 1,
                });
                const messages = res.data.messages || [];
                if (messages.length === 0) {
                    console.log("No messages found in the inbox.");
                    return;
                }
                const sendEmailPromises = messages.map((message) => __awaiter(this, void 0, void 0, function* () {
                    const msgRes = yield gmail.users.messages.get({
                        userId: "me",
                        id: message.id || "",
                    });
                    const msg = msgRes.data;
                    const emailContent = msg.snippet || "";
                    const category = yield this.categorizeEmail(emailContent);
                    if (["Interested", "Not Interested", "More Information"].includes(category)) {
                        const msgContent = yield this.sendAutomatedReply(msg, req);
                        if (msgContent) {
                            const { replyMsg, senderEmail } = msgContent;
                            return this.sendEmail(replyMsg, senderEmail, userEmail, req);
                        }
                    }
                    else {
                        console.log("Invalid category for email:", category);
                    }
                }));
                yield Promise.all(sendEmailPromises);
            }
            catch (error) {
                console.log("Error fetching or processing emails:", error);
            }
        });
    }
    extractEmailContent(message) {
        const emailContent = message.snippet || "";
        return emailContent;
    }
    categorizeEmail(emailContent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prompt = `Please categorize given below email content into one of the following categories: Interested, Not Interested, More Information only. Among these words only\nEmail Content: ${emailContent}`;
                const genrativeAiModel = credential_2.genAI.getGenerativeModel({
                    model: "gemini-pro",
                });
                const responseContent = yield genrativeAiModel.generateContent(prompt);
                const category = responseContent.response.text();
                return category;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    sendEmail(replyMsg, to, from, req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { replySubject, replyBody } = replyMsg;
                const refresh_token = req.session.googleRefreshToken;
                credential_1.default.setCredentials({ refresh_token });
                const access_token = (yield credential_1.default.getAccessToken()).token;
                const auth = {
                    type: "OAuth2",
                    user: from,
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_SECRET_ID,
                    refreshToken: refresh_token,
                    accessToken: access_token,
                };
                const transport = nodemailer_1.default.createTransport({
                    service: "gmail",
                    auth: auth,
                });
                const mailOptions = {
                    from: from,
                    to: to,
                    subject: replySubject,
                    text: replyBody,
                    html: `<p>${replyBody}</p>`,
                };
                const response = yield transport.sendMail(mailOptions);
                console.log(response.response);
            }
            catch (error) {
                console.error("Error sending email:", error);
                throw error;
            }
        });
    }
    sendAutomatedReply(msg, req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const recipientEmail = this.extractRecipientEmail(msg)
                    .trim()
                    .toLowerCase();
                const senderEmail = this.extractSenderEmail(msg).trim().toLowerCase();
                const senderName = req.session.senderName;
                const replyMsg = { replySubject: "", replyBody: "" };
                const prompt1 = `Please create one suitable subject not more than one line of chracter for mail having Subject: ${(_a = msg.payload.headers.find((header) => header.name === "Subject")) === null || _a === void 0 ? void 0 : _a.value}`;
                const prompt2 = `Please create a reply email for the following message:
Subject: ${(_b = msg.payload.headers.find((header) => header.name === "Subject")) === null || _b === void 0 ? void 0 : _b.value}
Content: ${this.extractEmailContent(msg)}. Please ensure to structure your reply with suitable paragraphs or indentation. Also, conclude the email with "Thanks" and "Regards, ${senderName}". Begin your main content with "Dear ${senderEmail}".`;
                const genrativeAiModel = credential_2.genAI.getGenerativeModel({
                    model: "gemini-pro",
                });
                const responseSubject = yield genrativeAiModel.generateContent(prompt1);
                const responseContent = yield genrativeAiModel.generateContent(prompt2);
                const automatedMsg = responseContent.response.text();
                const automatedSubject = responseSubject.response.text();
                replyMsg.replySubject = automatedSubject;
                replyMsg.replyBody = automatedMsg;
                return {
                    replyMsg: replyMsg,
                    senderEmail: senderEmail,
                    recipientEmail: recipientEmail,
                };
            }
            catch (error) {
                console.error("Error sending automated reply:", error);
            }
        });
    }
    extractRecipientEmail(message) {
        try {
            const headers = message.payload.headers;
            let recipientEmail = "";
            for (const header of headers) {
                if (header.name === "To") {
                    console.log(header.value);
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
    extractSenderEmail(message) {
        try {
            const headers = message.payload.headers;
            let senderEmail = "";
            for (const header of headers) {
                if (header.name === "From") {
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
const EmailserviceObject = new EmailService();
exports.EmailserviceObject = EmailserviceObject;
