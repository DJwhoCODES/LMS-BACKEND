import TryCatch from "../middlewares/try_catch.js";
import { CourseModel } from "../models/courses.js";
import { LectureModel } from "../models/lecture.js";
import { rm } from "fs";
import fs from "fs";
import { promisify } from "util";
import { UserModel } from "../models/user.js";

export const createCourse = TryCatch(async (req, res) => {
    const { title, description, category, createdBy, duration, price } = req.body;

    const image = req.file;

    await CourseModel.create({
        title, description, category, createdBy, duration, price, image: image?.path
    });

    res.status(201).json({ message: "Course Created Successfully!" })
});

export const addLecture = TryCatch(async (req, res) => {
    const course = await CourseModel.findById(req?.query?.id);

    if (!course) {
        return res.status(404).json({
            message: "Course Not Found!"
        })
    }

    const { title, description } = req.body;
    const file = req.file;

    const lecture = await LectureModel.create({
        title,
        description,
        video: file?.path,
        course: course._id
    });

    res.status(201).json({
        message: "Lecture Added Successfully!",
        lecture
    })
});

export const deleteLecture = TryCatch(async (req, res) => {
    const lecture = await LectureModel.findById(req.params.id);

    if (!lecture) {
        return res.status(404).json({ message: "Lecture Not Found!" });
    }

    rm(lecture.video, () => {
        console.log("Video Deleted!")
    });

    res.json({ message: "Lecture Deleted Successfully!" });
})

export const deleteCourse = TryCatch(async (req, res) => {
    const course = await CourseModel.findById(req.params.id);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }

    const lectures = await LectureModel.find({ course: course._id });

    await Promise.all(
        lectures.map(async (lecture) => {
            try {
                await unlinkAsync(lecture.video);
                console.log("Lecture video deleted:", lecture.video);
            } catch (err) {
                console.warn("Failed to delete lecture video:", lecture.video, err.message);
            }
        })
    );

    try {
        await unlinkAsync(course.image);
        console.log("Course thumbnail deleted:", course.image);
    } catch (err) {
        console.warn("Failed to delete course thumbnail:", course.image, err.message);
    }

    await LectureModel.deleteMany({ course: course._id });
    await CourseModel.findByIdAndDelete(course._id);
    await UserModel.updateMany({}, { $pull: { subscription: req.params.id } });

    res.json({ message: "Course removed successfully!" });
});

export const getAllStats = TryCatch(async (req, res) => {
    const totalCourses = await CourseModel.countDocuments();
    const totalLectures = await LectureModel.countDocuments();
    const totalUsers = await UserModel.countDocuments();

    const stats = {
        totalCourses,
        totalLectures,
        totalUsers
    };

    res.json({ stats });
})