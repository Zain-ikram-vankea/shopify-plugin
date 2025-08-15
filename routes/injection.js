// routes/injectSnippet.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const { getTokenByShop } = require("../controllers/getTokenByShop");

// Function to inject model-viewer snippet
async function injectModelViewer(shop, accessToken) {

  const snippetCode = `
{% if model_field and model_field.value != blank %}
  <!-- Load model-viewer script -->
  <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>

  <model-viewer
    src="{{ model_field.value }}"
    alt="{{ product.title | escape }}"
    ar
    ar-modes="webxr scene-viewer quick-look"
    camera-controls
    auto-rotate
    shadow-intensity="1"
    style="width: 100%; height: 500px;"
  >
    <button slot="ar-button" class="button button--full-width">
      View in your space
    </button>
  </model-viewer>

{% elsif product.featured_image %}
  <!-- Show product image -->
  <img
    src="{{ product.featured_image | img_url: '1024x1024' }}"
    alt="{{ product.title | escape }}"
    style="width: 100%; height: auto;"
  >

{% else %}
  <!-- Shopify fallback text -->
  <p>No media available for this product.</p>
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
