const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const ImageKit = require("imagekit");
const axios = require("axios");
const Booking = require("../models/booking.js");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});


const validCategories = [
  "trending","iconic","rooms","mountain","castle","pools",
  "camping","farm","arctic","beach","luxury","budget",
  "city","desert","forest","lake","island",
  "heritage","eco","pet-friendly"
];

module.exports.index = async (req, res) => {
  let { category, search } = req.query;

  if (category === "undefined" || category === "") {
    category = undefined;
  }

  if (category && !validCategories.includes(category)) {
    req.flash("error", "Invalid category selected");
    return res.redirect("/listings");
  }

  let filter = {};

  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { country: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }

  const allListings = await Listing.find(filter);

  for (let listing of allListings) {
    if (!listing.geometry || listing.geometry.coordinates[0] === 0) {
      try {
        const geoData = await axios.get(
          "https://api.opencagedata.com/geocode/v1/json",
          {
            params: {
              q: `${listing.location}, ${listing.country}`,
              key: process.env.OPENCAGE_API_KEY,
            },
          }
        );

        if (geoData.data.results.length > 0) {
          const lat = geoData.data.results[0].geometry.lat;
          const lon = geoData.data.results[0].geometry.lng;

          listing.geometry = {
            type: "Point",
            coordinates: [lon, lat],
          };

          await listing.save();
        }
      } catch (err) {
        console.log(`Geocoding error for ${listing.title}:`, err.message);
      }
    }
  }

  res.render("listings/index.ejs", { allListings, search, category });
};
// ---------------- Show ----------------
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) throw new ExpressError(404, "Listing not found");

  if (!listing.geometry || listing.geometry.coordinates[0] === 0) {
    try {
      const geoData = await axios.get(
        "https://api.opencagedata.com/geocode/v1/json",
        {
          params: {
            q: `${listing.location}, ${listing.country}`,
            key: process.env.OPENCAGE_API_KEY,
          },
        }
      );

      if (geoData.data.results.length > 0) {
        const lat = geoData.data.results[0].geometry.lat;
        const lon = geoData.data.results[0].geometry.lng;

        listing.geometry = {
          type: "Point",
          coordinates: [lon, lat],
        };

        await listing.save();
      }
    } catch (err) {
      console.log(`Geocoding error for ${listing.title}:`, err.message);
    }
  }

  res.render("listings/show.ejs", { listing });
};

// ---------------- Create ----------------
module.exports.createListing = async (req, res) => {
  const { title, description, price, country, location, category } = req.body.listing;


  if (!category || !validCategories.includes(category)) {
    req.flash("error", "Invalid category selected");
    return res.redirect("/listings/new");
  }

  let imageData = {
    filename: "listingimage",
    url: "https://images.unsplash.com/photo-1593642634443-44adaa06623a",
  };

  if (req.file) {
    try {
      const result = await imagekit.upload({
        file: req.file.buffer.toString("base64"),
        fileName: Date.now() + "-" + req.file.originalname,
        folder: "wanderlust",
      });

      imageData = {
        filename: result.fileId,
        url: result.url,
      };
    } catch (err) {
      console.error("ImageKit upload error:", err);
      req.flash("error", "Image upload failed, using default image.");
    }
  }

  let geometry = { type: "Point", coordinates: [0, 0] };

  try {
    const geoData = await axios.get(
      "https://api.opencagedata.com/geocode/v1/json",
      {
        params: { q: `${location}, ${country}`, key: process.env.OPENCAGE_API_KEY },
      }
    );

    if (geoData.data.results.length > 0) {
      const lat = geoData.data.results[0].geometry.lat;
      const lon = geoData.data.results[0].geometry.lng;

      geometry = { type: "Point", coordinates: [lon, lat] };
    }
  } catch (err) {
    console.log("Geocoding error:", err.message);
  }

  const newListing = new Listing({
    title,
    description,
    image: imageData,
    price,
    country,
    location,
    category,
    geometry,
    owner: req.user._id,
  });

  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

// ---------------- Edit Page ----------------
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Listing not found");

  res.render("listings/edit.ejs", { listing });
};

// ---------------- Update ----------------
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, country, location, category } = req.body.listing;

  if (!category || !validCategories.includes(category)) {
    req.flash("error", "Invalid category selected");
    return res.redirect(`/listings/${id}/edit`);
  }

  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Listing not found");

  if (req.file) {
    try {
      const result = await imagekit.upload({
        file: req.file.buffer.toString("base64"),
        fileName: Date.now() + "-" + req.file.originalname,
        folder: "wanderlust",
      });

      listing.image = { filename: result.fileId, url: result.url };
    } catch (err) {
      console.error("ImageKit upload error:", err);
      req.flash("error", "Image upload failed, keeping previous image.");
    }
  }

  try {
    const geoData = await axios.get(
      "https://api.opencagedata.com/geocode/v1/json",
      { params: { q: `${location}, ${country}`, key: process.env.OPENCAGE_API_KEY } }
    );

    if (geoData.data.results.length > 0) {
      const lat = geoData.data.results[0].geometry.lat;
      const lon = geoData.data.results[0].geometry.lng;

      listing.geometry = { type: "Point", coordinates: [lon, lat] };
    }
  } catch (err) {
    console.log("Geocoding error:", err.message);
  }

  listing.title = title;
  listing.description = description;
  listing.price = price;
  listing.country = country;
  listing.location = location;
  listing.category = category;

  await listing.save();

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// ---------------- Delete ----------------
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;

  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted Successfully!");
  res.redirect("/listings");
};

// ---------------- My Bookings ----------------
module.exports.myBookings = async (req, res) => {
  const allBookings = await Booking.find({ user: req.user._id })
    .populate("listing");

  const validBookings = allBookings.filter(b => b.listing !== null);

  if (validBookings.length === 0) {
    req.flash("error", "You have no bookings yet!");
    return res.redirect("/listings");
  }

  res.render("listings/bookings.ejs", { allBookings: validBookings });
};

// ---------------- Create Booking ----------------
module.exports.createBooking = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);
  
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const newBooking = new Booking({
    listing: id,
    user: req.user._id,
  });

  await newBooking.save();

  req.flash("success", "Booking Successful!");
  res.redirect("/listings/mybookings");
};