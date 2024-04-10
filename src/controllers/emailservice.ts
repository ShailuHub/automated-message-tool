import { google } from "googleapis";
import googleOAuthClient, { openai } from "../oauthcredential/credential";

class EmailService {
  async generateGoogleAuthUrl() {
    try {
      const serviceScope = ["https://mail.google.com/"];
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
      const gmail = google.gmail({ version: "v1", auth: googleOAuthClient });
      const email = `
        From: ${from}
        To: ${to}
        Subject: ${subject}

        ${body}
      `;

      const base64EncodedEmail = Buffer.from(email).toString("base64");
      const response = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: base64EncodedEmail,
        },
      });
      console.log("Email sent:", response.data);
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

      const recipientEmail = this.extractRecipientEmail(msg);
      const sendEmail = this.extractSenderEmail(msg);
      console.log(recipientEmail, sendEmail);
      // Send the automated reply using Gmail API
      await this.sendEmail(replyMsg, recipientEmail, sendEmail);
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

export default EmailserviceObject;
