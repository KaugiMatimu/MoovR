import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Header from "../../../components/user-panel/header"; // Import your Header component
import CompletedCard from "../../../components/user-panel/ride/completed-card"; // Import the new DriverInfoCard component
import PaymentSelector from "../../../components/user-panel/payment-selector";
import axios from "axios";
import { BaseURL } from "../../../utils/BaseURL";
import toast, { Toaster } from "react-hot-toast";
import { useLanguage } from "../../../context/LanguageContext.jsx";

const CompletedScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const queryParams = new URLSearchParams(location.search);
  const rideIdFromQuery =
    queryParams.get("rideId") || queryParams.get("id") || queryParams.get("_id");
  const driverIdFromQuery =
    queryParams.get("driverId") || queryParams.get("driverID");
  const driverNameFromQuery =
    queryParams.get("driverName") || queryParams.get("drivername") || queryParams.get("driver_name");
  const isPackageQuery = queryParams.get("isPackage") === "true";

  const parseFareValue = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;

    const normalized = String(value).replace(/[^0-9.-]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const resolveFare = (ride) => {
    const rawFare =
      ride?.fare ??
      ride?.totalPrice ??
      ride?.price ??
      ride?.amount ??
      ride?.total?.fare ??
      ride?.cost ??
      ride?.estimatedFare ??
      0;
    const fareValue =
      rawFare && typeof rawFare === "object"
        ? rawFare.amount ?? rawFare.value ?? rawFare.price ?? rawFare.total ?? rawFare.fare ?? 0
        : rawFare;
    return parseFareValue(fareValue);
  };

  const normalizeRideDetails = (ride) => ({
    ...ride,
    fare: resolveFare(ride),
    paymentMethod: ride?.paymentMethod || "Cash",
    paymentStatus: ride?.paymentStatus || "pending",
  });

  const getRideIdentifier = (ride, seen = new WeakSet()) => {
    if (!ride || typeof ride !== "object") return "";
    if (seen.has(ride)) return "";
    seen.add(ride);

    const normalizedRide = extractRideObject(ride);
    if (normalizedRide !== ride) {
      const nestedId = getRideIdentifier(normalizedRide, seen);
      if (nestedId) return nestedId;
    }

    const candidateKeys = ["rideId", "_id", "id"];
    for (const key of candidateKeys) {
      if (ride[key]) return String(ride[key]);
    }

    for (const key of Object.keys(ride)) {
      const value = ride[key];
      if (Array.isArray(value)) {
        for (const item of value) {
          const nestedId = getRideIdentifier(item, seen);
          if (nestedId) return nestedId;
        }
      } else if (value && typeof value === "object") {
        const nestedId = getRideIdentifier(value, seen);
        if (nestedId) return nestedId;
      }
    }

    return "";
  };

  const extractRideObject = (ride) => {
    if (!ride || typeof ride !== "object") return ride;
    if (ride._doc && typeof ride._doc === "object") return ride._doc;
    if (typeof ride.toObject === "function") return ride.toObject();
    return ride;
  };

  const isValidRideId = (id) => {
    if (!id || typeof id !== "string") return false;
    const normalized = id.trim();
    if (!normalized) return false;
    const invalidStrings = ["init", "undefined", "null", "nan", "[object object]"];
    if (invalidStrings.includes(normalized.toLowerCase())) return false;
    return /^[0-9a-fA-F]{24}$/.test(normalized);
  };

  const getValidRideId = (potentialId) => {
    const candidate = String(potentialId || "").trim();
    return isValidRideId(candidate) ? candidate : "";
  };

  const getRideDocumentId = (ride) => {
    if (!ride || typeof ride !== "object") return "";
    const rawDoc = ride._doc && typeof ride._doc === "object" ? ride._doc : null;
    if (rawDoc) {
      return getValidRideId(rawDoc._id) || getValidRideId(rawDoc.id) || getValidRideId(rawDoc.rideId);
    }
    if (typeof ride.toObject === "function") {
      const converted = ride.toObject();
      return getValidRideId(converted._id) || getValidRideId(converted.id) || getValidRideId(converted.rideId);
    }
    return "";
  };

  const getRideIdFromStateOrDetails = () => {
    return (
      getValidRideId(location.state?.rideId) ||
      getValidRideId(getRideIdentifier(location.state?.ride)) ||
      getValidRideId(getRideIdentifier(rideDetails)) ||
      getRideDocumentId(location.state?.ride) ||
      getRideDocumentId(rideDetails)
    );
  };

  const [driverInfo, setDriverInfo] = useState({
    driverId:
      driverIdFromQuery || location.state?.driverId || "",
    driverName:
      driverNameFromQuery || location.state?.driverName || "Driver",
  });
  const [rideDetails, setRideDetails] = useState(
    location.state?.ride ? normalizeRideDetails(location.state.ride) : null
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    location.state?.ride?.paymentMethod || "Cash"
  );
  const [paymentMethodTouched, setPaymentMethodTouched] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [loadingRide, setLoadingRide] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [shouldRedirectToReview, setShouldRedirectToReview] = useState(false);
  const [shouldRedirectToHome, setShouldRedirectToHome] = useState(false);
  const redirectTimerRef = useRef(null);

  const rideId =
    getValidRideId(rideIdFromQuery) ||
    getRideIdFromStateOrDetails();

  const isPackageFlow = Boolean(
    location.state?.isPackage ||
    location.state?.pkg ||
    location.state?.ride?.isPackage ||
    location.state?.ride?.packageDetails ||
    rideDetails?.isPackage ||
    rideDetails?.packageDetails ||
    isPackageQuery
  );

  useEffect(() => {
    setDriverInfo({
      driverId: driverIdFromQuery || location.state?.driverId || "",
      driverName: driverNameFromQuery || location.state?.driverName || "Driver",
    });
  }, [driverIdFromQuery, driverNameFromQuery, location.state?.driverId, location.state?.driverName]);

  const getRideFromResponse = (responseData) => {
    if (!responseData) return null;
    if (responseData.ride) return responseData.ride;
    if (responseData?.data?.ride) return responseData.data.ride;
    if (responseData.pkg) return responseData.pkg;
    if (responseData?.data?.pkg) return responseData.data.pkg;
    if (responseData.data && typeof responseData.data === "object") return responseData.data;
    return responseData;
  };

  const getFirstValidRideId = (...candidates) => {
    for (const candidate of candidates) {
      const validId = getValidRideId(candidate);
      if (validId) return validId;
    }
    return "";
  };

  useEffect(() => {
    const fetchRideDetails = async () => {
      const idToFetch = getFirstValidRideId(
        rideIdFromQuery,
        location.state?.rideId,
        getRideIdentifier(location.state?.ride),
        getRideIdentifier(rideDetails)
      );

      if (!idToFetch) {
        if (location.state?.ride) {
          const fallbackRide = normalizeRideDetails(location.state.ride);
          setRideDetails(fallbackRide);
          setSelectedPaymentMethod(fallbackRide.paymentMethod || "Cash");
          setLoadingRide(false);
          return;
        }

        console.warn(
          "CompletedScreen: invalid or missing rideId in query/state, skipping status fetch",
          {
            rideIdFromQuery,
            stateRideId: location.state?.rideId,
            rideObjectId: getRideIdentifier(location.state?.ride),
            rideDetailsId: getRideIdentifier(rideDetails),
          }
        );

        setLoadingRide(false);
        setFetchError(t("rideDetailsNotFoundPleaseReload") || "Ride details could not be loaded. Please reload the page.");
        return;
      }

      try {
        const token = Cookies.get("token") || localStorage.getItem("token");
        const authToken =
          token && token !== "null" && token !== "undefined" ? token : null;
        // Heuristic to detect package flows more reliably to avoid unnecessary 404s
        const isPackageFlow = Boolean(
          location.state?.isPackage ||
          location.state?.pkg ||
          location.state?.ride?.isPackage ||
          location.state?.ride?.packageDetails ||
          rideDetails?.isPackage ||
          rideDetails?.packageDetails ||
          location.pathname.includes("/package") ||
          location.search.includes("isPackage=true")
        );

        const endpoint = isPackageFlow
          ? `${BaseURL}/package/status/${idToFetch}`
          : `${BaseURL}/rides/status/${idToFetch}`;

        let response;
        try {
          response = await axios.get(endpoint, {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
          });
        } catch (err) {
          console.error(
            "CompletedScreen: primary fetch failed",
            endpoint,
            err.response?.status,
            err.response?.data || err.message
          );
          const fallbackEndpoint = isPackageFlow
            ? `${BaseURL}/rides/status/${idToFetch}`
            : `${BaseURL}/package/status/${idToFetch}`;
          response = await axios.get(fallbackEndpoint, {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
          });
        }

        console.debug("CompletedScreen: status response", response?.data);
        let ride = getRideFromResponse(response.data);
        if (!ride && location.state?.ride) {
          ride = location.state.ride;
        }

        let rideWithFare = null;
        if (ride) {
          rideWithFare = normalizeRideDetails(ride);
          setRideDetails(rideWithFare);
          setFetchError("");
          console.debug("CompletedScreen: fetched ride", rideWithFare);
          setSelectedPaymentMethod((prev) =>
            !paymentMethodTouched && rideWithFare.paymentMethod
              ? rideWithFare.paymentMethod
              : prev || rideWithFare.paymentMethod || "Cash"
          );
          const resolvedDriverId =
            rideWithFare.driver?._id || rideWithFare.driver || location.state?.driverId || "";
          const resolvedDriverName = rideWithFare.driver?.firstName
            ? `${rideWithFare.driver.firstName} ${rideWithFare.driver.lastName}`
            : location.state?.driverName || rideWithFare.driverName || "Driver";
          setDriverInfo({
            driverId: resolvedDriverId,
            driverName: resolvedDriverName,
          });

          if (rideWithFare.fare === 0 && rideWithFare.paymentStatus !== "paid") {
            console.warn("Ride completed screen loaded without a fare", rideWithFare);
          }
        } else {
          setFetchError(t("rideDetailsNotFoundPleaseReload") || "Ride details could not be loaded. Please reload the page.");
        }

        const paymentStatus = new URLSearchParams(location.search).get("payment");
        if (paymentStatus === "success") {
          toast.success(t("paymentConfirmedThankYou"));
          if (isPackageFlow) {
            setShouldRedirectToHome(true);
          } else {
            setShouldRedirectToReview(true);
          }
        } else if (paymentStatus === "cancel") {
          toast.error(t("paymentCanceledPleaseTryAnotherMethod"));
        }

        if (rideWithFare?.paymentStatus === "paid") {
          if (isPackageFlow) {
            setShouldRedirectToHome(true);
          } else {
            setShouldRedirectToReview(true);
          }
        }
      } catch (error) {
        console.error("Error fetching ride/package details for completion screen:", error);
        setFetchError(t("rideDetailsLoadErrorTryAgain") || "Unable to load ride details. Please try again.");

        if (location.state?.ride) {
          const fallbackRide = {
            ...location.state.ride,
            fare: resolveFare(location.state.ride),
            paymentMethod: location.state.ride.paymentMethod || "Cash",
            paymentStatus: location.state.ride.paymentStatus || "pending",
          };
          setRideDetails(fallbackRide);
          setSelectedPaymentMethod(fallbackRide.paymentMethod || "Cash");
        }
      } finally {
        setLoadingRide(false);
      }
    };

    fetchRideDetails();
  }, [rideIdFromQuery, location.state?.rideId, location.state?.isPackage, location.state?.ride, location.state?.driverId, location.state?.driverName, location.search, paymentMethodTouched, t]);

  const getRequestPaymentMethod = () =>
    selectedPaymentMethod || rideDetails?.paymentMethod || "Cash";

  const handleProcessPayment = async () => {
    const idToPay =
      getValidRideId(rideId) ||
      getValidRideId(getRideIdentifier(rideDetails)) ||
      getValidRideId(getRideIdentifier(location.state?.ride));
    if (!idToPay) {
      console.error("CompletedScreen: cannot process payment, missing ride id", {
        idToPay,
        rideDetailsType: rideDetails ? typeof rideDetails : "none",
        rideDetailsKeys: rideDetails ? Object.keys(rideDetails) : [],
        rideDetailsSample: rideDetails ? JSON.stringify(rideDetails, Object.keys(rideDetails).slice(0, 20), 2) : null,
        locationState: location.state,
        locationSearch: location.search,
      });
      setFetchError(t("unableToProcessPaymentPleaseReload") || "Unable to process payment. Please reload and try again.");
      toast.error(t("unableToProcessPaymentPleaseReload") || "Unable to process payment. Please reload and try again.");
      return;
    }

    if (!rideDetails) {
      console.warn("CompletedScreen: missing ride details, processing payment using rideId only", {
        idToPay,
      });
    }

    const finalPaymentMethod = getRequestPaymentMethod();

    setRideDetails((prev) =>
      prev
        ? {
            ...prev,
            paymentMethod: finalPaymentMethod,
            paymentStatus: "pending",
            fare: resolveFare(prev),
          }
        : prev
    );
    console.debug("CompletedScreen: processing payment", {
      idToPay,
      selectedPaymentMethod,
      finalPaymentMethod,
      rideDetails,
    });
    setProcessingPayment(true);
    const toastId = toast.loading(t("processingPayment"));

    try {
      const token = Cookies.get("token") || localStorage.getItem("token");
      const authToken = token && token !== "null" && token !== "undefined" ? token : null;

      // Decide endpoint based on whether this is a package flow
      const isPackageFlow = Boolean(
        location.state?.isPackage || rideDetails?.isPackage || location.state?.pkg || rideDetails?.packageDetails
      );

      let response;
      if (isPackageFlow) {
        // For packages, call the passenger-facing payment endpoint (does not require driver role)
        response = await axios.post(
          `${BaseURL}/package/process-payment/${idToPay}`,
          { paymentMethod: finalPaymentMethod },
          {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
          }
        );
      } else {
        // For rides, use the existing payment endpoint
        response = await axios.post(
          `${BaseURL}/rides/process-payment/${idToPay}`,
          { paymentMethod: finalPaymentMethod },
          { headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined }
        );
      }

      console.debug("CompletedScreen: payment response", response.data);

      const backendRide = normalizeRideDetails(getRideFromResponse(response.data) || response.data.ride || response.data);
      setRideDetails((prev) => ({
        ...prev,
        ...backendRide,
        paymentMethod: finalPaymentMethod,
      }));
      setSelectedPaymentMethod(finalPaymentMethod);

      const paymentRedirectUrl =
        response.data.paymentUrl || response.data.authorization_url || response.data.url || response.data.session?.url;

      if (paymentRedirectUrl) {
        toast.success(t("redirectingToPaymentGateway"), { id: toastId });
        window.location.href = paymentRedirectUrl;
        return;
      }

      if (response.data.paymentStatus === "paid" || backendRide.paymentStatus === "paid") {
        toast.success(t("paymentSuccessfulMessage"), { id: toastId });
        if (isPackageFlow) {
          setShouldRedirectToHome(true);
        } else {
          setShouldRedirectToReview(true);
        }
      } else if (response.data.paymentStatus === "pending") {
        toast.success(t("paymentPendingMessage"), { id: toastId });
      } else {
        toast.error(response.data.message || t("paymentFailedPleaseTryAgain"), { id: toastId });
      }
    } catch (error) {
      console.error("Payment error:", error.response?.data || error.message || error);
      toast.error(error.response?.data?.message || "Failed to process payment.", { id: toastId });
    } finally {
      setProcessingPayment(false);
    }
  };

  const getPaymentMessage = () => {
    if (!rideDetails) return "";
    const fareVal = resolveFare(rideDetails);
    const selectedMethod =
      rideDetails.paymentStatus === "paid"
        ? rideDetails.paymentMethod
        : selectedPaymentMethod || rideDetails.paymentMethod || "Cash";
    console.debug("CompletedScreen: getPaymentMessage", { fareVal, selectedMethod, paymentStatus: rideDetails.paymentStatus, rideDetails });

    if (rideDetails.paymentStatus === "paid") {
      if (rideDetails.paymentMethod === "Cash") {
        return t("payCashMessage", { fare: fareVal });
      }
      if (rideDetails.paymentMethod === "MoovR Wallet") {
        return t("paymentSuccessfullyDeductedFromWallet");
      }
      return t("paymentSuccessfulMessage");
    }

    return `${t("totalFareSelectPaymentMethod", { fare: fareVal })} ${t("selectedPaymentMethodLabel")}: ${selectedMethod}`;
  };

  useEffect(() => {
    if (shouldRedirectToReview && rideDetails) {
      navigate("/ride/review", {
        state: {
          driverId: driverInfo.driverId,
          driverName: driverInfo.driverName,
          rideId,
        },
      });
    }
  }, [shouldRedirectToReview, rideDetails, driverInfo, navigate, rideId]);

  useEffect(() => {
    if (!shouldRedirectToHome) return;
    const timer = window.setTimeout(() => {
      window.location.replace("/");
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [shouldRedirectToHome]);

  useEffect(() => {
    if (!rideDetails || paymentMethodTouched) return;
    if (rideDetails.paymentMethod && rideDetails.paymentMethod !== selectedPaymentMethod) {
      setSelectedPaymentMethod(rideDetails.paymentMethod);
    }
  }, [rideDetails, paymentMethodTouched, selectedPaymentMethod]);

  useEffect(() => {
    if (!rideDetails) return;
    // When user changes the payment method in the UI, keep the current rideDetails.paymentMethod in sync
    if (rideDetails.paymentMethod !== selectedPaymentMethod) {
      setRideDetails((prev) =>
        prev ? { ...prev, paymentMethod: selectedPaymentMethod } : prev
      );
    }
  }, [selectedPaymentMethod, rideDetails]);

  useEffect(() => {
    if (!isPackageFlow || !rideDetails) return;
    if (rideDetails.paymentStatus === "paid") {
      setShouldRedirectToHome(true);
    }
  }, [isPackageFlow, rideDetails]);

  return (
    <div className="h-screen w-screen">
      <Toaster />
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="relative h-full">
        {/* Map Background */}
        <div className="absolute inset-0 ">
          <img
            title="Map"
            src="/images/full-map-img.png"
            className="w-full h-full"
            alt="map"
          />
        </div>

        {/* Floating Content */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center space-y-4">
          {loadingRide ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 w-96 text-center">
            <p className="text-sm text-gray-600">Loading ride details...</p>
          </div>
        ) : rideDetails && rideDetails.paymentStatus !== "paid" ? (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 w-96 text-center">
                <h2 className="font-semibold text-gray-800 mb-2">Settle Payment</h2>
                <p className="text-sm text-gray-600 mb-4">{getPaymentMessage()}</p>
                <PaymentSelector 
                  selectedPayment={selectedPaymentMethod}
                  onPaymentMethodChange={(method) => {
                    setSelectedPaymentMethod(method);
                    setPaymentMethodTouched(true);
                  }}
                  onClick={handleProcessPayment}
                  disabled={processingPayment}
                />
                {processingPayment && <p className="text-xs text-purple-500 mt-2">Processing...</p>}
              </div>
            </div>
          ) : shouldRedirectToHome ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 w-96 text-center">
              <h2 className="font-semibold text-gray-800 mb-2">
                {t("paymentSuccessfulMessage")}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {t("paymentSuccessRedirectingHome") || "Payment successful! Redirecting to home shortly..."}
              </p>
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center">
                  <img src="/images/check.png" alt="Checkmark" />
                </div>
              </div>
              <button
                onClick={() => navigate("/", { replace: true })}
                className="bg-purple-500 text-white py-3 w-full rounded-full text-lg font-semibold hover:bg-purple-600"
              >
                {t("goHomeNow") || "Go Home Now"}
              </button>
            </div>
          ) : (
            <CompletedCard
              path="/ride/review"
              title={t("destinationReached")}
              driverId={driverInfo.driverId}
              driverName={driverInfo.driverName}
              rideId={rideId}
              buttonText={t("rateYourRide")}
              message={getPaymentMessage()}
            />
          )}
        </div>
      </div>
    </div> 
  );
};

export default CompletedScreen;
