import TryCatch from "../middlewares/try_catch.js";
import { CourseModel } from "../models/courses.js";
import { LectureModel } from "../models/lecture.js";
import { UserModel } from "../models/user.js";
import { PaymentModel } from "../models/payment.js";
import { razorpayInstance } from "../index.js";
import crypto from "crypto";
import { rm } from "fs";
import e from "express";

export const getAllCourses = TryCatch(async (req, res) => {
    const courses = await CourseModel.find().sort({ createdAt: -1 });

    if (!courses) {
        return res.status(404).json({ message: "Courses Not Found!" });
    }

    res.status(200).json({ courses });
});

export const getSingleCourse = TryCatch(async (req, res) => {
    const course = await CourseModel.findById(req.params.id);

    if (!course) {
        return res.status(404).json({ message: "Course Not Found!" });
    }

    res.json({ course });
});

export const fetchLectures = TryCatch(async (req, res) => {
    const lectures = await LectureModel.find({ course: req.params.id });

    if (!lectures) {
        return res.status(404).json({ message: "No Lectures Found!" })
    }

    const user = await UserModel.findById(req.user._id);

    if (!user) {
        return res.status(404).json({ message: "User Not Found!" });
    }

    if (user.role === "admin") {
        return res.json({ lectures });
    }

    if (!user.subscription.includes(req.params.id)) {
        return res.status(400).json({
            message: "You haven't subscribed to this course yet!"
        })
    }

    return res.json({ lectures });
});

export const getLecture = TryCatch(async (req, res) => {
    const lecture = await LectureModel.findById(req.params.id);

    if (!lecture) {
        return res.status(404).json({ message: "No Lecture Found!" })
    }

    const user = await UserModel.findById(req.user._id);

    if (!user) {
        return res.status(404).json({ message: "User Not Found!" });
    }

    if (user.role === "admin") {
        return res.json({ lecture });
    }

    if (!user.subscription.includes(lecture.course)) {
        return res.status(400).json({
            message: "You haven't subscribed to this course yet!"
        })
    }

    return res.json({ lecture });
});

export const myCourses = TryCatch(async (req, res) => {
    const courses = await CourseModel.find({ _id: req.user.subscription });

    res.json({ courses });
});

export const checkout = TryCatch(async (req, res) => {
    const user = await UserModel.findById(req.user._id);

    const course = await CourseModel.findById(req.params.id);

    if (user.subscription.includes(course._id)) {
        return res.status(400).json({
            message: "You already have this course!"
        });
    }

    const options = {
        amount: Number(course.price * 100),
        currency: "INR"
    }

    const order = await razorpayInstance.orders.create(options);

    res.status(201).json({
        order,
        course
    })
});

export const paymentVerififcation = TryCatch(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET).update(body).digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        await PaymentModel.create({
            razorpay_order_id, razorpay_payment_id, razorpay_signature
        });

        const user = await UserModel.findById(req.user._id);

        const course = await CourseModel.findById(req.params.id);

        user.subscription.push(course._id);

        await user.save();

        return res.status(200).json({ message: "Course Purchased Successfully!" });
    } else {
        return res.status(400).json({
            message: "Payment Failed!"
        })
    }
});