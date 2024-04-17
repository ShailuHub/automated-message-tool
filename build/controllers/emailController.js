"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutlookMails = exports.getMicrosoftResponse = exports.getMsAuthorisationUrl = exports.getGoogleResponse = exports.getAuthorisationUrl = void 0;
const emailservice_1 = require("./emailservice");
const msEmailservice_1 = require("./msEmailservice");
const credential_1 = __importDefault(require("../oauthcredential/credential"));
const outlookCredentail_1 = require("../oauthcredential/outlookCredentail");
const googleapis_1 = require("googleapis");
const axios_1 = __importDefault(require("axios"));
// Redirect to the authorization URL for Google
const getAuthorisationUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authUrl = yield emailservice_1.EmailserviceObject.generateGoogleAuthUrl();
        res.redirect(authUrl);
    }
    catch (error) {
        console.error("Error generating Google authorization URL:", error);
        res.status(500).send("Error occurred during authorization.");
    }
});
exports.getAuthorisationUrl = getAuthorisationUrl;
// Redirect to the authorization URL for Microsoft
const getMsAuthorisationUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authUrl = yield msEmailservice_1.MsEmailServiceObject.generateMicrosoftAuthUrl();
        res.redirect(authUrl);
    }
    catch (error) {
        console.error("Error generating Microsoft authorization URL:", error);
        res.status(500).send("Error occurred during authorization.");
    }
});
exports.getMsAuthorisationUrl = getMsAuthorisationUrl;
// Callback route for Google OAuth authentication
const getGoogleResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const code = req.query.code;
        const { tokens } = yield credential_1.default.getToken(code);
        const { refresh_token, access_token } = tokens;
        if (refresh_token) {
            req.session.googleRefreshToken = refresh_token;
            credential_1.default.setCredentials({ refresh_token, access_token });
            const peopleApi = googleapis_1.google.people({
                version: "v1",
                auth: credential_1.default,
            });
            const userProfile = yield peopleApi.people.get({
                resourceName: "people/me",
                personFields: "names,emailAddresses",
            });
            const userEmail = ((_b = (_a = userProfile.data.emailAddresses) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) || "";
            const userName = (_d = (_c = userProfile.data.names) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.displayName;
            req.session.senderName = userName || "Anonymous";
            yield emailservice_1.EmailserviceObject.fetchEmails(req, userEmail);
            res.status(201).json({ message: "Automated mail has been sent" });
        }
        else {
            res.status(500).json({ message: "Missing refresh_token" });
        }
    }
    catch (error) {
        console.error("Error fetching tokens:", error);
        res.status(500).send("Error occurred during authorization.");
    }
});
exports.getGoogleResponse = getGoogleResponse;
// Callback route for Microsoft OAuth authentication
const getMicrosoftResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const code = req.query.code;
        const tokenRequest = {
            code: code,
            scopes: ["https://graph.microsoft.com/.default"],
            redirectUri: process.env.MS_REDIRECT_URL || "",
            clientSecret: process.env.MS_SECRET_ID || "",
        };
        const response = yield outlookCredentail_1.cca.acquireTokenByCode(tokenRequest);
        req.session.msClientAccessToken = response.accessToken;
        yield getOutlookMails(req, res);
    }
    catch (error) {
        console.error("Error in obtaining access token:", error);
        res.status(500).json({ message: error });
    }
});
exports.getMicrosoftResponse = getMicrosoftResponse;
const getOutlookMails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const graphResponse = yield axios_1.default.get(graphEndpoint, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const mails = graphResponse.data;
        res.json(mails);
    }
    catch (error) {
        console.error("Error fetching mails:", error);
        res.status(500).send(error);
    }
});
exports.getOutlookMails = getOutlookMails;
