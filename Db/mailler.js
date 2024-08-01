import nodemailer from "nodemailer";
import dotenv from 'dotenv'
dotenv.config()

const transporter = async () =>
  nodemailer.createTransport({
    secure: true,
    host: process.env.MAILER_HOST,
    port: 465,
    auth: {
      user: process.env.MAILER_EMAIL,
      pass: process.env.MAILER_PASS,
    },
  });

export { transporter };
