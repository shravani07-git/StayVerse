require("dotenv").config();
const mongoose = require("mongoose");

const dbUrl = process.env.ATLASDB_URL;

async function testDB() {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(dbUrl);

    console.log("✅ Connected to MongoDB Atlas successfully!");

    await mongoose.disconnect();
    console.log("Disconnected.");
  } catch (err) {
    console.error("❌ MongoDB connection failed:");
    console.error(err);
  }
}

testDB();