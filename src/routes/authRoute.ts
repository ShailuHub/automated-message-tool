import express from "express";
const router = express.Router();
import {
  getAuthorisationUrl,
  getGoogleResponse,
  getMsAuthorisationUrl,
  getMicrosoftResponse,
  getMsAccessToken,
} from "../controllers/emailController";

router.get("/google/authurl/reachinbox", getAuthorisationUrl);
router.get("/google/reachinbox", getGoogleResponse);
router.get("/microsoft/authurl/reachinbox", getMsAuthorisationUrl);
router.get("/microsoft/reachinbox", getMicrosoftResponse);
router.get("/ms-access-token", getMsAccessToken);

export default router;
