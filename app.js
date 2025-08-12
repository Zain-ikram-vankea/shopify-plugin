const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs')
const crypto = require('crypto');


const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = '2baa3481d2ab3900eb89332f94d34617';     // Jo tumhe mila hai
const API_SECRET = 'a1fd8a0812910e30511f58530231490b'; // Jo tumhe mila hai
//    // apni secret key yahan daalo
const SCOPES = 'read_products,write_products'; // app ke liye permissions
const FORWARDING_ADDRESS = 'https://shopify-plugin-production-781a.up.railway.app/'; // apni app ka public URL
// Middleware
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