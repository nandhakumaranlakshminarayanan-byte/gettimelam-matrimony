const NodeCache = require('node-cache');

// Shared OTP cache — registration OTP, the listing/account mobile-change
// OTP flow, and the short-lived "verified:<mobile>" marker verify-otp
// leaves behind all read/write this same instance. Expires in 5 minutes.
const otpCache = new NodeCache({ stdTTL: 300 });

module.exports = otpCache;
