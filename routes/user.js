const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { savedredirectUrl } = require("../middleware.js");

const userController = require("../controller/user.js");

// ---------------- Signup ----------------
router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

// ---------------- Login ----------------
router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    savedredirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    (req, res) => {

      req.flash("success", "Welcome back to Wanderlust!");
      const redirectUrl = res.locals.redirectUrl || "/listings";
      delete req.session.redirectUrl; 
      return res.redirect(redirectUrl); 
    }
  );

// ---------------- Logout ----------------
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully!");
    return res.redirect("/listings"); 
  });
});

module.exports = router;