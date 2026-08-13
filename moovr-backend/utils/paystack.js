const paystack = require("paystack")(process.env.PAYSTACK_SECRET_KEY);

module.exports = paystack;
