import mongoose from "mongoose";

export const connectDb = async () => {
    try {
        const { DB } = process.env;
        await mongoose.connect(DB);
        console.log("✅ Database connected successfully!")
    } catch (error) {
        console.log(error);
    }
}