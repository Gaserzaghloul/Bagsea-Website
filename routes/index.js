const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const Product = require("../models/product");
const Category = require("../models/category");
const Cart = require("../models/cart");
const Order = require("../models/order");
const middleware = require("../middleware");
const Shipping = require("../models/shipping");
const jwtAuth = require("../middleware/jwtAuth");
const router = express.Router();

// Tax rates by country/state
const TAX_RATES = {
  US: {
    CA: 0.095, // California
    NY: 0.088,
    TX: 0.0825,
    DEFAULT: 0.08
  },
  EG: { DEFAULT: 0.14 }, // Egypt
  DE: { DEFAULT: 0.19 }, // Germany
  DEFAULT: 0.08
};

function getTaxRate(country, state) {
  if (TAX_RATES[country]) {
    if (state && TAX_RATES[country][state]) return TAX_RATES[country][state];
    if (TAX_RATES[country].DEFAULT) return TAX_RATES[country].DEFAULT;
  }
  return TAX_RATES.DEFAULT;
}

// GET: home page
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({})
      .sort("-createdAt")
      .populate("category");
    res.render("shop/home", { pageName: "Home", products });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// GET: add a product to the shopping cart when "Add to cart" button is presseddddd
router.post("/add-to-cart/:id", jwtAuth, async (req, res) => {
  const productId = req.params.id;
  try {
    //1- get the correct cart from the db based on the user id
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id }); // create a new cart if it doesn't exist
    }

    // 2- add the product to the cart
    const product = await Product.findById(productId); //2.1 get the product from the db
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    //2.2 Check if product is in stock 
    if (product.quantity <= 0) {
      return res.status(400).json({ success: false, message: "Product is out of stock" });
    }

    //2.3 Check if product already exists in the cart
    const itemIndex = cart.items.findIndex((p) => p.productId == productId); 
    if (itemIndex > -1) {
      // Check if adding one more would exceed available quantity 34an law akher product khales
      if (cart.items[itemIndex].qty + 1 > product.quantity) {
        return res.status(400).json({ success: false, message: "Not enough items in stock" });
      }

      //2.3.1 if product exists in the cart, update the quantity
      cart.items[itemIndex].qty++;
      cart.items[itemIndex].price = cart.items[itemIndex].qty * product.price;
      cart.totalQty++;
      cart.totalCost += product.price;
    } else {
      // 2.3.2 if product does not exists in cart, find it in the db to retrieve its price and add new item
      cart.items.push({
        productId: productId,
        qty: 1,
        price: product.price,
        title: product.title,
        productCode: product.productCode,
      });
      cart.totalQty++;
      cart.totalCost += product.price;
    }

    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});


// 
// GET: view shopping cart contents
router.get("/shopping-cart", async (req, res) => {
  res.render("shop/shopping-cart", { pageName: "Shopping Cart" }); 
}); // here i just render the html page, the data will be loaded via AJAxxxxxx


