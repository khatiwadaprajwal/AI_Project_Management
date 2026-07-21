import nodemailer from "nodemailer";
import { env } from "../config/env";
import { AppError } from './AppError';
const transporter = nodemailer.createTransport({
  host: env.GMAIL_HOST,
  port: Number(env.GMAIL_PORT),
  secure: false, 
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_PASS, 
  },
});

export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"SDLC" <${env.GMAIL_USER}>`,
      to,
      subject,
      text,
    });
  } catch (err) {
    throw new AppError('Failed to send email', 500);
  }
};