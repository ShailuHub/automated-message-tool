"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMsAccessToken = exports.getMicrosoftResponse = exports.getMsAuthorisationUrl = exports.getGoogleResponse = exports.getAuthorisationUrl = void 0;
const emailservice_1 = __importStar(require("./emailservice"));
// Redirect to the authorisation url
const getAuthorisationUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUrl = (yield emailservice_1.default.generateGoogleAuthUrl()) || "";
    res.redirect(authUrl);
});
exports.getAuthorisationUrl = getAuthorisationUrl;
// Redirect to the Ms authorisation url
const getMsAuthorisationUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUrl = (yield emailservice_1.MsEmailServiceObject.generateMsAuthUrl()) || "";
    res.redirect(authUrl);
});
exports.getMsAuthorisationUrl = getMsAuthorisationUrl;
// Get the access Token
const getMsAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = (yield emailservice_1.MsEmailServiceObject.getMsAccessToken()) || "";
    req.session.clientAccessToken = accessToken;
    res.send("Access code successfully sent to you");
});
exports.getMsAccessToken = getMsAccessToken;
// Handle user on granting permission
const getGoogleResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    try {
        yield emailservice_1.default.connectGoogleAccount(code);
        yield emailservice_1.default.fetchEmails();
        res.status(201).json({ message: "Automated reply has sent successfully" });
    }
    catch (error) {
        console.error("Error fetching tokens:", error);
        res.status(500).send("Error occurred during authorization.");
    }
});
exports.getGoogleResponse = getGoogleResponse;
// Save the ms access token
const getMicrosoftResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    try {
        const authResult = yield emailservice_1.MsEmailServiceObject.connectMsAccount(code);
        if (authResult && authResult.accessToken) {
            const { accessToken } = authResult;
            req.session.accessToken = accessToken;
            res.redirect("/ms-access-token");
        }
        else {
            throw new Error("Authentication failed or access token not found.");
        }
    }
    catch (error) {
        console.error(error);
        throw error;
    }
});
exports.getMicrosoftResponse = getMicrosoftResponse;
