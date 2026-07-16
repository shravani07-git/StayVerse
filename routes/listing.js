if(process.env.NODE_ENV != "production"){
  require('dotenv').config()
}
console.log(process.env.SECRET)
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utlis/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isloggedin,isOwner,validateListing} = require("../middleware.js");
const ListingController = require("../controllers/listing.js")
const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage })

//create and index route
router.route("/")
  .get(wrapAsync(ListingController.index))
  .post(
    isloggedin,
    //validateListing,
    upload.single("listings[image]"),
    wrapAsync(ListingController.createListing)
  );


// NEW Route
router.get("/new", isloggedin, ListingController.renderNewForm);

  // delete update and show
  router.route("/:id")
  .get(wrapAsync(ListingController.showListing))
  .put(
    isloggedin,
    isOwner,
        upload.single("listings[image]"),

    validateListing,
    wrapAsync(ListingController.updateListing)
  )
  .delete(
    isloggedin,
    isOwner,
    wrapAsync(ListingController.destroyListing)
  );


// EDIT Route
router.get(
  "/:id/edit",
  isloggedin,
  isOwner,
  wrapAsync(ListingController.renderEditForm)
);

module.exports = router;