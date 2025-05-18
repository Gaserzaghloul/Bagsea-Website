const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Category = require("../models/category");
const mongoose = require("mongoose");
const connectDB = require("./../config/db");
// const Order = require('./models/order');
connectDB();

//this function is used to seed the database with categories
async function seedDB() {
  async function seedCateg(titleStr) {
    try {
      const categ = await new Category({ title: titleStr });
      await categ.save();
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async function closeDB() {
    console.log("CLOSING CONNECTION");
    await mongoose.disconnect();
  }
  //save categories to the databaseeeeeee
  await seedCateg("Backpacks");
  await seedCateg("Briefcases");
  await seedCateg("Mini Bags");
  await seedCateg("Large Handbags");
  await seedCateg("Travel");
  await seedCateg("Totes");
  await seedCateg("Purses");
  await closeDB();
}

seedDB();

// mongoose.connect('mongodb://localhost/bags-ecommerce', { useNewUrlParser: true, useUnifiedTopology: true });
// Order.find().then(orders => { console.log(orders); mongoose.disconnect(); });
