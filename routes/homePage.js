const express = require('express');
const path = require('path');

const router = express.Router();

// Home page route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
router.get('/form', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/form.html'));
});


module.exports = router;
