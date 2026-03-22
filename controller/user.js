const User = require("../models/user.js");

// ---------------- Signup ----------------
module.exports.renderSignupForm = (req, res) => {
  return res.render("user/signup.ejs"); 
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err); 
      req.flash("success", "Welcome to Wanderlust! Account created successfully.");
      res.locals.success = req.flash("success");
      return res.redirect("/listings");
    });

  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/signup"); 
  }
};

// ---------------- Login ----------------
module.exports.renderLoginForm = (req, res) => {
  return res.render("user/login.ejs"); 
};

module.exports.login = (req, res, next) => {
  try {
    req.flash("success", "Welcome back to Wanderlust!");

    const redirectUrl = res.locals.redirectUrl || "/listings";
    delete req.session.redirectUrl; 
    return res.redirect(redirectUrl); 
  } catch (e) {
    return next(e); 
  }
};

// ---------------- Logout ----------------
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);  
    req.flash("success", "Logged out successfully!");
    return res.redirect("/listings");   
  });
};