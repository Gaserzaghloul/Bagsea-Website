let middlewareObject = {};

/*a middleware to make the user not open the login page or signup page if he is logged in
*/
middlewareObject.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
};


/*a middleware to make the user go to cart and profile and checkout pages if he is logged in
if not logged in he will be redirected to the login page
*/
middlewareObject.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/user/signin");
};

module.exports = middlewareObject;
