import express from "express";
import { isAdmin, isAuth } from "../middlewares/auth.js";
import { addLecture, createCourse } from "../controllers/admin.js";
import { uploadFiles } from "../middlewares/multer.js";

const router = express.Router();

router.post("/create-course", isAuth, isAdmin, uploadFiles, createCourse);
router.post("/add-lecture", isAuth, isAdmin, uploadFiles, addLecture);

export default router;