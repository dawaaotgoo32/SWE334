const nodemailer = require("nodemailer");

const otpStore = {}; 

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
}

async function sendOTP(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore[email] = { otp, expiresAt };

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send OTP
    await transporter.sendMail({
      from: `"My Shop" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your verification code",
      html: `
        <h3>Your verification code:</h3>
        <h1>${otp}</h1>
        <p>This code expires in 5 minutes.</p>
      `,
    });

    res.json({ success: true, message: "OTP sent to email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
}

async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;

    if (!otpStore[email]) {
      return res.status(400).json({ message: "No OTP requested for this email" });
    }

    const { otp: correctOtp, expiresAt } = otpStore[email];

    if (Date.now() > expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired" });
    }

    if (otp !== correctOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    delete otpStore[email]; // optional cleanup

    return res.json({ success: true, verified: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed" });
  }
}

module.exports = { sendOTP, verifyOTP };
