const express = require("express");
const axios = require("axios");
const { getTokenByShop } = require('../controllers/getTokenByShop')
const router = express.Router();

router.post("/add-product", async (req, res) => {
    const { title, body_html, vendor, product_type } = req.body;
      const shopDomain = req.cookies.shop_domain;

    try {
        // DB se token nikaalna
        const token = await getTokenByShop(shopDomain);
        if (!token) return res.status(401).json({ error: "Token not found" });

        // Shopify API call
        const productData = {
            product: {
                title,
                body_html,
                vendor,
                product_type
            }
        };

        const response = await axios.post(
            `https://${shopDomain}/admin/api/2024-07/products.json`,
            productData,
            {
                headers: {
                    "X-Shopify-Access-Token": token,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({ success: true, product: response.data.product });

    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "Failed to add product" });
    }
});

module.exports = router;