// POST: reduce one from an item in the shopping cart
router.post("/reduce/:id", jwtAuth, async function (req, res) {
  const productId = req.params.id;
  try {
    const cart = await Cart.findOne({ user: req.user.id }); //first find the cart
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // find the item with productId
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // find the product to find its price
      const product = await Product.findById(productId);
      // if product is found, reduce its qty
      cart.items[itemIndex].qty--;
      cart.items[itemIndex].price -= product.price;
      cart.totalQty--;
      cart.totalCost -= product.price;
      // if the item's qty reaches 0, remove it from the cart
      if (cart.items[itemIndex].qty <= 0) {
        cart.items.splice(itemIndex, 1);
      }
      
      //delete cart if qty is 0
      if (cart.totalQty <= 0) {
        await Cart.findByIdAndRemove(cart._id);
        return res.json({ success: true, cart: null });
      }
      
      await cart.save();
      res.json({ success: true, cart });
    } else {
      res.status(404).json({ success: false, message: "Item not found in cart" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});


// POST: remove all instances of a single product from the cart
router.post("/removeAll/:id", jwtAuth, async function (req, res) {
  const productId = req.params.id;
  try {
    const cart = await Cart.findOne({ user: req.user.id }); //first find the cart
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    //find the item with productId
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      cart.totalQty -= cart.items[itemIndex].qty;
      cart.totalCost -= cart.items[itemIndex].price;
      cart.items.splice(itemIndex, 1);
      
      //delete cart if qty is 0
      if (cart.totalQty <= 0) {
        await Cart.findByIdAndRemove(cart._id);
        return res.json({ success: true, cart: null });
      }
      
      await cart.save();
      res.json({ success: true, cart });
    } else {
      res.status(404).json({ success: false, message: "Item not found in cart" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});





// GET: checkout form (public, data loaded via AJAX) 
//here i just render the html page, the data will be loaded via AJAX
router.get("/checkout", async (req, res) => {
  res.render("shop/checkout", { pageName: "Checkout" });
}); //now the checkout page is rendered, and the data will be loaded via AJAX

// POST: handle checkout logic (restore to flat 8% tax, shipping by ID only)
router.post("/checkout", jwtAuth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });//fiest check if the cart exists and has items
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty." });
    }

    // Check if all items are still in stock and reduce quantities ,this is additional 
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product ${item.title} no longer exists.` });
      }
      if (product.quantity < item.qty) {
        return res.status(400).json({ success: false, message: `Not enough ${item.title} in stock.` });
      }
      // Reduce product quantity
      product.quantity -= item.qty;
      await product.save();
    }

    //check if the shipping method is valid
    const { address, shippingMethod, paymentMethod } = req.body; 
    const shipping = await Shipping.findById(shippingMethod);
    if (!shipping) {
      return res.status(400).json({ success: false, message: "Invalid shipping method." });
    }
    // Flat 8% taxxx
    const taxRate = 0.08;
    const taxAmount = cart.totalCost * taxRate;
    const shippingCost = shipping.price;
    const totalAmount = cart.totalCost + taxAmount + shippingCost;
    // Create order in the database now
    const order = new Order({
      user: req.user.id,
      cart: {
        totalQty: cart.totalQty,
        totalCost: cart.totalCost,
        items: cart.items,
      },
      address,
      shipping: {
        method: shipping._id,
        price: shippingCost,
        deliveryTime: shipping.deliveryTime,
      },
      tax: {
        rate: taxRate,
        amount: taxAmount,
      },
      totalAmount: totalAmount,
      paymentId: 'test_payment_' + Date.now(),
      status: 'pending',
      paymentMethod: paymentMethod || 'cash',
    });
    await order.save();
    await Cart.findByIdAndDelete(cart._id); // delete the cart after checkout
    //tell the user that the order was placed successfully
    res.json({ success: true, message: "Order placed successfully!", orderId: order._id, shippingCost, taxAmount, taxRate });
  } catch (error) { 
    res.status(500).json({ success: false, message: error.message });
  }
});

// create products array to store the info of each product in the cart
async function productsFromCart(cart) {
  let products = []; // array of objects
  for (const item of cart.items) { //looping in each item in the cart
    // find the product in the db and populate its category 
    let foundProduct = (
      await Product.findById(item.productId).populate("category")
    ).toObject();
    foundProduct["qty"] = item.qty;
    foundProduct["totalPrice"] = item.price;
    products.push(foundProduct);
  }
  return products;
}


// this used to get the cart count in the navbar
router.get("/cart/count", jwtAuth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    const count = cart ? cart.totalQty : 0;
    res.json({ count });
  } catch (err) {
    res.status(500).json({ count: 0 });
  }
});

// GET: cart data as JSON for AJAX to load in the shopping cart page without reloading the page
router.get("/cart/data", jwtAuth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.json({ success: true, cart: null, items: [] });
    }
    // Populate product info for each item
    const items = await Promise.all(cart.items.map(async item => {
      const product = await Product.findById(item.productId);
      return {
        title: product ? product.title : 'Unknown',
        price: item.price,
        qty: item.qty,
        productId: item.productId,
        imagePath: product ? product.imagePath : '',
      };
    }));
    res.json({ success: true, cart, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// GET: shipping methods for AJAX checkout
router.get('/shipping/methods', jwtAuth, async (req, res) => {
  try {
    const methods = await Shipping.find({ isActive: true });
    res.json({ success: true, methods });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
