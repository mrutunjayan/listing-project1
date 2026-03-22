const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const ListingSchema = new Schema(
{
  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  image: {
    filename: {
      type: String,
      default: "listingimage"
    },
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1593642634443-44adaa06623a?auto=format&fit=crop&w=800&q=80"
    }
  },

  price: {
    type: Number,
    required: true
  },

  location: {
    type: String,
    required: true
  },

  country: {
    type: String,
    required: true
  },

  category: {
    type: String,
  enum: [
  "trending","iconic","rooms","mountain","castle","pools",
  "camping","farm","arctic",
  "beach","luxury","budget","city","desert","forest",
  "lake","island","heritage","eco","pet-friendly"
],
    required: true,
    default: "rooms"
  },

  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], 
      default: [0, 0]
    }
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
},
{ timestamps: true }
);

const Listing = mongoose.model("Listing", ListingSchema);

module.exports = Listing;