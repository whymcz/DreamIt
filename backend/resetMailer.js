const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dreamit.confirm@gmail.com",
    pass: "kpvevqirnrrudjsn"
  }
});

const sendResetEmail = async (to, token) => {
  const link = `http://localhost:3000/reset-password/${token}`;

  await transporter.sendMail({
    from: '"DreamIt Support" dreamit.comfirm@gmail.com',
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
