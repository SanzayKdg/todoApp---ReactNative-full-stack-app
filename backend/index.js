import { app } from "./app.js";
import { config } from "dotenv";
import { connectDB } from "./config/db.js";
import cloudinary from "cloudinary";

// calling dot env files
config({
  path: "./config/conf.env",
});

//from process.env
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
// connecting database
connectDB();

// listening on local host
app.listen(process.env.PORT, () => {
  console.log(
    `Server is started and is running on localhost:${process.env.PORT}`
  );
});
