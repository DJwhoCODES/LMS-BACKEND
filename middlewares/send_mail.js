import { createTransport } from "nodemailer";

const sendMailToUser = async (email, subject, data) => {
    try {
        const transport = createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL,
                pass: process.env.NODEMAILER_PASSWORD
            }
        });

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background: #f9f9f9; text-align: center;">
                <h2 style="color: #333;">Hello ${data.name},</h2>
                <p style="font-size: 16px; color: #555;">Here is your one-time password (OTP) for verification:</p>
                <h1 style="color: #007BFF; font-size: 32px; letter-spacing: 2px;">${data.otp}</h1>
                <p style="color: #777; font-size: 14px; margin-top: 20px;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
                <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
            </div>
        `;

        await transport.sendMail({
            from: `"MyApp" <${process.env.GMAIL}>`,
            to: email,
            subject,
            html
        });

        console.log(`✅ Mail sent to ${email}`);
    } catch (err) {
        console.error("❌ Error sending mail:", err.message);
    }
};

export default sendMailToUser;
