const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
}
});

const sendVerificationEmail = async (to, token) => {
  try {
    console.log("CLIENT_URL:", process.env.CLIENT_URL);

    const link = `${process.env.CLIENT_URL}/verify/${token}`;
    console.log("FINAL LINK:", link);

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

    console.log("EMAIL SENT SUCCESSFULLY");

  } catch (error) {
    console.error("EMAIL ERROR:", error);
  }
};

module.exports = sendVerificationEmail;
