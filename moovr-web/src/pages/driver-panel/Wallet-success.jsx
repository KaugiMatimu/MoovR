import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BaseURL } from "../../utils/BaseURL";

const DriverPaymentSuccess = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const amount = searchParams.get("amount");
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    if (!amount) {
      toast.error("Invalid payment details");
      navigate("/wallet");
      return;
    }

    const addMoneyToWallet = async () => {
      try {
        const response = await axios.post(
          `${BaseURL}/wallet/add`,
          { amount },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          console.log("OK", response.data);
          toast.success(`₦${amount} added successfully`);
          setBalance((prev) => prev + parseFloat(amount));
        } else {
          throw new Error("Unexpected response status");
        }
      } catch (error) {
        console.error("Error adding money:", error);
        toast.error("Failed to update wallet");
      } finally {
        setLoading(false);
      }
    };

    addMoneyToWallet();
  }, [amount, token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-purple-600">
          Payment Successful!
        </h2>
        <p className="text-gray-600 mt-2">
          ₦{amount} has been added to your wallet.
        </p>
        <div className="mt-4 bg-purple-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700">Balance Added</h3>
          <p className="text-3xl font-bold text-purple-700">₦{amount}</p>
        </div>
        <button
          onClick={() => navigate("/d/wallet")}
          className="mt-6 bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          Go to Wallet
        </button>
      </div>
    </div>
  );
};

export default DriverPaymentSuccess;
