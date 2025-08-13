const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const router = express.Router();

// Nonce generator (state parameter ke liye)
function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

// Step 1: Redirect user to Shopify authorization page
router.get('/auth', (req, res) => {
  const shop = req.query.shop;
  if (!shop) {
    return res.status(400).send('Missing shop parameter');
  }

  const state = generateNonce();
  const redirectUri = `${process.env.FORWARDING_ADDRESS}/auth/callback`;
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.API_KEY}&scope=${process.env.SCOPES}&state=${state}&redirect_uri=${redirectUri}`;

  res.redirect(installUrl);
});

// Step 2: Handle Shopify callback and exchange code for access token
router.get('/auth/callback', async (req, res) => {
  const { shop, code, state } = req.query;

  // TODO: Verify state parameter here for security

  try {
    const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: process.env.API_KEY,
      client_secret: process.env.API_SECRET,
      code,
    });

    const accessToken = tokenResponse.data.access_token;

    // Save token to DB (or wherever needed)
    res.send('App installed! Access Token: ' + accessToken);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error exchanging token');
  }
});

module.exports = router;
