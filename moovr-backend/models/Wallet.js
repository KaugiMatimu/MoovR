// const mongoose = require("mongoose");

// const walletSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   balance: { type: Number, default: 0 },
//   transactions: [
//     {
//       amount: { type: Number, required: true },
//       description: { type: String, default: null },
//       type: { type: String, enum: ["credit", "debit"], required: true },
//       date: { type: Date, default: Date.now },
//     },
//   ],
// });

// module.exports = mongoose.model("Wallet", walletSchema);

const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  balance: { type: Number, default: 0 },
  transactions: [
    {
      amount: { type: Number, required: true },
      description: { type: String, default: null },
      type: { type: String, enum: ["credit", "debit"], required: true },
      status: {
        type: String,
        enum: ["pending", "approved", "declined"],
        default: function () {
          return this.type === "debit" ? "pending" : "approved"; // Only withdrawals start as pending
        },
      },
      reference: { type: String, default: null },
      paymentMethod: { type: String, default: null },
      date: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Wallet", walletSchema);
