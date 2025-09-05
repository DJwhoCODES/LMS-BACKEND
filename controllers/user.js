import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.js";
import sendMailToUser from "../middlewares/send_mail.js";
import TryCatch from "../middlewares/try_catch.js";

export const register = TryCatch(async (req, res) => {
    const { name, email, password } = req.body;

    let user = await UserModel.findOne({ email });

    if (user) {
        return res.status(400).json({ message: "User Already Exists!" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    user = {
        name,
        email,
        password: hashPassword
    }

    const otp = Math.floor(Math.random() * 1000000);

    const activationToken = jwt.sign({ user, otp }, process.env.ACTIVATION_SECRET, { expiresIn: "5m" });

    const data = {
        name, otp
    }

    await sendMailToUser(email, "LOGIN OTP", data);

    res.status(200).json({ message: "OTP sent to your mail", activationToken });
});

export const verifyUser = TryCatch(async (req, res) => {
    const { otp, activationToken } = req.body;

    const verify = jwt.verify(activationToken, process.env.ACTIVATION_SECRET);

    if (!verify) {
        return res.status(400).json({
            message: "OTP Expired!"
        })
    }

    if (verify.otp !== otp) {
        return res.status(400).json({
            message: "Wrong OTP!"
        })
    }

    const { name, email, password } = verify.user;

    await UserModel.create({
        name,
        email,
        password,
    });

    res.status(200).json({ message: "User Registered Successfully!" });
});

export const loginUser = TryCatch(async (req, res) => {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email }).lean();

    if (!user) {
        return res.status(400).json({ message: "User Not Found!" });
    }

    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
        return res.status(400).json({ message: "Invalid Credentials!" })
    }

    const access_token = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15d" });

    const _user = { ...user };
    delete _user.password;

    res.json({ message: `Welcome back ${user.name}`, access_token, _user });
})

export const myProfile = TryCatch(async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    res.json({ user });
})
