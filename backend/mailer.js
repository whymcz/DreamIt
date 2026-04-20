const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (to, token) => {
  const link = `${process.env.CLIENT_URL}/verify/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER, 
    to,
    subject: "Verify your DreamIt account",
    html: `
      <h2>Welcome to DreamIt!</h2>
      <p>Please verify your email:</p>
      <a href="${link}">${link}</a>
    `
  });
};

module.exports = sendVerificationEmail;