require("dotenv").config();//to read .env file
const createError = require("http-errors");
const express = require("express"); // Express web server framework
const path = require("path"); //to act with static files
const cookieParser = require("cookie-parser"); // to act with cookies and static files
const logger = require("morgan"); // same above
const mongoose = require("mongoose"); // to connect to MongoDB
const passport = require("passport"); // to handle authentication
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt"); // JWT strategy for Passport
const { verifyToken } = require("./config/jwt");
const Category = require("./models/category"); 
const User = require("./models/user");
const connectDB = require("./config/db"); // to connect to MongoDB db.js file
const session = require('express-session');

const app = express();
require("./config/passport");

// mongodb configuration
connectDB();
// view engine setup using ejs w mawgoda fe views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// admin route connect with admin.js file 
const adminRouter = require("./routes/admin");
app.use("/admin", adminRouter);
//middleware configuration 
app.use(logger("dev")); // to print logs in the console
app.use(express.json()); // understand fornend data as json
app.use(express.urlencoded({ extended: false })); //just forms 
app.use(cookieParser()); // to read cookies kolha 

// Flash Messages Configuration
const flash = require('connect-flash');
app.use(session({
  secret: process.env.SESSION_SECRET || 'mysecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use(express.static(path.join(__dirname, "public"))); // read static files from public folder (html, css, js, images)

// Configure Passport JWT Strategyyyyy 
//how the passport will extract the token from the request and how to verify it 
// from the DB if vaid token 
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key'
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

app.use(passport.initialize());


/* Middleware to check if the in the request JWT ? and if yess and valid token 
then (passport will) decode it and add the user info in req.user and res.locals.currentUser 
w da mofeed fel frontend a3raf el user da meen
*/ 
app.use(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
        res.locals.currentUser = decoded;
      }
    }
    // Always set login and currentUser for EJS
    res.locals.login = !!req.user;
    res.locals.currentUser = req.user || null;
    const categories = await Category.find({}).sort({ title: 1 }).exec();
    res.locals.categories = categories;
    next();
  } catch (error) {
    console.log(error);
    next();
  }
});



// add breadcrumbs like home > products > product name
// this function will create the breadcrumbs based on the url
get_breadcrumbs = function (url) {
  var rtn = [{ name: "Home", url: "/" }],
    acc = "", // accumulative url
    arr = url.substring(1).split("/");

  for (i = 0; i < arr.length; i++) {
    acc = i != arr.length - 1 ? acc + "/" + arr[i] : null;
    rtn[i + 1] = {
      name: arr[i].charAt(0).toUpperCase() + arr[i].slice(1),
      url: acc,
    };
  }
  return rtn;
};
app.use(function (req, res, next) {
  req.breadcrumbs = get_breadcrumbs(req.originalUrl);
  next();
});

//routes config 
const indexRouter = require("./routes/index");
const productsRouter = require("./routes/products");
const usersRouter = require("./routes/user");
const pagesRouter = require("./routes/pages");
app.use("/products", productsRouter);
app.use("/user", usersRouter);
app.use("/pages", pagesRouter);
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
// server running on port 3000
var port = process.env.PORT || 3000;
app.set("port", port);

app.listen(port, (err) => {
  if (err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Please free the port or use a different one.`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  } else {
    console.log("Server running at port " + port);
  }
});

module.exports = app;
