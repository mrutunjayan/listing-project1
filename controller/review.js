const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../Schema.js");

// ---------------- Validate Review ----------------
const ValidateReview = (req, res, next) => {
  if (!req.body.review) {
    throw new ExpressError(400, "Review is required");
  }

  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }

  next();
};

module.exports.ValidateReview = ValidateReview;

module.exports.creatReviewcontroller = async (req, res) => {
  const { id } = req.params; // listing ID
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "New Review Created!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyReviewcontroller = async (req, res) => {
  const { id, reviewId } = req.params;
  
  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId }
  });

  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
};

