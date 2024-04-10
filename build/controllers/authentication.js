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
exports.getCallback = exports.getAuthorisationUrl = void 0;
const credential_1 = require("../oauthcredential/credential");
const credential_2 = __importDefault(require("../oauthcredential/credential"));
const emailservice_1 = require("./emailservice");
// Redirect to the authorisation url
const getAuthorisationUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUrl = (0, credential_1.generateAuthUrl)() || "";
    res.redirect(authUrl);
});
exports.getAuthorisationUrl = getAuthorisationUrl;
// Handle user on granting permission
const getCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    try {
        const { tokens } = yield credential_2.default.getToken(code);
        credential_2.default.setCredentials(tokens);
        const messages = yield (0, emailservice_1.fetchMailFromGmail)();
        console.log(messages);
        res.send(messages);
    }
    catch (error) {
        console.error("Error fetching tokens:", error);
        res.status(500).send("Error occurred during authorization.");
    }
});
exports.getCallback = getCallback;
