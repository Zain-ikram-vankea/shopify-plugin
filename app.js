const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs')
const crypto = require('crypto');


const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = '8aec735609afb23c90459280f4d04b22';           // apni API key yahan daalo
const API_SECRET = '388ff0786cf5902af5a8a4c58797f188';     // apni secret key yahan daalo
const SCOPES = 'read_products,write_products'; // app ke liye permissions
const FORWARDING_ADDRESS = 'https://3d-model-project.myshopify.com/'; // apni app ka public URL
// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));
app.use('/models', express.static(path.join(__dirname, 'models')));



function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}
// Route 1: Shopify OAuth Start
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

// Route 2: Shopify OAuth Callback
app.get('/auth/callback', async (req, res) => {
  const { shop, code, state } = req.query;

  // TODO: verify 'state' parameter for security

  try {
    const accessTokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: API_KEY,
      client_secret: API_SECRET,
      code,
    });

    const accessToken = accessTokenResponse.data.access_token;

    // Ab accessToken mil gaya hai, ise database ya memory me save karo

    res.send('App successfully installed! Access token: ' + accessToken);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during access token exchange');
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