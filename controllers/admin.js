import TryCatch from "../middlewares/try_catch.js";
import { CourseModel } from "../models/courses.js";
import { LectureModel } from "../models/lecture.js";

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
})