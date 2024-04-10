"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const emailController_1 = require("../controllers/emailController");
router.get("/reachinbox", emailController_1.getAuthorisationUrl);
router.get("/google/reachinbox", emailController_1.getGoogleResponse);
exports.default = router;