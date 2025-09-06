import express from "express";
import { checkout, fetchLectures, getAllCourses, getLecture, getSingleCourse, myCourses, paymentVerififcation } from "../controllers/courses.js";
import { isAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/get-all-courses", getAllCourses);
router.get("/get-course/:id", getSingleCourse);
router.get("/get-course-lectures/:id", isAuth, fetchLectures);
router.get("/get-lecture/:id", isAuth, getLecture);
router.get("/get-my-courses", isAuth, myCourses);
router.post("/checkout/:id", isAuth, checkout);
router.post("/payment-verification/:id", isAuth, paymentVerififcation);

export default router;