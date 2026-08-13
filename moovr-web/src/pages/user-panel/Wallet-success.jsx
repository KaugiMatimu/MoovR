import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BaseURL } from "../../utils/BaseURL";

const PaymentSuccess = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const amount = searchParams.get("amount");
  const reference = searchParams.get("reference");
  const sessionId = searchParams.get("session_id");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!amount && !reference && !sessionId) {
      toast.error("Invalid payment details");
      navigate("/wallet");
      return;
    }

    const verifyPaystackPayment = async () => {
      try {
        const response = await axios.get(
          `${BaseURL}/wallet/paystack/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          toast.success("Paystack payment verified and added to wallet");
        }
      } catch (error) {
        console.error("Error verifying Paystack payment:", error);
        toast.error("Failed to verify Paystack payment");
      } finally {
        setLoading(false);
      }
    };

    const verifyStripePayment = async () => {
      try {
        const response = await axios.get(
          `${BaseURL}/wallet/stripe/verify/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          toast.success("Stripe payment verified and added to wallet");
        }
      } catch (error) {
        console.error("Error verifying Stripe payment:", error);
        toast.error("Failed to verify Stripe payment");
      } finally {
        setLoading(false);
      }
    };

    if (reference) {
      verifyPaystackPayment();
    } else if (sessionId) {
      verifyStripePayment();
    } else {
      setLoading(false);
    }
  }, [amount, reference, sessionId, token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-purple-600">
          {loading ? "Verifying Payment..." : "Payment Successful!"}
        </h2>
        <p className="text-gray-600 mt-2">
          {loading
            ? "We are verifying your transaction with the provider..."
            : "Your payment has been verified and added to your wallet."}
        </p>
        <button
          onClick={() => navigate("/wallet")}
          className="mt-6 bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          Go to Wallet
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
