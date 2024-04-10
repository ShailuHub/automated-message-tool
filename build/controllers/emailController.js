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
// Redirect to the authorisation url
const getAuthorisationUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUrl = (yield emailservice_1.default.generateGoogleAuthUrl()) || "";
    res.redirect(authUrl);
});
exports.getAuthorisationUrl = getAuthorisationUrl;
// Handle user on granting permission
const getGoogleResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    try {
        yield emailservice_1.default.connectGoogleAccount(code);
        const messages = yield emailservice_1.default.fetchEmails();
        res.send(messages);
    }
    catch (error) {
        console.error("Error fetching tokens:", error);
        res.status(500).send("Error occurred during authorization.");
    }
});
exports.getGoogleResponse = getGoogleResponse;
