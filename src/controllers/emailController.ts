import { Request, Response } from "express";
import EmailserviceObject, { MsEmailServiceObject } from "./emailservice";

// Redirect to the authorisation url
const getAuthorisationUrl = async (req: Request, res: Response) => {
  const authUrl = (await EmailserviceObject.generateGoogleAuthUrl()) || "";
  res.redirect(authUrl);
};

// Redirect to the Ms authorisation url
const getMsAuthorisationUrl = async (req: Request, res: Response) => {
  const authUrl = (await MsEmailServiceObject.generateMsAuthUrl()) || "";
  res.redirect(authUrl);
};

// Get the access Token
const getMsAccessToken = async (req: Request, res: Response) => {
  const accessToken = (await MsEmailServiceObject.getMsAccessToken()) || "";
  req.session.clientAccessToken = accessToken;
  res.send("Access code successfully sent to you");
};

// Handle user on granting permission
const getGoogleResponse = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  try {
    await EmailserviceObject.connectGoogleAccount(code);
    await EmailserviceObject.fetchEmails();
    res.status(201).json({ message: "Automated reply has sent successfully" });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    res.status(500).send("Error occurred during authorization.");
  }
};

// Save the ms access token
const getMicrosoftResponse = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  try {
    const authResult = await MsEmailServiceObject.connectMsAccount(code);
    if (authResult && authResult.accessToken) {
      const { accessToken } = authResult;
      req.session.accessToken = accessToken;
      res.redirect("/ms-access-token");
    } else {
      throw new Error("Authentication failed or access token not found.");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export {
  getAuthorisationUrl,
  getGoogleResponse,
  getMsAuthorisationUrl,
  getMicrosoftResponse,
  getMsAccessToken,
};
