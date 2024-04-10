import express from "express";
const router = express.Router();
import {
  getAuthorisationUrl,
  getGoogleResponse,
} from "../controllers/emailController";

router.get("/reachinbox", getAuthorisationUrl);
router.get("/google/reachinbox", getGoogleResponse);

export default router;
