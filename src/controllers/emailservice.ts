import { google } from "googleapis";
import nodemailer from "nodemailer";
import { Request } from "express";
import googleOAuthClient from "../oauthcredential/credential";
import { genAI } from "../oauthcredential/credential";

interface ReplyMessage {
  replySubject: string;
  replyBody: string;
}

class EmailService {
  async generateGoogleAuthUrl() {
    try {
      const serviceScope = [
        "https://mail.google.com/",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ];
      const authUrl = googleOAuthClient.generateAuthUrl({
        access_type: "offline",
        scope: serviceScope,
      });
      return authUrl;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async fetchEmails(req: Request, userEmail: string) {
    try {
      const gmail = google.gmail({ version: "v1", auth: googleOAuthClient });
      const res = await gmail.users.messages.list({
        userId: "me",
        labelIds: ["INBOX"],
        maxResults: 1,
      });
      const messages = res.data.messages || [];
      if (messages.length === 0) {
        console.log("No messages found in the inbox.");
        return;
      }

      const sendEmailPromises = messages.map(async (message) => {
        const msgRes = await gmail.users.messages.get({
          userId: "me",
          id: message.id || "",
        });
        const msg = msgRes.data;
        const emailContent = msg.snippet || "";
        const category = await this.categorizeEmail(emailContent);
        if (
          ["Interested", "Not Interested", "More Information"].includes(
            category
          )
        ) {
          const msgContent = await this.sendAutomatedReply(msg, req);
          if (msgContent) {
            const { replyMsg, senderEmail } = msgContent;
            return this.sendEmail(replyMsg, senderEmail, userEmail, req);
          }
        } else {
          console.log("Invalid category for email:", category);
        }
      });

      await Promise.all(sendEmailPromises);
    } catch (error) {
      console.log("Error fetching or processing emails:", error);
    }
  }

  extractEmailContent(message: any): string {
    const emailContent = message.snippet || "";
    return emailContent;
  }

  async categorizeEmail(emailContent: string) {
    try {
      const prompt = `Please categorize given below email content into one of the following categories: Interested, Not Interested, More Information only. Among these words only\nEmail Content: ${emailContent}`;
      const genrativeAiModel = genAI.getGenerativeModel({
        model: "gemini-pro",
      });
      const responseContent = await genrativeAiModel.generateContent(prompt);
      const category = responseContent.response.text();
      return category;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async sendEmail(replyMsg: any, to: string, from: string, req: Request) {
    try {
      const { replySubject, replyBody } = replyMsg;
      const refresh_token = req.session.googleRefreshToken;
      googleOAuthClient.setCredentials({ refresh_token });
      const access_token = (await googleOAuthClient.getAccessToken()).token;
      const auth: any = {
        type: "OAuth2",
        user: from,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET_ID,
        refreshToken: refresh_token,
        accessToken: access_token,
      };
      const transport = nodemailer.createTransport({
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

      const response = await transport.sendMail(mailOptions);
      console.log(response.response);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  async sendAutomatedReply(msg: any, req: Request) {
    try {
      const recipientEmail = this.extractRecipientEmail(msg)
        .trim()
        .toLowerCase();
      const senderEmail = this.extractSenderEmail(msg).trim().toLowerCase();
      const senderName = req.session.senderName;

      const replyMsg: ReplyMessage = { replySubject: "", replyBody: "" };

      const prompt1 = `Please create one suitable subject not more than one line of chracter for mail having Subject: ${
        msg.payload.headers.find((header: any) => header.name === "Subject")
          ?.value
      }`;

      const prompt2 = `Please create a reply email for the following message:
Subject: ${
        msg.payload.headers.find((header: any) => header.name === "Subject")
          ?.value
      }
Content: ${this.extractEmailContent(
        msg
      )}. Please ensure to structure your reply with suitable paragraphs or indentation. Also, conclude the email with "Thanks" and "Regards, ${senderName}". Begin your main content with "Dear ${senderEmail}".`;

      const genrativeAiModel = genAI.getGenerativeModel({
        model: "gemini-pro",
      });
      const responseSubject = await genrativeAiModel.generateContent(prompt1);
      const responseContent = await genrativeAiModel.generateContent(prompt2);

      const automatedMsg = responseContent.response.text();
      const automatedSubject = responseSubject.response.text();

      replyMsg.replySubject = automatedSubject;
      replyMsg.replyBody = automatedMsg;

      return {
        replyMsg: replyMsg,
        senderEmail: senderEmail,
        recipientEmail: recipientEmail,
      };
    } catch (error) {
      console.error("Error sending automated reply:", error);
    }
  }

  extractRecipientEmail(message: any): string {
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
    } catch (error) {
      console.error("Error extracting recipient email:", error);
      throw error;
    }
  }

  extractSenderEmail(message: any): string {
    try {
      const headers = message.payload.headers;
      let senderEmail = "";
      for (const header of headers) {
        if (header.name === "From") {
          const emailStartIndex = header.value.indexOf("<");
          const emailEndIndex = header.value.indexOf(">");
          senderEmail = header.value.substring(
            emailStartIndex + 1,
            emailEndIndex
          );
          break;
        }
      }
      return senderEmail;
    } catch (error) {
      console.error("Error extracting recipient email:", error);
      throw error;
    }
  }
}

const EmailserviceObject = new EmailService();

export { EmailserviceObject };
