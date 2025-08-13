const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Get all parts
router.get('/parts', (req, res) => {
  res.sendFile(path.join(__dirname, '../data/parts.json'));
});

// Get only addableParts
router.get('/added-parts', (req, res) => {
  const filePath = path.join(__dirname, '../data/parts.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'File read error' });
    }

    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData.addableParts);
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

module.exports = router;
