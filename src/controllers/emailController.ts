import { Request, Response } from "express";
import EmailserviceObject from "./emailservice";
import googleOAuthClient from "../oauthcredential/credential";
import { google } from "googleapis";

// Redirect to the authorisation url
const getAuthorisationUrl = async (req: Request, res: Response) => {
  const authUrl = (await EmailserviceObject.generateGoogleAuthUrl()) || "";
  res.redirect(authUrl);
};

const getGoogleResponse = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    // Get tokens from Google OAuth client
    const { tokens } = await googleOAuthClient.getToken(code);
    const { refresh_token, access_token } = tokens;
    // Connect Google account with Email service
    if (refresh_token) {
      req.session.googleRefreshToken = refresh_token;
      googleOAuthClient.setCredentials({ refresh_token, access_token });
      const peopleApi = google.people({
        version: "v1",
        auth: googleOAuthClient,
      });
      const userProfile = await peopleApi.people.get({
        resourceName: "people/me",
        personFields: "names",
      });

      // Extract the user's name and email from the profile response
      const userName = userProfile.data.names?.[0]?.displayName;
      req.session.senderName = userName || "Anonymous";
      await EmailserviceObject.fetchEmails(req);
      return res.status(201).json({ message: "Automated mail has sent" });
    } else {
      return res.status(500).json({ message: "Missing refresh_token" });
    }
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return res.status(500).send("Error occurred during authorization.");
  }
};

export { getAuthorisationUrl, getGoogleResponse };
