import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

// Verify account
export const isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Please login first to access this page.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded._id);

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
    console.log(error);
  }
};
