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
const googleapis_1 = require("googleapis");
const credential_1 = __importDefault(require("../oauthcredential/credential"));
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
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
                    console.log(msg);
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
    extractEmailContent(message) {
        const emailContent = message.snippet || "";
        return emailContent;
    }
    categorizeEmail(emailContent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const completionChat = await openai.chat.completions.create({
                //   messages: [{ role: "user", content: `${emailContent}` }],
                //   model: "gpt-3.5-turbo",
                //   max_tokens: 50,
                // });
                // // Extract relevant information from the completion
                // const responseMessage = completionChat.choices[0]?.message?.content;
                //Hard code
                const responseMessage = "Thank you very much for reaching out. I am interested in lerning more about your product";
                // Based on the response text, categorize the email
                let category = "Other";
                if (responseMessage === null || responseMessage === void 0 ? void 0 : responseMessage.includes("interested")) {
                    category = "Interested";
                }
                else if (responseMessage === null || responseMessage === void 0 ? void 0 : responseMessage.includes("not interested")) {
                    category = "Not Interested";
                }
                else if (responseMessage === null || responseMessage === void 0 ? void 0 : responseMessage.includes("more information")) {
                    category = "More Information";
                }
                return category;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    sendEmail(replyMsg, to, from) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = replyMsg.replySubject;
            const body = replyMsg.replyBody;
            console.log("to:" + to);
            console.log("from" + from);
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
                    html: `<h1>Hello from Gmail</h1>`,
                };
                const response = yield transport.sendMail(mailOptions);
                // const gmail = google.gmail({ version: "v1", auth: googleOAuthClient });
                // const email = `
                //   from: ${from}
                //   to: ${to}
                //   subject: ${subject}
                //   ${body}
                // `;
                // console.log(email);
                // const base64EncodedEmail = Buffer.from(email).toString("base64");
                // const response = await gmail.users.messages.send({
                //   userId: "me",
                //   requestBody: {
                //     raw: base64EncodedEmail,
                //   },
                // });
                // console.log("Email sent:", response.data);
            }
            catch (error) {
                console.error("Error sending email:", error);
            }
        });
    }
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
            console.log(senderEmail);
            return senderEmail;
        }
        catch (error) {
            console.error("Error extracting recipient email:", error);
            throw error;
        }
    }
}
const EmailserviceObject = new EmailService();
exports.default = EmailserviceObject;
