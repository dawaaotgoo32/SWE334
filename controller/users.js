const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const OTP_EXPIRE_MINUTES = Number(process.env.OTP_EXPIRE_MINUTES || 5);

const otpStore = new Map();

class UsersController {
  constructor() {
    // auth
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.profile = this.profile.bind(this);

    // CRUD
    this.list = this.list.bind(this);
    this.get = this.get.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
    this.changePassword = this.changePassword.bind(this);

    // OTP
    this.sendOtp = this.sendOtp.bind(this);
    this.verifyOtp = this.verifyOtp.bind(this);
  }

  // ===== Auth =====
  async register(req, res, next) {
    try {
      const { username, email, password, phone } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const existing = await User.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.createUser({
        username,
        email,
        phone,
        password: hashed,
        role: 20,
      });

      res.status(201).json({ success: true, data: user });
    } catch (e) {
      next(e);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const user = await User.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token });
    } catch (e) {
      next(e);
    }
  }

  async profile(req, res) {
    try {
      const me = await User.getUserById(req.user.id);
      res.json({ success: true, data: me });
    } catch {
      res.status(500).json({ message: "Cannot fetch profile" });
    }
  }

  // ===== CRUD =====
  async list(req, res, next) {
    try {
      const users = await User.getAllUsers();
      res.json({ success: true, data: users });
    } catch (e) {
      next(e);
    }
  }

  async get(req, res, next) {
    try {
      const user = await User.getUserById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ success: true, data: user });
    } catch (e) {
      next(e);
    }
  }

  async create(req, res, next) {
    try {
      const { username, email, password, phone, role } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password required" });
      }

      const existing = await User.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const hashed = await bcrypt.hash(password, 10);
      const created = await User.createUser({
        username,
        email,
        phone,
        password: hashed,
        role,
      });

      res.status(201).json({ success: true, data: created });
    } catch (e) {
      next(e);
    }
  }

  async update(req, res, next) {
    try {
      const id = Number(req.params.id);
      const dto = { ...req.body };

      if (dto.password) {
        dto.password = await bcrypt.hash(dto.password, 10);
      }

      const updated = await User.updateUser(id, dto);
      res.json({ success: true, data: updated });
    } catch (e) {
      next(e);
    }
  }

  async remove(req, res, next) {
    try {
      await User.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  }

  // ===== Change password =====
  async changePassword(req, res, next) {
    try {
      const targetId = Number(req.params.id);
      const { currentPassword, newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "New password is too short" });
      }

      const isSelf = req.user?.id === targetId;
      const isAdmin = Number(req.user?.role) === 10;
      if (!isSelf && !isAdmin) {
        return res
          .status(403)
          .json({ message: "Эрх хүрэлцэхгүй байна" });
      }

      const userRow = await User.getUserById(targetId);
      if (!userRow) {
        return res.status(404).json({ message: "User not found" });
      }

      // if not admin, check current password
      if (!isAdmin) {
        if (!currentPassword) {
          return res
            .status(400)
            .json({ message: "Current password required" });
        }
        const fullUser = await User.getUserByEmail(userRow.email);
        const ok = await bcrypt.compare(currentPassword, fullUser.password);
        if (!ok) {
          return res
            .status(401)
            .json({ message: "Current password is incorrect" });
        }
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      const updated = await User.updateUser(targetId, { password: hashed });

      res.json({
        success: true,
        data: {
          id: updated.id,
          email: updated.email,
          updated_at: updated.updated_at,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  // ===== OTP: send code to email =====
  async sendOtp(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email required" });
      }

      // 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      otpStore.set(email, {
        otp,
        expiresAt: Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000,
      });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your verification code",
        html: `
          <h2>Your OTP Code</h2>
          <p>Your verification code is:</p>
          <h1>${otp}</h1>
          <p>This code will expire in ${OTP_EXPIRE_MINUTES} minutes.</p>
        `,
      });

      res.json({ success: true, message: "OTP sent to email" });
    } catch (e) {
      next(e);
    }
  }

  // ===== OTP: verify code =====
  async verifyOtp(req, res, next) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res
          .status(400)
          .json({ message: "Email and OTP required" });
      }

      const record = otpStore.get(email);
      if (!record) {
        return res
          .status(400)
          .json({ message: "OTP not found or expired" });
      }

      if (Date.now() > record.expiresAt) {
        otpStore.delete(email);
        return res.status(400).json({ message: "OTP expired" });
      }

      if (record.otp !== otp) {
        return res.status(401).json({ message: "Invalid OTP" });
      }

      // success, remove from store
      otpStore.delete(email);

      res.json({ success: true, message: "OTP verified" });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new UsersController();