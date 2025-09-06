import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./database/db.js";
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/courses.js";
import adminRoutes from "./routes/admin.js";
import Razorpay from "razorpay";

dotenv.config();
const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());

export const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
})

app.get("/", (req, res) => {
    res.send("Server is in healthy condition!");
});

app.use("/uploads", express.static("uploads"));

app.use("/api/user", userRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/admin", adminRoutes);

app.listen(port, () => {
    console.log(`✅ Server is running on http://localhost:${port}`);
    connectDb();
})