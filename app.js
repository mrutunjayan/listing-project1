if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
 const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const cors = require("cors");
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const User = require("./models/user.js");

// ---------------- Mongoose ----------------
mongoose.set("strictQuery", false);
const mongodb = process.env.MONGOATLAS_URI ;
mongoose.connect(mongodb)
  .then(() => {
    console.log(" Connected to MongoDB");
  })
  .catch(err => {
    console.log(" DB Connection Error:", err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

//---------------- Mongo Session Store ----------------
const secret = process.env.SECRET

const store = MongoStore.create({
  mongoUrl: mongodb,
  secret: secret,
  touchAfter: 24 * 60 * 60,
});


store.on("error", (err) => {
  console.log("SESSION STORE ERROR:", err);
});


const sessionOptions = {
  store,
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");


const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.use("/", userRouter);
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const { status = 500, message = "Something went wrong" } = err;

  try {
    return res.status(status).render("listings/Error.ejs", { message });
  } catch (renderErr) {
    return res.status(status).send(`<h1>Error ${status}</h1><p>${message}</p>`);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/listings`);
});