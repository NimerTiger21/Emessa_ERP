const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimiter');

//router.post('/login', loginLimiter, authController.login);
router.post('/login', authController.login);

module.exports = router;