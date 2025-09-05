import express from "express";
import { loginUser, myProfile, register, verifyUser } from "../controllers/user.js";
import { isAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/user/register", register);
router.post("/user/verify-user", verifyUser);
router.post("/user/login", loginUser);
router.get("/user/my-profile", isAuth, myProfile);

export default router;