const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.send("Warehouse Management API");
});

module.exports = router;
