import express from "express";
import { loginUser, myProfile, register, verifyUser } from "../controllers/user.js";
import { isAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-user", verifyUser);
router.post("/login", loginUser);
router.get("/my-profile", isAuth, myProfile);

export default router;