require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utlis/ExpressError.js");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

console.log("MongoDB URL:", dbUrl);

if (!dbUrl) {
  console.error("ATLASDB_URL is missing from the .env file");
  process.exit(1);
}

// MongoDB connection
// MongoDB connection
async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to MongoDB Atlas");

 
}

main().catch((err) => {
  console.error("MongoDB connection error:", err);
});

// View engine setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Basic middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// MongoDB session store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SESSION_SECRET || "mysupersecretstring",
  },
  touchAfter: 24 * 60 * 60,
});

store.on("error", (err) => {
  console.error("MongoDB session store error:", err);
});

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET || "mysupersecretstring",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// Session must be initialized only once
app.use(session(sessionOptions));
app.use(flash());

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Variables available in every EJS file
app.use((req, res, next) => {
  res.locals.success = req.flash("success") || [];
  res.locals.error = req.flash("error") || [];
  res.locals.currUser = req.user || null;
  next();
});

// Temporary demo-user route
app.get("/demouser", async (req, res, next) => {
  try {
    const fakeUser = new User({
      email: "student@gmail.com",
      username: "delta-student",
    });

    const registeredUser = await User.register(
      fakeUser,
      "helloworld"
    );

    res.send(registeredUser);
  } catch (err) {
    next(err);
  }
});

// Routes
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// 404 handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;

  res.locals.success = res.locals.success || [];
  res.locals.error = res.locals.error || [];
  res.locals.currUser = res.locals.currUser || null;

  res.status(statusCode).render("error.ejs", {
    err,
    message,
  });
});

// Server start
app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});