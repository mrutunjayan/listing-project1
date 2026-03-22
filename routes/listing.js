const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../Schema.js");

const { isLoggedin, isOwner } = require("../middleware.js"); 
const listingController = require("../controller/listing.js");
const { upload } = require("../imagekitConfig.js");

// ---------------- Validation Middleware ----------------
const ValidateListing = (req, res, next) => {
  if (!req.body.listing) throw new ExpressError(400, "Listing is required");
  const { error } = listingSchema.validate(req.body.listing);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};

// ---------------- ObjectId Check Middleware ----------------
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid Listing ID");
    return res.redirect("/listings");
  }
  next();
};

router.get("/new", isLoggedin, (req, res) => {
  res.render("listings/new.ejs");
});


router.get("/mybookings", isLoggedin, wrapAsync(listingController.myBookings));

// ----------------  Index & Create ----------------
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedin,
    upload.single("listing[image]"),
    ValidateListing,
    wrapAsync(listingController.createListing)
  );

// ----------------  Booking Post Action ----------------
router.post("/:id/book", isLoggedin, wrapAsync(listingController.createBooking));

// ----------------  Edit Listing ----------------
router.get(
  "/:id/edit",
  validateObjectId,
  isLoggedin,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

// ----------------  Show, Update, Delete ----------------

router
  .route("/:id")
  .all(validateObjectId) 
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedin,
    isOwner,
    upload.single("listing[image]"),
    ValidateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedin,
    isOwner,
    wrapAsync(listingController.deleteListing)
  );

module.exports = router;