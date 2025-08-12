const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs')
const crypto = require('crypto');
const axios = require('axios');


const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = 'cb9e877fbdd4b8b9a2c5819fb1e5ced1';     // Jo tumhe mila hai
const API_SECRET = 'a3e8290d7e30b6118f61a0094b8aad7d'; // Jo tumhe mila hai
const SCOPES = 'read_products,write_products'; // app ke liye permissions
const FORWARDING_ADDRESS = 'https://shopify-plugin-production-781a.up.railway.app'; // apni app ka public URL
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));
app.use('/models', express.static(path.join(__dirname, 'models')));


// Security ke liye random state banane ka function
function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

// Step 1: /auth route — user ko Shopify authorization page pe bhejta hai
app.get('/auth', (req, res) => {
  const shop = req.query.shop;
  if (!shop) {
    return res.status(400).send('Missing shop parameter');
  }

  const state = generateNonce();
  const redirectUri = `${FORWARDING_ADDRESS}/auth/callback`;
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${API_KEY}&scope=${SCOPES}&state=${state}&redirect_uri=${redirectUri}`;

  res.redirect(installUrl);
});

// Step 2: /auth/callback — Shopify se authorization code leta hai aur access token ke liye request bhejta hai
app.get('/auth/callback', async (req, res) => {
  const { shop, code, state } = req.query;

  // TODO: yahan state verify karo

  try {
    const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: API_KEY,
      client_secret: API_SECRET,
      code,
    });

    const accessToken = tokenResponse.data.access_token;

    // Ab access token mil gaya, isse database me save karo ya jahan chaho
    res.send('App installed! Access Token: ' + accessToken);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error exchanging token');
  }
});


async function getProducts(shop, accessToken) {
  const response = await axios.get(`https://${shop}/admin/api/2023-07/products.json`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json'
    }
  });
  return response.data.products;
}



app.get('/products', async (req, res) => {
  const shop = req.query.shop;           // shop domain, e.g. your-store.myshopify.com
  const accessToken = req.query.token;  // access token, ya apne storage se fetch karo

  if (!shop || !accessToken) {
    return res.status(400).send('Missing shop or access token');
  }

  try {
    const products = await getProducts(shop, shpua_ded178cce006e9ab590c3031008200e4);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching products');
  }
});







// Serve Three.js safely from node_modules
app.use('/js/three', express.static(path.join(__dirname, 'node_modules/three/build')));

// API Routes
app.get('/api/parts', (req, res) => {
  res.sendFile(path.join(__dirname, 'data/parts.json'));
});
// Sirf addableParts return
app.get('/api/addedparts', (req, res) => {
  const filePath = path.join(__dirname, 'data/parts.json');

  // File read karo
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'File read error' });
    }

    // JSON parse karke addableParts nikaalo
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData.addableParts);
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});
// Homepage Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Error Handling Middleware
app.use((req, res) => {
  res.status(404).send("Page not found!");
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Server error!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});