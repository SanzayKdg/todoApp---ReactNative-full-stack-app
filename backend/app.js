import express from "express";
import userRouter from "./routes/userRoute.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import cors from "cors";
export const app = express();

dotenv.config({ path: "./config/conf.env" });
// Middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// stores files in local storage
app.use(
  fileUpload({
    limits: {
      fileSize: 50 * 1024 * 1024,
    },
    useTempFiles: true,
  })
);

// cors --> cross origin resource sharing
app.use(cors());

// Routes
app.use("/api/v1/", userRouter);

// 55 : 45
