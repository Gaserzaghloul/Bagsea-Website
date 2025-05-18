const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const Category = require("../models/category");
var moment = require("moment"); // 34an el time formatting (like date of creation)
const Review = require('../models/review');
const jwtAuth = require('../middleware/jwtAuth');

// GET: display all products populated (pages movement)
router.get("/", async (req, res) => {
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  try {
    const products = await Product.find({})
      .sort("-createdAt")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("category"); // to get the category name of the product

    const count = await Product.countDocuments();

    res.render("shop/index", {
      pageName: "All Products",
      products,
      current: page,
      breadcrumbs: null,
      home: "/products/?",
      pages: Math.ceil(count / perPage),
      successMsg: null,
      errorMsg: null,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});


// GET: search for products by title in navigation bar 
// we search using regular expression here 
router.get("/search", async (req, res) => {
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  const successMsg = null;
  const errorMsg = null;
// start using reular expressionnn using regex (mongo operator that allows us to search for a string in a field)
//reg.query.search is the value that the user entered in the search bar
// w 34an el case sensitivity we use $options: "i" to make it case insensitive
  try {
    const products = await Product.find({
      title: { $regex: req.query.search, $options: "i" },
    })
      .sort("-createdAt")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("category")
      .exec();
    const count = await Product.countDocuments({
      title: { $regex: req.query.search, $options: "i" },
    });
    res.render("shop/index", {
      pageName: "Search Results",
      products,
      successMsg,
      errorMsg,
      current: page,
      breadcrumbs: null,
      home: "/products/search?search=" + req.query.search + "&",
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

//GET: get a certain category by its slug baad ma 3mlt search  (this is used for the categories navbar)
// awel ma ados button searchh
// slug= the name of the category in a url friendly way  
router.get("/:slug", async (req, res) => {
  const successMsg = null;
  const errorMsg = null;
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  try {
    const foundCategory = await Category.findOne({ slug: req.params.slug });
    const allProducts = await Product.find({ category: foundCategory.id })
      .sort("-createdAt")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("category");

    const count = await Product.countDocuments({ category: foundCategory.id });

    res.render("shop/index", {
      pageName: foundCategory.title,
      currentCategory: foundCategory,
      products: allProducts,
      successMsg,
      errorMsg,
      current: page,
      breadcrumbs: req.breadcrumbs,
      home: "/products/" + req.params.slug.toString() + "/?",
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
});

// GET: display a certain product by its id,, display only one product(that we )
router.get("/:slug/:id", async (req, res) => {
  const successMsg = null;
  const errorMsg = null;
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res.status(404).render("error", { message: "Product not found", error: {} });
    }
    if (!product.category) {
      return res.status(404).render("error", { message: "Product category not found", error: {} });
    }
    res.render("shop/product", {
      pageName: product.title,
      product,
      successMsg,
      errorMsg,
      moment: moment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).render("error", { message: error.message, error });
  }
});

// GET: fetch all reviews for a product
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).populate('user', 'username profile.avatar');
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST: add a review for a product (JWT protected)
router.post('/:id/reviews', jwtAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required.' });
    }
    // Prevent duplicate review by same user
    const existing = await Review.findOne({ product: req.params.id, user: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product.' });
    }
    const review = new Review({
      user: req.user.id,
      product: req.params.id,
      rating,
      comment
    });
    await review.save();
    // Add review to product
    await Product.findByIdAndUpdate(req.params.id, { $push: { reviews: review._id } });
    // Add review to user
    await require('../models/user').findByIdAndUpdate(req.user.id, { $push: { reviews: review._id } });
    res.json({ success: true, message: 'Review added successfully!', review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE: delete a review (JWT protected, only by review owner)
router.delete('/:id/reviews/:reviewId', jwtAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    await review.remove();
    // Remove review from product and user
    await Product.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.reviewId } });
    await require('../models/user').findByIdAndUpdate(req.user.id, { $pull: { reviews: req.params.reviewId } });
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
