import nodemailer from "nodemailer";

export const getTransporter = () => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
};

export default getTransporter;
