import { Request, Response } from "express";
import { EmailserviceObject } from "./emailservice";
import { MsEmailServiceObject } from "./msEmailservice";
import googleOAuthClient from "../oauthcredential/credential";
import { cca } from "../oauthcredential/outlookCredentail";
import { google } from "googleapis";
import Axios from "axios";

// Redirect to the authorization URL for Google
const getAuthorisationUrl = async (req: Request, res: Response) => {
  try {
    const authUrl = await EmailserviceObject.generateGoogleAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error("Error generating Google authorization URL:", error);
    res.status(500).send("Error occurred during authorization.");
  }
};

// Redirect to the authorization URL for Microsoft
const getMsAuthorisationUrl = async (req: Request, res: Response) => {
  try {
    const authUrl = await MsEmailServiceObject.generateMicrosoftAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error("Error generating Microsoft authorization URL:", error);
    res.status(500).send("Error occurred during authorization.");
  }
};

// Callback route for Google OAuth authentication
const getGoogleResponse = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const { tokens } = await googleOAuthClient.getToken(code);
    const { refresh_token, access_token } = tokens;

    if (refresh_token) {
      req.session.googleRefreshToken = refresh_token;
      googleOAuthClient.setCredentials({ refresh_token, access_token });
      const peopleApi = google.people({
        version: "v1",
        auth: googleOAuthClient,
      });
      const userProfile = await peopleApi.people.get({
        resourceName: "people/me",
        personFields: "names,emailAddresses",
      });
      const userEmail = userProfile.data.emailAddresses?.[0]?.value || "";
      const userName = userProfile.data.names?.[0]?.displayName;
      req.session.senderName = userName || "Anonymous";
      await EmailserviceObject.fetchEmails(req, userEmail);
      res.status(201).json({ message: "Automated mail has been sent" });
    } else {
      res.status(500).json({ message: "Missing refresh_token" });
    }
  } catch (error) {
    console.error("Error fetching tokens:", error);
    res.status(500).send("Error occurred during authorization.");
  }
};

// Callback route for Microsoft OAuth authentication
const getMicrosoftResponse = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const tokenRequest = {
      code: code,
      scopes: ["https://graph.microsoft.com/.default"],
      redirectUri: process.env.MS_REDIRECT_URL || "",
      clientSecret: process.env.MS_SECRET_ID || "",
    };
    const response = await cca.acquireTokenByCode(tokenRequest);
    req.session.msClientAccessToken = response.accessToken;
    await getOutlookMails(req, res);
  } catch (error) {
    console.error("Error in obtaining access token:", error);
    res.status(500).json({ message: error });
  }
};

const getOutlookMails = async (req: Request, res: Response) => {
  // Retrieve the access token from the session or wherever it's stored
  const accessToken = req.session.msClientAccessToken;

  if (!accessToken) {
    // If the access token is not available, return an error
    return res
      .status(401)
      .send("Access token not found. Please authenticate first.");
  }

  try {
    // Use the retrieved access token to make a request to the Microsoft Graph API endpoint
    const graphEndpoint = "https://graph.microsoft.com/v1.0/me/messages";
    const graphResponse = await Axios.get(graphEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const mails = graphResponse.data;
    res.json(mails);
  } catch (error) {
    console.error("Error fetching mails:", error);
    res.status(500).send(error);
  }
};

export {
  getAuthorisationUrl,
  getGoogleResponse,
  getMsAuthorisationUrl,
  getMicrosoftResponse,
  getOutlookMails,
};
