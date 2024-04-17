import { ConfidentialClientApplication } from "@azure/msal-node";

const msClientId = process.env.MS_CLIENT_ID || "";
const msClientSecret = process.env.MS_SECRET_ID || "";
const msTanentId = process.env.MS_TANENT_ID || "";

const cca = new ConfidentialClientApplication({
  auth: {
    clientId: msClientId,
    authority: `https://login.microsoftonline.com/${msTanentId}`,
    clientSecret: msClientSecret,
  },
});

export { cca };
