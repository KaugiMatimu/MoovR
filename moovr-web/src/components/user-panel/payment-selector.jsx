import React, { useState } from "react";
import { FaChevronUp } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext.jsx";

const PaymentSelector = ({ onClick, onPaymentMethodChange, selectedPayment = "Cash", disabled = false }) => {
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSelectPayment = (paymentMethod) => {
    setIsDropdownOpen(false);
    if (onPaymentMethodChange) {
      onPaymentMethodChange(paymentMethod);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-80 flex flex-col items-center gap-3 relative">
      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="bg-white w-full rounded-lg shadow-lg mb-2 absolute bottom-[120px]">
          <ul className="flex flex-col">
            <li
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectPayment("MoovR Wallet")}
            >
              <img
                src="/icons/header/wallet.svg"
                alt={t("moovRWallet")}
                className="w-6 h-6 mr-3"
              />
              <span>{t("moovRWallet")}</span>
            </li>
            <li
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectPayment("Cash")}
            >
              <img
                src="/icons/ride/cash.svg"
                alt={t("cash")}
                className="w-6 h-6 mr-3"
              />
              <span>{t("cash")}</span>
            </li>
            <li
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectPayment("Stripe")}
            >
              <img
                src="/images/mastercard.svg"
                alt={t("stripeCard")}
                className="w-6 h-6 mr-3"
              />
              <span>{t("stripeCard")}</span>
            </li>
            <li
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectPayment("Google Pay")}
            >
              <img
                src="/icons/general/google.svg"
                alt={t("googlePay")}
                className="w-6 h-6 mr-3"
              />
              <span>{t("googlePay")}</span>
            </li>
            <li
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectPayment("Paystack")}
            >
              <img
                src="/images/mastercard.svg"
                alt={t("paystack")}
                className="w-6 h-6 mr-3"
              />
              <span>{t("paystack")}</span>
            </li>
          </ul>
        </div>
      )}

      {/* Payment Selector */}
      <div
        className="flex items-center space-x-3 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown();
        }}
      >
        {selectedPayment === "MoovR Wallet" && (
          <img
            src="/icons/header/wallet.svg"
            alt="MoovR Wallet"
            className="w-8 h-8"
          />
        )}
        {selectedPayment === "Cash" && (
          <img src="/icons/ride/cash.svg" alt="Cash" className="w-8 h-8" />
        )}
        {selectedPayment === "Stripe" && (
          <img
            src="/images/mastercard.svg"
            alt="Stripe"
            className="w-8 h-8"
          />
        )}
        {selectedPayment === "Google Pay" && (
          <img
            src="/icons/general/google.svg"
            alt="Google Pay"
            className="w-8 h-8"
          />
        )}
        {selectedPayment === "Paystack" && (
          <img
            src="/images/mastercard.svg"
            alt="Paystack"
            className="w-8 h-8"
          />
        )}
        <span className="font-semibold">
          {selectedPayment === "Stripe"
            ? t("stripeCard")
            : selectedPayment === "MoovR Wallet"
            ? t("moovRWallet")
            : selectedPayment === "Cash"
            ? t("cash")
            : selectedPayment === "Google Pay"
            ? t("googlePay")
            : selectedPayment === "Paystack"
            ? t("paystack")
            : selectedPayment}
        </span>
        <FaChevronUp
          className={`w-4 h-4 transform ${
            isDropdownOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      {/* Action Button */}
      <div className="w-full ">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick && onClick();
          }}
          disabled={disabled}
          className={`bg-purple-500 w-full text-white py-3 px-4 rounded-full text-sm font-semibold hover:bg-purple-600 ${disabled ? 'opacity-60 cursor-not-allowed hover:bg-purple-500' : ''}`}
        >
          {disabled ? t("processingPayment") : t("payNow")}
        </button>
      </div>
    </div>
  );
};

export default PaymentSelector;
