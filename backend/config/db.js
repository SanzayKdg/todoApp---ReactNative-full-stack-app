import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const { conn } = await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Database Successfully");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
