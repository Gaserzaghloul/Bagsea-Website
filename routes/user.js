const express = require("express");
const router = express.Router();
const passport = require("passport");
const { generateToken } = require("../config/jwt");
const jwtAuth = require("../middleware/jwtAuth");
const User = require("../models/user");
const {
  userSignUpValidationRules,
  userSignInValidationRules,
  validateSignup,
  validateSignin,
} = require("../config/validator");
const multer = require('multer');
const path = require('path');

// Multer config for profile image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images/profile_images'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user.id + '-' + Date.now() + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, gif, webp).'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// GET: display the signup form
router.get("/signup", (req, res) => {
  res.render("user/signup", {
    pageName: "Sign Up",
    errorMsg: null
  });
});

// POST: handle signup
router.post(
  "/signup",
  [
    userSignUpValidationRules(),
    validateSignup,
    function (req, res, next) {
      passport.authenticate("local.signup", { session: false }, (err, user, info) => {
        if (err) {
          return res.status(500).json({ success: false, message: err.message });
        }
        if (!user) {
          return res.status(400).json({ success: false, message: info && info.message ? info.message : "Signup failed" });
        }
        req.user = user;
        next();
      })(req, res, next);
    }
  ],
  async (req, res) => {
    try {
      const token = generateToken(req.user);
      res.json({
        success: true,
        token,
        user: {
          id: req.user._id,
          username: req.user.username,
          email: req.user.email
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET: display the signin form
router.get("/signin", (req, res) => {
  res.render("user/signin", {
    pageName: "Sign In",
    errorMsg: null
  });
});

// POST: handle signin
router.post(
  "/signin",
  [
    userSignInValidationRules(),
    validateSignin,
    function (req, res, next) {
      passport.authenticate("local.signin", { session: false }, (err, user, info) => {
        if (err) {
          return res.status(500).json({ success: false, message: err.message });
        }
        if (!user) {
          return res.status(400).json({ success: false, message: info && info.message ? info.message : "Signin failed" });
        }
        req.user = user;
        next();
      })(req, res, next);
    }
  ],
  async (req, res) => {
    try {
      const token = generateToken(req.user);
      res.json({
        success: true,
        token,
        user: {
          id: req.user._id,
          username: req.user.username,
          email: req.user.email
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET: render the profile page (public, not protected)
router.get("/profile", (req, res) => {
  res.render("user/profile", { pageName: "Profile" });
});

// GET: get user profile data (protected route)
router.get("/profile/data", jwtAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile || {},
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST: update user profile (protected route)
router.post("/profile/update", jwtAuth, (req, res, next) => {
  upload.single('avatar')(req, res, function(err) {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { firstName, lastName, phone, street, city, state, zipCode, country } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    let avatarPath = user.profile.avatar;
    if (req.file) {
      avatarPath = '/images/profile_images/' + req.file.filename;
    }
    user.profile = {
      ...user.profile,
      firstName: firstName || user.profile.firstName,
      lastName: lastName || user.profile.lastName,
      phone: phone || user.profile.phone,
      avatar: avatarPath,
      address: {
        street: street || (user.profile.address && user.profile.address.street),
        city: city || (user.profile.address && user.profile.address.city),
        state: state || (user.profile.address && user.profile.address.state),
        zipCode: zipCode || (user.profile.address && user.profile.address.zipCode),
        country: country || (user.profile.address && user.profile.address.country)
      }
    };
    await user.save();
    res.json({ success: true, message: "Profile updated successfully!", user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST: logout
router.post("/logout", jwtAuth, (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

// GET: get all orders for the logged-in user
router.get('/orders', jwtAuth, async (req, res) => {
  try {
    const orders = await require('../models/order').find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
