// send otp verification mail to verify user
// const nodeMailer = require("nodemailer");
import nodemailer from "nodemailer";

// method for testing purpose only
export const sendMail = async (email, subject, text) => {
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    service: "gmail",
    auth: {
      user: "sanjaygautam12387@gmail.com",
      pass: "vvxqtzeosnuethja",
    },
  });

  await transport.sendMail({
    from: "sanjaygautam12387@gmail.com",
    to: email,
    subject,
    text,
  });
};

// Use this in real life production

// export const sendMail = async (email, subject, text) => {
//   const transport = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     service: process.env.SMTP_SERVICE,
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });

//   await transport.sendMail({
//     from: process.env.SMTP_USER,
//     to: email,
//     subject,
//     text,
//   });
// };
