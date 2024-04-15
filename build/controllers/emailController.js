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
exports.getGoogleResponse = exports.getAuthorisationUrl = void 0;
const emailservice_1 = __importDefault(require("./emailservice"));
const credential_1 = __importDefault(require("../oauthcredential/credential"));
const googleapis_1 = require("googleapis");
// Redirect to the authorisation url
const getAuthorisationUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUrl = (yield emailservice_1.default.generateGoogleAuthUrl()) || "";
    res.redirect(authUrl);
});
exports.getAuthorisationUrl = getAuthorisationUrl;
const getGoogleResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const code = req.query.code;
        // Get tokens from Google OAuth client
        const { tokens } = yield credential_1.default.getToken(code);
        const { refresh_token, access_token } = tokens;
        // Connect Google account with Email service
        if (refresh_token) {
            req.session.googleRefreshToken = refresh_token;
            credential_1.default.setCredentials({ refresh_token, access_token });
            const peopleApi = googleapis_1.google.people({
                version: "v1",
                auth: credential_1.default,
            });
            const userProfile = yield peopleApi.people.get({
                resourceName: "people/me",
                personFields: "names",
            });
            // Extract the user's name and email from the profile response
            const userName = (_b = (_a = userProfile.data.names) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.displayName;
            req.session.senderName = userName || "Anonymous";
            yield emailservice_1.default.fetchEmails(req);
            return res.status(201).json({ message: "Automated mail has sent" });
        }
        else {
            return res.status(500).json({ message: "Missing refresh_token" });
        }
    }
    catch (error) {
        console.error("Error fetching tokens:", error);
        return res.status(500).send("Error occurred during authorization.");
    }
});
exports.getGoogleResponse = getGoogleResponse;
