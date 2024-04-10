import { Request, Response } from "express";
import EmailserviceObject from "./emailservice";

// Redirect to the authorisation url
const getAuthorisationUrl = async (req: Request, res: Response) => {
  const authUrl = (await EmailserviceObject.generateGoogleAuthUrl()) || "";
  res.redirect(authUrl);
};

// Handle user on granting permission
const getGoogleResponse = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  try {
    await EmailserviceObject.connectGoogleAccount(code);
    const messages = await EmailserviceObject.fetchEmails();
    res.send(messages);
  } catch (error) {
    console.error("Error fetching tokens:", error);
    res.status(500).send("Error occurred during authorization.");
  }
};

export { getAuthorisationUrl, getGoogleResponse };
