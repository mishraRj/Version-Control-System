// middleware/upload.js
const multer = require("multer");

const storage = multer.memoryStorage(); // keep file in memory to stream to Cloudinary
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 5 MB limit (adjust as needed)
});

module.exports = upload;
