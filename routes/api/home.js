const express = require('express')
const router = express.Router()

router.get('/', (req, res) => res.json({success: 'Working fine. Access /routes to check app routes'}))

module.exports = router
