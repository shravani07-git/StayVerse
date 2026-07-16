const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const search =
    typeof req.query.search === "string"
      ? req.query.search.trim()
      : "";

  const selectedCountry =
    typeof req.query.country === "string"
      ? req.query.country.trim()
      : "";

  const selectedCategory =
    typeof req.query.category === "string"
      ? req.query.category.trim()
      : "";

  const filter = {};

  // Search by destination or title
  if (search) {
    const escapedSearch = search.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const searchRegex = new RegExp(escapedSearch, "i");

    filter.$or = [
      { location: searchRegex },
      { title: searchRegex },
    ];
  }

  // Filter by country
  if (selectedCountry) {
    filter.country = selectedCountry;
  }

  // Filter by category icon
  if (selectedCategory) {
    filter.category = selectedCategory;
  }

  const [allListings, countries] = await Promise.all([
    Listing.find(filter),
    Listing.distinct("country"),
  ]);

  const validCountries = countries
    .filter((country) => country)
    .sort((a, b) => a.localeCompare(b));

  res.render("listings/index", {
    allListings,
    countries: validCountries,
    search,
    selectedCountry,
    selectedCategory,
  });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};



module.exports.showListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing you requested does not exist");
      return res.redirect("/listings");
    }

    console.log(listing);
    res.render("listings/show", { listing });
  // )
};


module.exports.createListing = async (req, res) => {
     console.log(req.body);
    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.listings.location,
        limit: 1,
      })
      .send();

    console.log(response.body.features[0]);

    let url = req.file.path;
    let filename = req.file.filename;

   const newListing = new Listing(req.body.listings);

    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;

    console.log("Geometry:", newListing.geometry);

    await newListing.save();

    req.flash("success", "New Listing Created");

    res.redirect("/listings");
};
    module.exports.renderEditForm = async (req, res) => {
        let { id } = req.params;
        let listing = await Listing.findById(id);
    
        if (!listing) {
          req.flash("error", "Listing not found!");
          return res.redirect("/listings");
        }
        let originalImageUrl = listing.image.url;
        originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");
    
        res.render("listings/edit", { listing,originalImageUrl });
      }
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
let listing = await Listing.findByIdAndUpdate(id, req.body.listings);

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;

        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);
};

   module.exports.destroyListing = async (req, res) => {
       const { id } = req.params;
   
       await Listing.findByIdAndDelete(id);
        req.flash("success","Listing Deleted");
   
       res.redirect("/listings");
     }

