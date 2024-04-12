import { google } from "googleapis";
import googleOAuthClient, {
  genAI,
  openai,
} from "../oauthcredential/credential";
import nodemailer from "nodemailer";
import { pca, cca } from "../oauthcredential/credential";

class EmailService {
  // Genrating the google consent page url for the user
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

  // Exchanging the auth code for access token and set the credentials to googleAuthClient
  async connectGoogleAccount(code: string) {
    try {
      const { tokens } = await googleOAuthClient.getToken(code);
      googleOAuthClient.setCredentials(tokens);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Fetching the mails of the connected gmail account
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

  // Extracting the email or body of the mail from msg
  extractEmailContent(message: any): string {
    const emailContent = message.snippet || "";
    return emailContent;
  }

  // CategorizeEmail according to the context of the mail using openai
  async categorizeEmail(emailContent: string) {
    try {
      // const prompt = `Please categorize this email into one of the following categories: Interested, Not Interested, More Information\nEmail Content: ${emailContent}`;
      // const completionChat = await openai.chat.completions.create({
      //   messages: [{ role: "user", content: `${prompt}` }],
      //   model: "gpt-3.5-turbo",
      //   max_tokens: 50,
      // });

      const prompt = `Please categorize given below email content into one of the following categories: Interested, Not Interested, More Information\nEmail Content: ${emailContent}`;

      const genrativeAiModel = genAI.getGenerativeModel({
        model: "gemini-pro",
      });
      const responseContent = await genrativeAiModel.generateContent(prompt);
      const category = responseContent.response.text();
      if (
        ["Interested", "Not Interested", "More Information"].includes(category)
      ) {
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
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Send automated mail back to the sender of the mail
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
        html: `<p>${body}</p>`,
      };
      const response = await transport.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  // Generating automated mail on the basis of the category
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
          replyMsg.replySubject = "Additional information about your product";
          replyMsg.replyBody =
            "Sorry! I need more information i can't categorise your mail in following categories: Interested, Not interested";
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

  // Extracting them mailId of the reciepeint from the message
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

  // Extracting them mailId of the sender from the message
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
      return senderEmail;
    } catch (error) {
      console.error("Error extracting recipient email:", error);
      throw error;
    }
  }
}

class MsEmailService {
  // Method to connect to Microsoft email service
  async connectMsAccount(code: string) {
    try {
      const tokenRequest = {
        code: code || "",
        scopes: ["openid", "profile", "offline_access", "User.Read"],
        redirectUri: process.env.msRedirectedUrl || "",
        clientSecret: process.env.msClientSecret || "",
        clientId: process.env.msClientId || "",
        authority: `https://login.microsoftonline.com/${
          process.env.msTanentId || ""
        }`,
      };

      const tokens = await pca.acquireTokenByCode(tokenRequest);
      return tokens;
    } catch (error) {
      console.error("Error connecting to Microsoft email service:", error);
      throw error;
    }
  }

  async generateMsAuthUrl() {
    const authCodeUrlParameters = {
      scopes: ["https://graph.microsoft.com/.default"],
      redirectUri: process.env.msRedirectedUrl || "",
    };

    try {
      const authUrl = await pca.getAuthCodeUrl(authCodeUrlParameters);
      return authUrl;
    } catch (error) {
      console.error("Error generating Microsoft auth URL:", error);
      throw error;
    }
  }

  async getMsAccessToken() {
    try {
      const tokenRequest = {
        scopes: ["https://graph.microsoft.com/.default"],
        clientSecret: process.env.msClientSecret || "",
      };

      const response = await cca.acquireTokenByClientCredential(tokenRequest);
      if (response && response.accessToken) {
        return response.accessToken;
      }
      return "";
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

const EmailserviceObject = new EmailService();
const MsEmailServiceObject = new MsEmailService();
export default EmailserviceObject;
export { MsEmailServiceObject };
