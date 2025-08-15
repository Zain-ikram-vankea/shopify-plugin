// routes/injectSnippet.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const { getTokenByShop } = require("../controllers/getTokenByShop");

// Function to inject model-viewer snippet
async function injectModelViewer(shop, accessToken) {

  const snippetCode = `
{% if product.metafields.custom['3d_model'] %}
  <!-- Load model-viewer script -->
  <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>

  <model-viewer
    src="{{ product.metafields.custom['3d_model'] }}"
    alt="{{ product.title | escape }}"
    ar
    camera-controls
    auto-rotate
    style="width: 100%; height: 500px;"
  ></model-viewer>

{% else %}
  <!-- Fallback image -->
  <img
    src="{{ product.featured_image | img_url: '1024x1024' }}"
    alt="{{ product.title | escape }}"
    style="width: 100%; height: auto;"
  >
{% endif %}

`;

  try {
    // 1️⃣ Get main theme
    const themeRes = await axios.get(
      `https://${shop}/admin/api/2025-01/themes.json`,
      { headers: { "X-Shopify-Access-Token": accessToken } }
    );

    const mainTheme = themeRes.data.themes.find(t => t.role === "main");
    if (!mainTheme) throw new Error("Main theme not found");

    // 2️⃣ Upload snippet
    await axios.put(
      `https://${shop}/admin/api/2025-01/themes/${mainTheme.id}/assets.json`,
      {
        asset: {
          key: "snippets/model-viewer.liquid",
          value: snippetCode
        }
      },
      { headers: { "X-Shopify-Access-Token": accessToken } }
    );

    console.log("✅ Snippet uploaded successfully!");
    return true;
  } catch (err) {
    console.error("❌ Failed to inject snippet:", err.response?.data || err.message);
    return false;
  }
}

// API endpoint
router.post("/", async (req, res) => {
  const { shop } = req.body;
  const accessToken = await getTokenByShop(shop);
  if (!shop) return res.status(400).json({ error: "shop & accessToken required" });
  if (!accessToken) return res.status(404).json({ error: "Token not found" })


  const result = await injectModelViewer(shop, accessToken);
  res.json({ success: result });
});

module.exports = router;
