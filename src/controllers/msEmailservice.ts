import { cca } from "../oauthcredential/outlookCredentail";

class MsEmailService {
  async generateMicrosoftAuthUrl() {
    try {
      const serviceScope = ["https://graph.microsoft.com/.default"];
      const authUrl = await cca.getAuthCodeUrl({
        scopes: serviceScope,
        redirectUri: process.env.MS_REDIRECT_URL || "",
      });
      return authUrl;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

const MsEmailServiceObject = new MsEmailService();
export { MsEmailServiceObject };
