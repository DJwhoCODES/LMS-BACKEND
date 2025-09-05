import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.js";

export const isAuth = async (req, res, next) => {
    try {
        const auth = req.headers.authorization || "";
        const token = auth.startsWith("Bearer ")
            ? auth.slice(7)
            : (req.headers.token || req.cookies?.accessToken);

        if (!token) {
            return res.status(401).json({ code: "NO_TOKEN", message: "Auth token missing" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res
                    .status(401)
                    .json({ code: "TOKEN_EXPIRED", message: "Token expired", expiredAt: err.expiredAt });
            }
            if (err.name === "JsonWebTokenError") {
                return res
                    .status(401)
                    .json({ code: "INVALID_TOKEN", message: "Invalid token" });
            }
            if (err.name === "NotBeforeError") {
                return res
                    .status(401)
                    .json({ code: "TOKEN_NOT_ACTIVE", message: "Token not active yet", notBefore: err.date });
            }
            return res
                .status(401)
                .json({ code: "TOKEN_VERIFY_ERROR", message: "Token verification failed" });
        }

        const user = await UserModel.findById(decoded._id).select("-password");
        if (!user) {
            return res.status(401).json({ code: "USER_NOT_FOUND", message: "User not found" });
        }

        req.user = user;
        return next();
    } catch (error) {
        return res.status(500).json({ code: "SERVER_ERROR", message: "Internal server error" });
    }
};
