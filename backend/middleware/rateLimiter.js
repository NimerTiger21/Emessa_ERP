const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false // Disable X-RateLimit-* headers
});

// Apply the rate limiting middleware to all requests.
//app.use(limiter)

module.exports = { loginLimiter };