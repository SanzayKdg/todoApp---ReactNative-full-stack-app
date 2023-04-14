import express from "express";
import {
  logout,
  login,
  registerController,
  verifyAccount,
  addTask,
  removeTask,
  updateTask,
  myProfile,
  updateProfile,
  updatePassword,
  forgetPassword,
  resetPassword,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.route("/register").post(registerController);
router.route("/verify").post(isAuthenticated, verifyAccount);
router.route("/login").post(login);
router.route("/profile").get(isAuthenticated, myProfile);
router.route("/logout").get(logout);
router.route("/updateProfile").put(isAuthenticated, updateProfile);
router.route("/updatePassword").put(isAuthenticated, updatePassword);
router.route("/forgetPassword").post(forgetPassword);
router.route("/resetPassword").put(resetPassword);

router.route("/new/task").post(isAuthenticated, addTask);
router
  .route("/task/:taskId")
  .get(isAuthenticated, updateTask)
  .delete(isAuthenticated, removeTask);
export default router;
