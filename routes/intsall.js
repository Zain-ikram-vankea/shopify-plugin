const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Body parser


// Serve static HTML
router.get("/install", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/install.html"));
});

// Handle form submission
router.post("/installation", (req, res) => {
  const shop = req.body.shop;
  if (!shop) return res.send("Please enter your Shopify store domain.");

  // Redirect to your app OAuth URL
  const redirectUrl = `https://shopify-plugin-production-781a.up.railway.app/auth?shop=${shop}`;
  res.redirect(redirectUrl);
});

module.exports = router;
