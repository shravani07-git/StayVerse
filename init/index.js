const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
require("dotenv").config({ path: "../.env" });

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


const mongoose = require ("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const { init 



} = require("../models/listing.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/StayVerse";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}
const initDB = async () => {
  await Listing.deleteMany({});

  let listings = [];

  for (let obj of initData.data) {
    let response = await geocodingClient
      .forwardGeocode({
        query: obj.location,
        limit: 1,
      })
      .send();

    obj.owner = "6a43755c7cc8d9e0917beefd";
    obj.geometry = response.body.features[0].geometry;

    listings.push(obj);
  }

  await Listing.insertMany(listings);

  console.log("Data was initialized");
};

initDB();