const express = require("express");
const router = express.Router();
const { autoInjectModelViewer } = require("../controllers/injectFiles");
const { getTokenByShop } = require("../controllers/getTokenByShop");

router.post("/", async (req, res) => {
  const { shop } = req.body;
  if (!shop) return res.status(400).json({ error: "Shop is required" });

  const accessToken = await getTokenByShop(shop);
  if (!accessToken) return res.status(404).json({ error: "Token not found" });

  try {
    const result = await autoInjectModelViewer(shop, accessToken);
    res.json({ success: true, details: result });
  } catch (err) {
    console.error("❌ Auto Inject Failed:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
