const express = require("express");
const csrf = require("csurf");
const nodemailer = require("nodemailer");
const router = express.Router();
const {
  userContactUsValidationRules,
  validateContactUs,
} = require("../config/validator");
const csrfProtection = csrf();
router.use(csrfProtection);

//GET: display abous us page
router.get("/about-us", (req, res) => {
  res.render("pages/about-us", {
    pageName: "About Us",
  });
});

//GET: display shipping policy page
router.get("/shipping-policy", (req, res) => {
  res.render("pages/shipping-policy", {
    pageName: "Shipping Policy",
  });
});

//GET: display careers page
router.get("/careers", (req, res) => {
  res.render("pages/careers", {
    pageName: "Careers",
  });
});

//GET: display contact us page
router.get("/contact-us", (req, res) => {
  res.render("pages/contact-us", {
    pageName: "Contact Us",
    errorMsg: null,
    successMsg: null
  });
});

//POST: handle contact us form submission
router.post(
  "/contact-us",
  [userContactUsValidationRules(), validateContactUs],
  async (req, res) => {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: `Contact Us Form Submission from ${req.body.name}`,
        html: `
          <h3>Contact Us Form Submission</h3>
          <p><strong>Name:</strong> ${req.body.name}</p>
          <p><strong>Email:</strong> ${req.body.email}</p>
          <p><strong>Message:</strong> ${req.body.message}</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
