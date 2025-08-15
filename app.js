require('dotenv').config()
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./db/db');
const Parts = require('./routes/getParts')
const authRoutes = require('./routes/shopifyAuth');
const homeRoutes = require('./routes/homePage');
const addProduct = require('./routes/addProducts')
const inject = require("./routes/injection")
const install = require("./routes/intsall")

const app = express();
app.use(cors());

app.use(express.json());

// Agar form-data ya urlencoded aa raha hai
app.use(express.urlencoded({ extended: true }));
connectDB()
const PORT = process.env.PORT || 3000;
app.use('/data', express.static(path.join(__dirname, 'data')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/models', express.static(path.join(__dirname, 'models')));
app.use('/js/three', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/api/', Parts)
app.use('/shopify', inject)
app.use('/', authRoutes);
app.use('/', homeRoutes);
app.use('/', addProduct);
app.use('/', install);
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});