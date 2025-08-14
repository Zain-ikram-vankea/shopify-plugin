const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const product = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'product',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});
const uploadModel = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "shopify_models",
    allowed_formats: ["glb", "usdz"]
  }
})

// ✅ Export both
module.exports = {
  product, uploadModel
};
