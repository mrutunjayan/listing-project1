const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  title: Joi.string().required().messages({
    "string.empty": "Title is required",
  }),

  description: Joi.string().required().messages({
    "string.empty": "Description is required",
  }),

  image: Joi.string().allow("", null),

  price: Joi.number().min(0).required().messages({
    "number.base": "Price must be number",
    "number.min": "Price cannot be negative",
    "any.required": "Price is required",
  }),

  country: Joi.string().required().messages({
    "string.empty": "Country is required",
  }),

  location: Joi.string().required().messages({
    "string.empty": "Location is required",
  }),

  category: Joi.string()
    .valid(
      "trending",
      "iconic",
      "rooms",
      "mountain",
      "castle",
      "pools",
      "camping",
      "farm",
      "arctic",
      "beach",
      "luxury",
      "budget",
      "city",
      "desert",
      "forest",
      "lake",
      "island",
      "heritage",
      "eco",
      "pet-friendly",
    )
    .required()
    .messages({
      "any.only": "Invalid category selected",
      "any.required": "Category is required",
    }),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required().messages({
      "any.required": "Rating is required",
      "number.base": "Rating must be a number",
      "number.min": "Rating must be at least 1",
      "number.max": "Rating cannot exceed 5",
    }),

    comment: Joi.string().required().messages({
      "string.empty": "Comment is required",
    }),
  }).required(),
});
