const express = require("express");
const router = express.Router();
const { getTokenByShop } = require("../controllers/getTokenByShop");
const axios = require("axios");
const multer = require("multer");
const { product, uploadModel } = require("../services/cloudinary");

// Separate multer instances for each storage config
const uploadImages = multer({ storage: product });
const uploadModels = multer({ storage: uploadModel });

// Combine both using fields()
const multiUpload = multer({
  storage: null // storage will be per-field basis
}).fields([
  { name: "images", maxCount: 5 },
  { name: "model", maxCount: 2 }
]);

// Middleware to choose storage dynamically
function dynamicStorage(req, file, cb) {
  if (file.fieldname === "images") {
    uploadImages.storage._handleFile(req, file, cb);
  } else if (file.fieldname === "model") {
    uploadModels.storage._handleFile(req, file, cb);
  }
}

const finalUpload = multer({ storage: { _handleFile: dynamicStorage, _removeFile: () => {} } })
  .fields([
    { name: "images", maxCount: 5 },
    { name: "model", maxCount: 1 }
  ]);

  router.post("/add-product", finalUpload, async (req, res) => {
    const { title, body_html, vendor, product_type } = req.body;

    if (!title || !body_html || !vendor || !product_type) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const shop = "3d-model-project.myshopify.com";

    try {
      const accessToken = await getTokenByShop(shop);
      if (!accessToken) return res.status(404).json({ error: "Token not found" });

      // Images from Cloudinary
      const imageUrls = (req.files["images"] || []).map(file => ({
        src: file.path,
        alt: file.originalname
      }));

      // Single model from Cloudinary
      const modelFile = req.files["model"]?.[0];
      const modelUrl = modelFile ? modelFile.path : null;

      // Shopify product payload
      const payload = {
        product: {
          title,
          body_html,
          vendor,
          product_type,
          status: "active",
          images: imageUrls,
          metafields: modelUrl
            ? [
                {
                  namespace: "custom",
                  key: "3d_model",
                  type: "url",
                  value: modelUrl
                }
              ]
            : []
        }
      };

      // 1️⃣ Create product
      const createRes = await axios.post(
        `https://${shop}/admin/api/2025-01/products.json`,
        payload,
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json"
          }
        }
      );

      const productId = createRes.data.product.id;

      // 2️⃣ Fetch product metafields immediately
      const metafieldsRes = await axios.get(
        `https://${shop}/admin/api/2025-01/products/${productId}/metafields.json`,
        {
          headers: { "X-Shopify-Access-Token": accessToken }
        }
      );

      // 3️⃣ Send back product + metafields in response
      res.json({
        success: true,
        product: createRes.data.product,
        metafields: metafieldsRes.data.metafields
      });
    } catch (error) {
      console.error(error.response?.data || error.message);
      res.status(500).json({ error: "Failed to add product" });
    }
  });



module.exports = router;
