const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const { createHttpError } = require("../utils/httpError");

const toPublicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
});

const normalizeCredentials = (body = {}) => ({
  name: typeof body.name === "string" ? body.name.trim() : "",
  email: typeof body.email === "string" ? body.email.trim().toLowerCase() : "",
  password: typeof body.password === "string" ? body.password : "",
});

const validateRegistration = ({ name, email, password }) => {
  if (name.length < 2 || name.length > 80) {
    throw createHttpError(400, "Name must be between 2 and 80 characters.");
  }
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    throw createHttpError(400, "Enter a valid email address.");
  }
  if (password.length < 8 || password.length > 128) {
    throw createHttpError(400, "Password must be between 8 and 128 characters.");
  }
};

const validateLogin = ({ email, password }) => {
  if (!/^\S+@\S+\.\S+$/.test(email) || !password) {
    throw createHttpError(400, "Email and password are required.");
  }
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = normalizeCredentials(req.body);
    validateRegistration({ name, email, password });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = generateToken(user._id);
    return res.status(201).json({
      success: true,
      message: "User registration successful!",
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }
    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = normalizeCredentials(req.body);
    validateLogin({ email, password });
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    const token = generateToken(user._id);
    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ success: true, user: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
