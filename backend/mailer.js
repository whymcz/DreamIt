const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dreamit.confirm@gmail.com",
    pass: "kpve vqir nrru djsn"
  }
});

const sendVerificationEmail = async (to, token) => {
  const link = `http://localhost:5000/verify/${token}`;

  await transporter.sendMail({
    from: '"DreamIt" <YOUR_EMAIL@gmail.com>',
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
