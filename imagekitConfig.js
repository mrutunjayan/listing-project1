const ImageKit = require("imagekit");
const multer = require("multer");

// ---------------- ImageKit Setup ----------------
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// ---------------- Multer Memory Storage ----------------
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); 
  } else {
    cb(new Error("Only image files (jpg, jpeg, png, webp, etc.) are allowed!"), false); 
  }
};

// ---------------- Multer Upload ----------------
const upload = multer({
  storage,
  fileFilter,
});

module.exports = { imagekit, upload };