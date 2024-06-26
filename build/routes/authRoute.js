"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const emailController_1 = require("../controllers/emailController");
router.get("/google/authurl/reachinbox", emailController_1.getAuthorisationUrl);
router.get("/google/reachinbox", emailController_1.getGoogleResponse);
router.get("/microsoft/authurl/reachinbox", emailController_1.getMsAuthorisationUrl);
router.get("/microsoft/reachinbox", emailController_1.getMicrosoftResponse);
router.get("/microsoft/fetch/mails", emailController_1.getOutlookMails);
exports.default = router;
