import { google } from "googleapis";
import googleOAuthClient, { openai } from "../oauthcredential/credential";
import nodemailer from "nodemailer";

class EmailService {
  async generateGoogleAuthUrl() {
    try {
      const serviceScope = [
        "https://mail.google.com/",
        "https://www.googleapis.com/auth/gmail.send",
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

  async connectGoogleAccount(code: string) {
    try {
      const { tokens } = await googleOAuthClient.getToken(code);
      googleOAuthClient.setCredentials(tokens);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async fetchEmails() {
    try {
      const gmail = google.gmail({ version: "v1", auth: googleOAuthClient });
      const res = await gmail.users.messages.list({
        userId: "me",
        labelIds: ["INBOX"],
        maxResults: 1,
      });
      const messages = res.data.messages || [];
      for (const message of messages) {
        const msgRes = await gmail.users.messages.get({
          userId: "me",
          id: message.id || "",
        });
        const msg = msgRes.data;
        const emailContent = this.extractEmailContent(msg);
        const category = await this.categorizeEmail(emailContent);

        const response = this.sendAutomatedReply(category, msg);

        return response;
      }
    } catch (error) {
      console.log(error);
    }
  }

  extractEmailContent(message: any): string {
    const emailContent = message.snippet || "";
    return emailContent;
  }

  async categorizeEmail(emailContent: string) {
    try {
      const completionChat = await openai.chat.completions.create({
        messages: [{ role: "user", content: `${emailContent}` }],
        model: "gpt-3.5-turbo",
        max_tokens: 50,
      });

      // Extract relevant information from the completion
      const responseMessage = completionChat.choices[0]?.message?.content;

      // Based on the response text, categorize the email
      let category = "Other";
      if (responseMessage?.includes("interested")) {
        category = "Interested";
      } else if (responseMessage?.includes("not interested")) {
        category = "Not Interested";
      } else if (responseMessage?.includes("more information")) {
        category = "More Information";
      }
      return category;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async sendEmail(replyMsg: any, to: string, from: string) {
    const subject: string = replyMsg.replySubject;
    const body: string = replyMsg.replyBody;

    try {
      const auth: any = {
        type: "OAuth2",
        user: from,
        clientId: process.env.clientId,
        clientSecret: process.env.clientSecret,
        accessToken: googleOAuthClient.credentials.access_token,
      };
      // Create transporter
      const transport = nodemailer.createTransport({
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
      const response = await transport.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  async sendAutomatedReply(category: string, msg: any) {
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
      await this.sendEmail(replyMsg, senderEmail, recipientEmail);
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
          console.log(header.value);
          const emailStartIndex = header.value.indexOf("<");
          const emailEndIndex = header.value.indexOf(">");
          senderEmail = header.value.substring(
            emailStartIndex + 1,
            emailEndIndex
          );
          break;
        }
      }
      console.log(senderEmail);
      return senderEmail;
    } catch (error) {
      console.error("Error extracting recipient email:", error);
      throw error;
    }
  }
}

const EmailserviceObject = new EmailService();

export default EmailserviceObject;
