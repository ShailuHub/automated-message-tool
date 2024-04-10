import dotenv from "dotenv";
dotenv.config();
import express from "express";
import authRoute from "./routes/authRoute";

const app = express();
app.use("/auth", authRoute);

app.listen(3000, () => {
  console.log("server is working on the port 3000");
});
