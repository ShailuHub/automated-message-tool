import dotenv from "dotenv";
dotenv.config();
import express from "express";
import authRoute from "./routes/authRoute";
import session from "express-session";

declare module "express-session" {
  interface SessionData {
    accessToken: string;
    clientAccessToken: string;
  }
}
const app = express();
app.use(
  session({
    secret: process.env.sessionSecretKey || "",
    resave: false,
    saveUninitialized: false,
  })
);
app.use("/auth", authRoute);

app.listen(3000, () => {
  console.log("server is working on the port 3000");
});
