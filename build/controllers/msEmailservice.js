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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsEmailServiceObject = void 0;
const outlookCredentail_1 = require("../oauthcredential/outlookCredentail");
class MsEmailService {
    generateMicrosoftAuthUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serviceScope = ["https://graph.microsoft.com/.default"];
                const authUrl = yield outlookCredentail_1.cca.getAuthCodeUrl({
                    scopes: serviceScope,
                    redirectUri: process.env.MS_REDIRECT_URL || "",
                });
                return authUrl;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
}
const MsEmailServiceObject = new MsEmailService();
exports.MsEmailServiceObject = MsEmailServiceObject;
