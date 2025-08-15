// routes/injectSnippet.js
// const express = require("express");
// const router = express.Router();
// const axios = require("axios");
// const { getTokenByShop } = require("../controllers/getTokenByShop");

// Function to inject model-viewer snippet

// API endpoint
// router.post("/", async (req, res) => {
//   const { shop } = req.body;
//   const accessToken = await getTokenByShop(shop);
//   if (!shop) return res.status(400).json({ error: "shop & accessToken required" });
//   if (!accessToken) return res.status(404).json({ error: "Token not found" })


//   const result = await injectModelViewer(shop, accessToken);
//   res.json({ success: result });
// });

// module.exports = router;
