require('dotenv').config()
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser')
const { connectDB } = require('./db/db');
const authRoutes = require('./routes/shopifyAuth');
const addProduct = require('./routes/addProducts')
const install = require("./routes/intsall")

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser())

app.use(express.urlencoded({ extended: true }));
connectDB()
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// app.use('/shopify', inject)
app.use('/', authRoutes);
app.use('/', addProduct);
app.use('/', install);
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});