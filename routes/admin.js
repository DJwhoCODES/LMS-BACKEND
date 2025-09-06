import express from "express";
import { isAdmin, isAuth } from "../middlewares/auth.js";
import { addLecture, createCourse, deleteCourse, deleteLecture, getAllStats } from "../controllers/admin.js";
import { uploadFiles } from "../middlewares/multer.js";

const router = express.Router();

router.post("/create-course", isAuth, isAdmin, uploadFiles, createCourse);
router.post("/add-lecture", isAuth, isAdmin, uploadFiles, addLecture);
router.delete("/delete-lecture/:id", isAuth, isAdmin, deleteLecture);
router.delete("/delete-course/:id", isAuth, isAdmin, deleteCourse);
router.get("/get-all-stats", isAuth, isAdmin, getAllStats);

export default router;