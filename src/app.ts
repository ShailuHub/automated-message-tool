import dotenv from "dotenv";
dotenv.config();
import express from "express";
import authRoute from "./routes/authRoute";
import session from "express-session";
import cors from "cors";

declare module "express-session" {
  interface SessionData {
    googleRefreshToken: string;
    senderName: string;
    msPublicAccessToken: string;
    msClientAccessToken: string;
  }
}
const app = express();

app.use(cors());
app.use(
  session({
    secret: process.env.SESSION_KEY || "dgdf&%^&^%(78545*^G",
    resave: false,
    saveUninitialized: false,
  })
);
app.use("/auth", authRoute);

const startServer = async () => {
  try {
    app.listen(3000, () => {
      console.log("server is working on the port 3000");
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
