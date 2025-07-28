// Middleware to compress images
const sharp = require('sharp'); // For image compression
const fs = require('fs'); // For file system operations

const compressImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();
  
  try {
    await Promise.all(req.files.map(async (file) => {
      await sharp(file.path)
        .resize(1200) // Resize to max width 1200px (maintains aspect ratio)
        .jpeg({ quality: 80 }) // Adjust quality
        .toFile(file.path + '.compressed');
      
      // Replace original with compressed version
      fs.unlinkSync(file.path);
      fs.renameSync(file.path + '.compressed', file.path);
    }));
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = compressImages;
// Ensure to install sharp and fs if not already installed