const express = require("express");
const router = express.Router({ mergeParams: true }); 

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const { reviewSchema } = require("../Schema.js");
const { isLoggedin, isOwner, isreviewAuthor } = require("../middleware.js");

const reviewController = require("../controller/review.js");

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

// ---------------- Create Review ----------------
router
  .route("/")
  .post(
    isLoggedin,
    ValidateReview,
    wrapAsync(reviewController.creatReviewcontroller)
  );

// ---------------- Delete Review ----------------
router
  .route("/:reviewId")
  .delete(
    isLoggedin,
    isreviewAuthor,
    wrapAsync(reviewController.destroyReviewcontroller)
  );

module.exports = router;