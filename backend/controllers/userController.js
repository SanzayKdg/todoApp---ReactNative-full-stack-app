import { User } from "../models/User.js";
import { sendMail } from "../utils/sendMail.js";
import { sendToken } from "../utils/sendToken.js";
import cloudinary from "cloudinary";
import fs from "fs";

export const registerController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const avatar = req.files.avatar.tempFilePath;

    // searching for existing user by sending email
    let user = await User.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // create a otp
    const otp = Math.floor(Math.random() * 1000000).toString();

    // uploading to cloudinary
    const myUpload = await cloudinary.v2.uploader.upload(avatar, {
      folder: "todoApp",
    });

    // delete tmp folder and files
    fs.rmSync("./tmp", { recursive: true });

    // After successfull search created a new user
    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: myUpload.public_id,
        url: myUpload.secure_url,
      },
      otp,
      otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000),
    });

    // Sending otp in mail to verify
    await sendMail(email, "Please verify your account", `Your OTP is ${otp}`);

    // sending token as response
    sendToken(
      res,
      user,
      201,
      "OTP has been sent to your email, please verify your account"
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify your account
export const verifyAccount = async (req, res, next) => {
  try {
    const otp = Number(req.body.otp);
    const user = await User.findById(req.user._id);
    if (user.otp !== otp || user.otp_expiry < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP or has been expired" });
    }

    // else
    user.verified = true;
    user.otp = null;
    user.otp_expiry = null;

    await user.save();

    sendToken(res, user, 200, "Account verified");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter required fields" });
    }
    // .select("+passwords") selects password during comparison of password on login
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }

    const isMatched = await user.comparePassword(password);

    if (!isMatched) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }

    // sending token as response
    sendToken(res, user, 200, "Login Success");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
      })
      .json({
        success: true,
        message: "Logged Out Successfully",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// create a new task
export const addTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const user = await User.findById(req.user._id);

    user.tasks.push({
      title,
      description,
      completed: false,
      createAt: new Date(Date.now()),
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Task created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message + "Here",
    });
  }
};

// Remove a task
export const removeTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const user = await User.findById(req.user._id);

    user.tasks = user.tasks.filter(
      (task) => task._id.toString() !== taskId.toString()
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a task
export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const user = await User.findById(req.user._id);

    user.task = user.tasks.find(
      (task) => task._id.toString() === taskId.toString()
    );

    user.task.completed = !user.task.completed;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get single / myProfile
export const myProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // sending token as response
    sendToken(res, user, 200, `Welcome Back ${user.name}`);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update Profile
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { name } = req.body;
    const avatar = req.files.avatar.tempFilePath;

    if (name) {
      user.name = name;
    }
    if (avatar) {
      // first destroy previous avatar
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);

      // uploading to cloudinary
      const myUpload = await cloudinary.v2.uploader.upload(avatar, {
        folder: "todoApp",
      });

      // delete tmp folder and files
      fs.rmSync("./tmp", { recursive: true });

      user.avatar = {
        public_id: myUpload.public_id,
        url: myUpload.secure_url,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update Profile
export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Password" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password didn't matched.",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// forogot password
export const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid user." });
    }
    // create a otp
    const otp = Math.floor(Math.random() * 1000000).toString();

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

    await user.save();

    const message = `Your OTP is ${otp}. If you did not request it please ignore it.`;
    // Sending otp in mail to verify
    await sendMail(email, "Request to resetting password", message);

    res.status(200).json({
      success: true,
      message: `OTP sent to ${email}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  try {
    const { otp, newPassword, confirmPassword } = req.body;

    const user = await User.findOne({
      resetPasswordOtp: otp,
      resetPasswordOtpExpiry: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP or has been expired." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password didn't matched.",
      });
    }

    user.password = newPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpiry = null; // 15 minutes expiry
    await user.save();

    res.status(200).json({
      success: true,
      message: `Password reset successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
