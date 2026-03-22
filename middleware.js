const Listing = require("./models/listing");
const Review = require("./models/review");

// ---------------- LOGIN CHECK ----------------
module.exports.isLoggedin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to continue!");
    return res.redirect("/login");  
  }
  return next();  
};


module.exports.savedredirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  return next();  
};

// ---------------- OWNER CHECK ----------------
module.exports.isOwner = async (req, res, next) => {
  try {
    let { id } = req.params;

    let listing = await Listing.findById(id);

      
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

      
    if (!req.user || !listing.owner.equals(req.user._id)) {
      req.flash("error", "You are not the owner of this listing!");
      return res.redirect(`/listings/${id}`);
    }

    return next();  
  } catch (err) {
    return next(err); 
  }
};

// ---------------- REVIEW AUTHOR CHECK ----------------
module.exports.isreviewAuthor = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;

    const review = await Review.findById(reviewId);

      
    if (!review) {
      req.flash("error", "Review not found!");
      return res.redirect(`/listings/${id}`);
    }

    
    if (!req.user || !review.author.equals(req.user._id)) {
      req.flash("error", "You are not the author of this review!");
      return res.redirect(`/listings/${id}`);
    }

    return next();  
  } catch (err) {
    return next(err);   
  }
};