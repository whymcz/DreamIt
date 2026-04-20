const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendResetEmail = async (to, token) => {
  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER, 
    to,
    subject: "Reset your DreamIt password",
    html: `
      <h2>Password Reset</h2>
      <p>You requested to reset your password.</p>
      <p>Click below to set a new password:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 15 minutes.</p>
    `
  });
};

module.exports = sendResetEmail;