"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cca = void 0;
const msal_node_1 = require("@azure/msal-node");
const msClientId = process.env.MS_CLIENT_ID || "";
const msClientSecret = process.env.MS_SECRET_ID || "";
const msTanentId = process.env.MS_TANENT_ID || "";
const cca = new msal_node_1.ConfidentialClientApplication({
    auth: {
        clientId: msClientId,
        authority: `https://login.microsoftonline.com/${msTanentId}`,
        clientSecret: msClientSecret,
    },
});
exports.cca = cca;
