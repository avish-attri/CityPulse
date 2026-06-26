import jwt from "jsonwebtoken";

import { body } from "express-validator";

import User from "../models/User.js";

import { asyncHandler, validate } from "../middleware/validate.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),

    httpOnly: true,

    secure: process.env.NODE_ENV === "production",

    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res

    .status(statusCode)

    .cookie("token", token, options)

    .json({
      success: true,

      token,

      user: {
        _id: user._id,

        name: user.name,

        email: user.email,

        avatar: user.avatar,

        city: user.city,

        role: user.role,

        stats: user.stats,
      },
    });
};

export const register = [
  body("name").trim().notEmpty().withMessage("Name required"),

  body("email").isEmail().withMessage("Valid email required"),

  body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),

  validate,

  asyncHandler(async (req, res) => {
    const { name, email, password, city } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const exists = await User.findOne({ email: normalizedEmail });

    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      city: city || "Chandigarh",
    });

    sendTokenResponse(user, 201, res);
  }),
];

export const login = [
  body("email").isEmail(),

  body("password").notEmpty(),

  validate,

  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    sendTokenResponse(user, 200, res);
  }),
];

export const logout = asyncHandler(async (_req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });

  res.json({ success: true, message: "Logged out" });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({ success: true, user });
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ success: true, user });
});
