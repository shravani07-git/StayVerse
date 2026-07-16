const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utlis/wrapAsync.js");
const ExpressError = require("../utlis/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {
  validateReview,
  isloggedin,
  isReviewAuthor,
} = require("../middleware.js");

const reviewsController = require("../controllers/reviews.js")

// CREATE review
router.post("/", 
    isloggedin,
    validateReview, 
    wrapAsync(reviewsController.createReview));

router.delete(
  "/:reviewId",
  isloggedin,
  isReviewAuthor,
  wrapAsync(reviewsController.destroyReview)
);

module.exports = router;