const User = require("../models/User");
const Wallet = require("../models/Wallet");
const stripe = require("../utils/stripe");
const paystack = require("../utils/paystack");

// Initialize Paystack Payment
exports.initializePayment = async (req, res) => {
  const { amount } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.email) {
      return res.status(400).json({ message: "User email is required for payment" });
    }

    const paystackResponse = await paystack.transaction.initialize({
      email: user.email,
      amount: amount * 100, // Amount in kobo
      callback_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/wallet/success`,
      metadata: {
        userId: userId.toString(),
      },
    });

    if (paystackResponse.status) {
      res.status(200).json({
        message: "Payment initialized",
        authorization_url: paystackResponse.data.authorization_url,
        reference: paystackResponse.data.reference,
      });
    } else {
      res.status(400).json({ message: "Payment initialization failed", error: paystackResponse.message });
    }
  } catch (error) {
    res.status(500).json({ message: "Error initializing payment", error: error.message });
  }
};

// Verify Paystack Payment
exports.verifyPayment = async (req, res) => {
  const { reference } = req.params;
  const userId = req.user._id;

  try {
    const paystackResponse = await paystack.transaction.verify(reference);

    if (paystackResponse.status && paystackResponse.data.status === "success") {
      const { amount, metadata, payment_method } = paystackResponse.data;
      const actualAmount = amount / 100;

      let wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        wallet = new Wallet({ user: userId, balance: 0, transactions: [] });
      }

      // Check if this reference has already been processed
      const existingTxn = wallet.transactions.find(txn => txn.reference === reference);
      if (existingTxn) {
        return res.status(200).json({ message: "Payment already processed", wallet: wallet.balance });
      }

      wallet.balance += actualAmount;
      wallet.transactions.push({
        type: "credit",
        amount: actualAmount,
        description: "Money added via Paystack",
        reference,
        paymentMethod: payment_method,
        status: "approved"
      });

      await wallet.save();

      res.status(200).json({ message: "Payment verified successfully", wallet: wallet.balance });
    } else {
      res.status(400).json({ message: "Payment verification failed", status: paystackResponse.data.status });
    }
  } catch (error) {
    res.status(500).json({ message: "Error verifying payment", error: error.message });
  }
};

// Add Money to Wallet
// exports.addMoney = async (req, res) => {
//   const { amount, paymentMethodId } = req.body;
//   const userId = req.user._id;

//   try {
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Create a payment intent with Stripe
//     // const paymentIntent = await stripe.paymentIntents.create({
//     //   amount: amount * 100, // Amount in cents
//     //   currency: 'usd',
//     //   payment_method: paymentMethodId,
//     //   confirm: true,
//     // });

//     // Update wallet balance
//     let wallet = await Wallet.findOne({ user: userId });
//     if (!wallet) {
//       wallet = new Wallet({ user: userId });
//     }

//     wallet.balance += amount;
//     wallet.transactions.push({ type: "card", amount, description: "Stripe payment" });

//     await wallet.save();

//     res.status(200).json({ message: "Money added successfully", wallet: wallet.balance });
//   } catch (error) {
//     res.status(500).json({ message: "Error adding money", error: error.message });
//   }
// };
exports.addMoney = async (req, res) => {
  const { amount } = req.body;
  const userId = req.user._id;

  console.log("runing????");
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find or create the wallet
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = new Wallet({ user: userId, balance: 0, transactions: [] });
    }

    // Correctly add the amount to the existing balance
    wallet.balance += parseFloat(amount); // Ensure that the amount is treated as a number

    wallet.transactions.push({
      type: "credit", // "credit" indicates money added to the wallet
      amount,
      description: `Money added to wallet`,
    });

    await wallet.save();

    res
      .status(200)
      .json({ message: "Money added successfully", wallet: wallet.balance });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding money", error: error.message });
  }
};

// Withdraw Money from Wallet
// exports.withdrawMoney = async (req, res) => {
//   const { amount } = req.body;
//   const userId = req.user._id;

//   try {
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const wallet = await Wallet.findOne({ user: userId });
//     if (!wallet) {
//       return res.status(404).json({ message: "Wallet not found" });
//     }

//     if (wallet.balance < amount) {
//       return res.status(400).json({ message: "Insufficient balance" });
//     }

//     // Create a payout with Stripe
//     // const payout = await stripe.payouts.create({
//     //   amount: amount * 100, // Amount in cents
//     //   currency: "usd",
//     //   destination: bankAccountId,
//     // });

//     // Update wallet balance
//     wallet.balance -= amount;
//     wallet.transactions.push({
//       type: "card",
//       amount,
//       description: "Stripe payout",
//     });

//     await wallet.save();

//     res.status(200).json({
//       message: "Money withdrawn successfully",
//       wallet: wallet.balance,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error withdrawing money", error: error.message });
//   }
// };
exports.withdrawMoney = async (req, res) => {
  const { amount } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Add withdrawal request with pending status
    wallet.transactions.push({
      type: "debit",
      amount,
      description: "Withdrawal request",
    });

    await wallet.save();

    res.status(200).json({
      message:
        "Withdrawal request submitted successfully. Awaiting admin approval.",
    });
  } catch (error) {
    console.error("Withdraw Money Error:", error);
    res.status(500).json({
      message: "Error processing withdrawal",
      error: error.message,
    });
  }
};

// exports.withdrawMoney = async (req, res) => {
//   const { amount } = req.body;
//   const userId = req.user._id;

//   try {
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const wallet = await Wallet.findOne({ user: userId });
//     if (!wallet) {
//       return res.status(404).json({ message: "Wallet not found" });
//     }

//     if (wallet.balance < amount) {
//       return res.status(400).json({ message: "Insufficient balance" });
//     }

//     // Simulate the withdrawal process
//     wallet.balance -= amount;
//     wallet.transactions.push({
//       type: "debit", // "debit" indicates money withdrawn from the wallet
//       amount,
//       description: `Money withdrawn from wallet`,
//     });

//     await wallet.save();

//     res.status(200).json({
//       message: "Money withdrawn successfully",
//       wallet: wallet.balance,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error withdrawing money",
//       error: error.message,
//     });
//   }
// };

exports.approveWithdrawal = async (req, res) => {
  const { transactionId, status } = req.body; // status = "approved" or "declined"

  try {
    // Find the transaction
    const wallet = await Wallet.findOne({ "transactions._id": transactionId });
    if (!wallet) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const transaction = wallet.transactions.id(transactionId);
    if (!transaction || transaction.status !== "pending") {
      return res.status(400).json({ message: "Invalid transaction" });
    }

    if (status === "approved") {
      // Deduct balance on approval
      wallet.balance -= transaction.amount;
      transaction.status = "approved";
    } else if (status === "declined") {
      transaction.status = "declined"; // Just update status, no deduction
    } else {
      return res.status(400).json({ message: "Invalid status" });
    }

    await wallet.save();

    res.status(200).json({
      message: `Withdrawal ${status} successfully`,
      wallet: wallet.balance,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing withdrawal", error: error.message });
  }
};

exports.getPendingWithdrawals = async (req, res) => {
  try {
    const wallets = await Wallet.find({ "transactions.status": "pending" });

    const pendingWithdrawals = wallets.flatMap((wallet) =>
      wallet.transactions
        .filter((txn) => txn.status === "pending")
        .map((txn) => ({
          transactionId: txn._id,
          userId: wallet.user,
          amount: txn.amount,
          description: txn.description,
          date: txn.date,
        }))
    );

    res.status(200).json({ pendingWithdrawals });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching pending withdrawals",
      error: error.message,
    });
  }
};

// Check Wallet Balance
exports.checkBalance = async (req, res) => {
  const userId = req.user._id;

  try {
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      // Create a new wallet if one doesn't exist
      wallet = new Wallet({ user: userId, balance: 0, transactions: [] });
      await wallet.save();
    }

    res.status(200).json({ wallet: wallet.balance });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking balance", error: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  const userId = req.user._id;

  try {
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Sort the transactions by the most recent one first (newest to oldest)
    const transactions = wallet.transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date (ensure each transaction has a 'date' field)
      .slice(0, 5); // Get the last 5 transactions after sorting

    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching transactions",
      error: error.message,
    });
  }
};

exports.debitWallet = async (req, res) => {
  const { amount, type, description, userId } = req.body;
  // const userId = req.user.id; // Assuming you're using authentication middleware to get the user ID

  try {
    // Fetch the user's wallet balance
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Simulate the withdrawal process
    wallet.balance -= amount;
    wallet.transactions.push({
      type,
      amount,
      description,
    });
    await wallet.save();

    res.status(200).json({ message: "Wallet debited successfully" });
  } catch (error) {
    console.error("Error debiting wallet:", error);
    res.status(500).json({ message: "Server error" });
  }
};
