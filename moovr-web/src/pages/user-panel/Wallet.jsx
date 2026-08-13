import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaArrowLeft, FaEyeSlash, FaEye } from "react-icons/fa";
import "../../App.css";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import Header from "../../components/user-panel/header";
import { BaseURL } from "../../utils/BaseURL";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51Qh7pjPQrssbKnUgC5oCt75S821aZMLoqsfL92VMYo5qElNk5HBzv4QWU0TWQkRWb0UpvJohUkNzTGAE0gmzIizB00BLXMxG5h";

const Wallet = () => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("Google Pay");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]); // State for transactions
  const [isWithdrawVisible, setIsWithdrawVisible] = useState(false); // Manage withdraw form visibility
  const [isAddCashVisible, setIsAddCashVisible] = useState(false); // Manage add cash form visibility
  const [stripe, setStripe] = useState(null);
  const [stripeLoadError, setStripeLoadError] = useState(null);
  const [stripeLoaded, setStripeLoaded] = useState(false);

  

  // Fetch wallet balance and transactions on component load
  useEffect(() => {
    const fetchBalanceAndTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log(token);
        // Fetch balance
        const balanceResponse = await axios.get(`${BaseURL}/wallet/balance`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(balanceResponse);

        setBalance(balanceResponse.data.wallet);

        // Fetch transactions
        const transactionsResponse = await axios.get(
          `${BaseURL}/wallet/transactions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Transactions:", transactionsResponse.data.transactions);
        setTransactions(transactionsResponse.data.transactions);
      } catch (error) {
        console.error("Error fetching balance or transactions:", error);
      }
    };
    fetchBalanceAndTransactions();
  }, []);

  useEffect(() => {
    loadStripe(stripeKey)
      .then((loadedStripe) => {
        setStripe(loadedStripe);
        setStripeLoaded(true);
      })
      .catch((error) => {
        console.error("Stripe initialization failed:", error);
        setStripeLoadError(error);
        setStripeLoaded(true);
      });
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectMethod = (method) => {
    setSelectedMethod(method);
    setIsDropdownOpen(false);
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

 const addMoney = async () => {
  try {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.phone;

    // Validate before conversion
    if (!amount || amount < 1) { // Minimum ₦1
      toast.error("Minimum amount is ₦1");
      return;
    }

    // Convert to kobo (1 NGN = 100 kobo)
    const amountInKobo = Math.round(Number(amount) * 100);

    const response = await axios.post(
      `${BaseURL}/wallet/create-payment-intent`,
      {
        amount: amountInKobo, // Send in kobo
        userId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!stripeLoaded) {
      toast.error("Stripe is still loading. Please wait and try again.");
      return;
    }

    if (stripeLoadError || !stripe) {
      console.error("Stripe is unavailable:", stripeLoadError);
      toast.error(
        "Stripe is currently unavailable. Please try again later or use another payment method."
      );
      return;
    }

    if (!response.data?.sessionId) {
      throw new Error("Unable to create Stripe checkout session. Please try again later.");
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId: response.data.sessionId,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Full Payment Error:", {
      response: error.response?.data,
      message: error.message,
    });
    toast.error(
      error.response?.data?.details ||
        error.response?.data?.message ||
        error.message ||
        "Payment failed. Please try again later."
    );
  }
};

  // Withdraw money from wallet
  const withdrawMoney = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BaseURL}/wallet/withdraw`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update balance after withdrawal
      const response = await axios.get(`${BaseURL}/wallet/balance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBalance(response.data.wallet);
      toast.success(`Withdrew ₦${amount}`);
    } catch (error) {
      console.error("Error withdrawing money:", error);
      toast.error("Error withdrawing money from wallet");
    }
  };

  return (
    <div className="h-screen w-screen">
      {/* Header */}
      <Header />
      <section className="max-w-[1180px] mx-auto p-6 md:p-12">
        {/* Back Button */}
        <div className="flex items-center mb-4 cursor-pointer">
          <FaArrowLeft className="text-lg mr-2" />
          <span className="text-sm font-medium">Wallet</span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center mb-8 space-y-6 md:space-y-0 md:space-x-6">
          {/* Wallet Balance Card */}
          <div className="card-gradient p-6 rounded-lg shadow-md w-full max-w-[370px] h-[180px] relative">
            <div className="flex justify-end items-center">
              <img
                src="/images/avatar.png" // Replace with the path to the user's avatar image
                alt="User Avatar"
                className="h-8 w-8 rounded-full"
              />
            </div>
            <div className="flex justify-between gap-12 mt-2 items-end w-full ">
              <div className="flex flex-col justify-end items-start">
                <h2 className="text-sm font-medium text-gray-500">
                  Available balance
                </h2>
                <div className="my-2 flex items-center gap-3">
                  <p className="text-3xl font-semibold text-gray-900">
                    {isBalanceVisible ? `₦${balance}` : "₦•••••"}
                  </p>
                  <div
                    onClick={toggleBalanceVisibility}
                    className="cursor-pointer"
                  >
                    {isBalanceVisible ? (
                      <FaEyeSlash size={25} />
                    ) : (
                      <FaEye size={25} />
                    )}
                  </div>
                </div>
                <div className="flex items-center text-gray-400">
                  <span className="text-xs">
                    Tap to {isBalanceVisible ? "hide" : "show"} balance
                  </span>
                </div>
              </div>

              <div className="space-y-3 flex flex-col">
                <button
                  onClick={() => setIsAddCashVisible(!isAddCashVisible)}
                  className="text-[14px] bg-white rounded-full px-6 py-2 text-[#BF88F8] font-semibold"
                >
                  Add Cash
                </button>
                <button
                  onClick={() => setIsWithdrawVisible(!isWithdrawVisible)} // Toggle withdraw form visibility
                  className="text-[14px] bg-[#A75AF2] rounded-full px-6 py-2 text-white font-semibold"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg flex flex-col justify-between shadow-md w-full h-[170px] max-w-[370px]">
            {/* Dropdown Selection */}
            <div
              onClick={toggleDropdown}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="text-sm font-semibold text-gray-800">
                {selectedMethod}
              </span>
              {isDropdownOpen ? (
                <IoIosArrowUp className="text-gray-600" />
              ) : (
                <IoIosArrowDown className="text-gray-600" />
              )}
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="mt-4 space-y-3">
                <div
                  onClick={() => selectMethod("Google Pay")}
                  className="flex items-center cursor-pointer space-x-2 hover:text-purple-600"
                >
                  <img
                    src="/icons/general/google.svg"
                    alt=""
                    className="h-auto w-6"
                  />
                  <span className="text-sm">Google Pay</span>
                </div>
                <div
                  onClick={() => selectMethod("Apple Pay")}
                  className="flex items-center cursor-pointer space-x-2 hover:text-purple-600"
                >
                  <img
                    src="/icons/general/apple-pay.svg"
                    alt=""
                    className="h-auto w-6"
                  />
                  <span className="text-sm">Apple Pay</span>
                </div>
                <div
                  onClick={() => selectMethod("Mastercard")}
                  className="flex items-center cursor-pointer space-x-2 hover:text-purple-600"
                >
                  <img
                    src="/icons/general/mastercard.svg"
                    alt=""
                    className="h-auto w-6"
                  />
                  <span className="text-sm">Mastercard</span>
                </div>
              </div>
            )}

            {/* Input Amount and Add Cash Button */}
            {!isDropdownOpen && isAddCashVisible && (
              <div className="mt-6 flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-200 rounded-full px-4 py-3 w-full text-sm text-gray-700 focus:outline-none"
                />
                <button
                  onClick={addMoney}
                  className="bg-purple-600 w-[40%] text-white px-4 py-3 rounded-full text-sm font-semibold hover:bg-purple-700"
                >
                  Add cash
                </button>
              </div>
            )}

            {/* Withdraw Form */}
            {!isDropdownOpen && isWithdrawVisible && (
              <div className="mt-6 flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-200 rounded-full px-4 py-3 w-full text-sm text-gray-700 focus:outline-none"
                />
                <button
                  onClick={withdrawMoney}
                  className="bg-red-600 w-[40%] text-white px-4 py-3 rounded-full text-sm font-semibold hover:bg-red-700"
                >
                  Withdraw
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h3 className="text-lg text-start font-[600] text-gray-800 mt-4 my-4">
            Recent Transactions
          </h3>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p>No transactions available.</p>
            ) : (
              transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-7 bg-gray-50 rounded-lg shadow-md"
                >
                  <div className="flex items-center space-x-2">
                    <div>
                      <p className="text-sm font-medium">
                        {transaction.description}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{transaction.time}</p>
                  <span
                    className={`text-sm font-semibold ${
                      transaction.type === "debit"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {transaction.type === "debit"
                      ? `-₦${Math.abs(transaction.amount)}`
                      : `+₦${transaction.amount}`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Wallet;
