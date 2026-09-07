import React, { useState , useEffect } from "react";
import Cookies from "js-cookie";
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import toast from "react-hot-toast";



import Login from "../pages/user-panel/auth/login";
import Signup from "../pages/user-panel/auth/register";
import Verification from "../pages/user-panel/auth/verification";
import Name from "../pages/user-panel/auth/name";
import Ride from "../pages/user-panel/ride/ride";
import Booked from "../pages/user-panel/rent/booked";
import RideCars from "../pages/user-panel/rent/cars";
import RideCarSelection from "../pages/user-panel/shared/ride-car-selection";
import RideDetail from "../pages/user-panel/rent/rent-details";
import MeetDriverScreen from "../pages/user-panel/shared/meet-the-driver";
import StartRideScreen from "../pages/user-panel/shared/start-ride";
import StartDestinationScreen from "../pages/user-panel/towards-destination";
import CompletedScreen from "../pages/user-panel/shared/completed";
import ReviewScreen from "../pages/user-panel/shared/review";
import ThankYouScreen from "../pages/user-panel/shared/thankyou";
import DriverBooking from "../pages/user-panel/driver/driver-booking";
import DriverConfirmation from "../pages/user-panel/driver/driver-confirmation";
import StartJourney from "../pages/user-panel/shared/start-journey";
import CarDetail from "../pages/user-panel/rent/car-details";
import ConfirmCar from "../pages/user-panel/rent/confirm-car";

// home page for all users
import HomePage from "../pages/user-panel/static/Home";
import Wallet from "../pages/user-panel/Wallet";
import PackageDelivery from "../pages/user-panel/package/package-delivery";
import PackageBooked from "../pages/user-panel/package/package-booked";
import ConfirmPickup from "../pages/user-panel/package/confirm-pickup";
import ConfirmDelivery from "../pages/user-panel/package/confirm-delivery";
import Bill from "../pages/user-panel/bill/bill.jsx";
import BillDetails from "../pages/user-panel/bill/bill-details";
import Activity from "../pages/user-panel/activity/activity";
import PrivacyPolicy from "../pages/user-panel/static/privacy-policy";
import Languages from "../pages/user-panel/static/languages";
import Settings from "../pages/user-panel/static/settings.jsx";
import { NotificationProvider } from "../context/NotificationProvider";
import Details from "../pages/user-panel/reserve/details";
import Successful from "../pages/user-panel/reserve/successful";
import Reserve from "../pages/user-panel/reserve/reserve";
import DriverStart from "../pages/user-panel/driver/start";
import PackageCarSelection from "../pages/user-panel/package/selection";
import TrackPackage from "../pages/user-panel/package/track";
import CarpoolSelection from "../pages/user-panel/carpool/selection";
import Carpool from "../pages/user-panel/carpool/carpool.jsx";
import ReserveRide from "../pages/user-panel/reserve/reserve-ride.jsx";
import ReserveSelection from "../pages/user-panel/reserve/reserve-selection.jsx";
import Driver from "../pages/user-panel/reserve/driver.jsx";
import Go from "../pages/driver-panel/go.jsx";
import Accept from "../pages/driver-panel/accept.jsx";
import Reached from "../pages/driver-panel/reached.jsx";
import End from "../pages/driver-panel/end.jsx";
import Completed from "../pages/driver-panel/completed.jsx";
import Review from "../pages/driver-panel/review.jsx";
import ThankYou from "../pages/driver-panel/thankyou.jsx";
import TermsAndConditions from "../pages/driver-panel/terms.jsx";
import Revenue from "../pages/driver-panel/revenue.jsx";
import Rides from "../pages/driver-panel/rides.jsx";
import RatingsDashboard from "../pages/driver-panel/ratings.jsx";
import SetupAccount from "../pages/driver-panel/setup-account.jsx";
import SetupProfile from "../pages/driver-panel/setup-profile.jsx";
import SetupLicense from "../pages/driver-panel/setup-license.jsx";
import DriverWallet from "../pages/driver-panel/Wallet.jsx";
import PackageGo from "../pages/driver-panel/package/go.jsx";
import PackageAccept from "../pages/driver-panel/package/accept.jsx";
import PackageCompleted from "../pages/driver-panel/package/completed.jsx";
import PackageEnd from "../pages/driver-panel/package/end.jsx";
import DriverVerification from "../pages/driver-panel/auth/verification.jsx";
import DriverName from "../pages/driver-panel/auth/name.jsx";
import VehicleRegistration from "../pages/driver-panel/vehicle-registration.jsx";
import VehicleInsurance from "../pages/driver-panel/vehicle-insurance.jsx";
import CreateListing from "../pages/driver-panel/create-listing.jsx";
import EditListing from "../pages/driver-panel/edit-listing.jsx";
import Pass from "../pages/driver-panel/pass.jsx";
import Bookings from "../pages/driver-panel/bookings.jsx";
import Listings from "../pages/driver-panel/listings.jsx";
import Earn from "../pages/driver-panel/auth/earn.jsx";
import EarnTypes from "../pages/driver-panel/auth/earn-types.jsx";
import Welcome from "../pages/driver-panel/auth/welcome.jsx";
import VehicleType from "../pages/driver-panel/auth/vehicle-type.jsx";
import AccountType from "../pages/driver-panel/auth/account-types.jsx";
import DriverRegister from "../pages/driver-panel/auth/register.jsx";
import PackageDelivered from "../pages/driver-panel/package/delivered.jsx";
import ChoosePanel from "../pages/choose-panel.jsx";
import TotalListings from "../pages/driver-panel/total-listings.jsx";
import TotalBookings from "../pages/driver-panel/total-bookings.jsx";
import DriverSettings from "../pages/driver-panel/static/settings.jsx";
import DriverPrivacyPolicy from "../pages/driver-panel/static/privacy-policy.jsx";
import DriverLanguages from "../pages/driver-panel/static/languages.jsx";
import DriverActivity from "../pages/driver-panel/activity/activity.jsx";
import Dashboard from "../pages/driver-panel/dashboard.jsx";
import MultiStepForm from "../pages/registers.jsx";
import PaymentSuccess from "../pages/user-panel/Wallet-success.jsx";
import DriverPaymentSuccess from "../pages/driver-panel/Wallet-success.jsx";
import LiveLocationRecipientScreen from "../pages/user-panel/live-location-recipient";
import RideShare from "../pages/share/ride-share";
import { BaseURL } from "../utils/BaseURL";




// ✅ Route protection wrappers
// router.jsx or ProtectedRoutes.jsx




// USER PROTECTED ROUTE
export const ProtectedUserRoute = ({ element }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get("token") || localStorage.getItem("token");
      const role = Cookies.get("role") || localStorage.getItem("role");

      // Robust check for valid token and role
      const hasValidToken = token && token !== "undefined" && token !== "null";
      const hasValidRole = role && role !== "undefined" && role !== "null";

      if (hasValidToken && hasValidRole && role === "user") {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  if (isAuthorized === null) return null; 
  if (isAuthorized === true) return element;

  return <Navigate to="/login" state={{ from: location }} replace />;
};

// DRIVER PROTECTED ROUTE
export const ProtectedDriverRoute = ({ element }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get("token") || localStorage.getItem("token");
      const role = Cookies.get("role") || localStorage.getItem("role");

      const hasValidToken = token && token !== "undefined" && token !== "null";
      const hasValidRole = role && role !== "undefined" && role !== "null";

      if (hasValidToken && hasValidRole && role === "driver") {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  if (isAuthorized === null) return null;
  if (isAuthorized === true) return element;

  return <Navigate to="/choose" state={{ from: location, role: "driver" }} replace />;
};

export const ApprovedDriverRoute = ({ element }) => {
  const [status, setStatus] = useState("loading");
  const location = useLocation();

  useEffect(() => {
    let active = true;
    const token = Cookies.get("token") || localStorage.getItem("token");
    const role = Cookies.get("role") || localStorage.getItem("role");

    if (!token || role !== "driver") {
      setStatus("unauthorized");
      return () => { active = false; };
    }

    fetch(`${BaseURL}/auth/get-user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load driver status");
        return response.json();
      })
      .then(({ user }) => {
        if (!active) return;
        const hasRequiredSetup = Boolean(
          user?.firstName &&
          user?.lastName &&
          user?.phone &&
          user?.documents?.drivingLicense &&
          user?.documents?.proofOfResidency &&
          user?.documents?.vehicleRegistrationBook &&
          user?.documents?.vehicleInsurance &&
          user?.termsAccepted
        );
        const isApproved = user?.verificationStatus === "approved" && user?.isVerified === true;
        localStorage.setItem("userData", JSON.stringify(user));
        setStatus(hasRequiredSetup && isApproved ? "approved" : "setup-required");
      })
      .catch(() => {
        if (active) setStatus("setup-required");
      });

    return () => { active = false; };
  }, [location.pathname]);

  if (status === "loading") return null;
  if (status === "approved") return element;
  if (status === "unauthorized") {
    return <Navigate to="/choose" state={{ from: location, role: "driver" }} replace />;
  }
  return <Navigate to="/d/" replace />;
};

// PUBLIC ROUTE (Redirects if already logged in)
export const PublicRoute = ({ element }) => {
  const location = useLocation();
  const token = Cookies.get("token") || localStorage.getItem("token");
  const role = Cookies.get("role") || localStorage.getItem("role");

  const hasValidToken = token && token !== "undefined" && token !== "null";
  const hasValidRole = role && role !== "undefined" && role !== "null";

  if (hasValidToken && hasValidRole) {
    if (role === "driver") return <Navigate to="/d/" replace />;
    return <Navigate to="/ride" replace />;
  }

  return element;
};



const RootLayout = ({ children }) => {
  return (
    <NotificationProvider>
      <Outlet />
    </NotificationProvider>
  );
};

const App = () => {
  const [userData, setUserData] = useState({});


  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<RootLayout />}>




           {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/registers" element={<MultiStepForm />} />
          <Route path="/choose" element={<ChoosePanel />} />
          <Route path="/login" element={<PublicRoute element={<Login />} />} />
          <Route path="/signup" element={<PublicRoute element={<Signup />} />} />
          <Route path="/verification" element={ <Verification />}  />
          <Route path="/d/signup" element={<PublicRoute element={<DriverRegister />} />} />
          <Route path="/d/verification"   element={<DriverVerification />}   />
          <Route path="/share/:token" element={<RideShare />} />



          

          {/* ========== Protected User Routes ========== */}
          <Route path="/name" element={<Name />}  />
          <Route path="/wallet" element={<ProtectedUserRoute element={<Wallet />} />} />
          <Route path="/wallet/success" element={<ProtectedUserRoute element={<PaymentSuccess />} />} />
          <Route path="/package" element={<ProtectedUserRoute element={<PackageDelivery />} />} />
          <Route path="/package/pickup" element={<ProtectedUserRoute element={<ConfirmPickup />} />} />
          <Route path="/package/delivery"  element={<ProtectedUserRoute element={<ConfirmDelivery />} />} />
          <Route path="/package/selection"  element={<ProtectedUserRoute element={<PackageCarSelection />} />}/>
          <Route path="/package/booked"  element={<ProtectedUserRoute element={<PackageBooked />} />} />
          <Route path="/package/track"   element={<ProtectedUserRoute element={<TrackPackage />} />}/>

          <Route path="/carpool"  element={<ProtectedUserRoute element={<Carpool />} />} />
          <Route path="/carpool/selection"  element={<ProtectedUserRoute element={<CarpoolSelection />} />} />
          <Route path="/carpool/driver"  element={<ProtectedUserRoute element={<MeetDriverScreen />} />} />
          <Route path="/carpool/start"  element={<ProtectedUserRoute element={<StartRideScreen />} />}/>
          <Route path="/carpool/journey"  element={<ProtectedUserRoute element={<StartDestinationScreen />} />} />

          <Route path="/bill"  element={<ProtectedUserRoute element={<Bill />} />} />
          <Route path="/bill/details/:id"  element={<ProtectedUserRoute element={<BillDetails />} />} />
          <Route path="/activity" element={<ProtectedUserRoute element={<Activity />} />}/>

          {/* user ride  */}
          <Route path="/ride"  element={<ProtectedUserRoute element={<Ride />} />} />
          <Route path="/ride/selection" element={<ProtectedUserRoute element={<RideCarSelection />} />} />
          <Route path="/ride/meet"  element={<ProtectedUserRoute element={<MeetDriverScreen />} />}/>
          <Route path="/ride/start"  element={<ProtectedUserRoute element={<StartRideScreen />} />}/>
          <Route path="/ride/completed"   element={<ProtectedUserRoute element={<CompletedScreen />} />}/>
          <Route path="/ride/review"  element={<ProtectedUserRoute element={<ReviewScreen />} />} />
          <Route path="/ride/thank-you"  element={<ProtectedUserRoute element={<ThankYouScreen />} />}/>
          <Route path="/live-location/:senderId" element={<LiveLocationRecipientScreen />} />

          
          <Route path="/rent/cars"  element={<ProtectedUserRoute element={<RideCars />} />}/>
          <Route path="/rent/car/details/:id"  element={<ProtectedUserRoute element={<CarDetail />} />}/>
          <Route path="/rent/car/confirm/:id"  element={<ProtectedUserRoute element={<ConfirmCar />} />} />
          <Route path="/rent/car/booked" element={<ProtectedUserRoute element={<Booked />} />} />
          <Route path="/rent/car/detail"  element={<ProtectedUserRoute element={<RideDetail />} />} />
          <Route path="/ride-car/towards-destination" element={<ProtectedUserRoute element={<StartDestinationScreen />} />}/>
       

          <Route path="/privacy-policy"  element={<ProtectedUserRoute element={<PrivacyPolicy />} />} />
          <Route path="/languages"  element={<ProtectedUserRoute element={<Languages />} />} />
          <Route path="/settings"  element={<ProtectedUserRoute element={<Settings />} />} />
          <Route path="/reserve" element={<ProtectedUserRoute element={<Reserve/>} />} />
          <Route path="/reserve/ride"  element={<ProtectedUserRoute element={<ReserveRide />} />} />
          <Route path="/reserve/selection" element={<ProtectedUserRoute element={<ReserveSelection />} />} />
          <Route path="/reserve/driver"  element={<ProtectedUserRoute element={<Driver />} />} />
          <Route path="/reserve/details"  element={<ProtectedUserRoute element={<Details />} />} />
          <Route path="/reserve/successful"  element={<ProtectedUserRoute element={<Successful />} />} />
             <Route path="/drivers"  element={<ProtectedUserRoute element={<DriverBooking />} />} />

         



        {/* ============== DRIVER ROTUES ===============================  */}
          
          {/* <Route path="/d/name" element={<DriverName />} /> */}
          <Route path="/d/name"  element={<DriverName setUserData={setUserData} />} />
          {/* <Route path="/d/earn" element={<Earn />} setUserData={setUserData} /> */}
          <Route path="/d/earn"  element={<Earn setUserData={setUserData} />}  />
          <Route path="/d/earn-types"  element={<EarnTypes />}  />
          <Route path="/d/account-types"   element={<AccountType />}  />
          <Route path="/d/vehicle-types"  element={<VehicleType  setUserData={setUserData}/>} />
          <Route path="/d/welcome" element={<ProtectedDriverRoute element={<Welcome />} />} />


          
          <Route path="/d/location" element={<ProtectedDriverRoute element={<Go />} />} />
          <Route path="/d/"   element={<ProtectedDriverRoute element={<Welcome />} />}/>
          <Route path="/d/dashboard" element={<ApprovedDriverRoute element={<Dashboard />} />} />
          <Route path="/driver/confirmation/:driverId"  element={<ProtectedDriverRoute element={<DriverConfirmation />} />}/>
          {/* after otp verified driver come here  */}
          <Route path="/driver/start"  element={<ProtectedDriverRoute element={<DriverStart />} />} />
          <Route path="/driver/start-journey" element={<ProtectedDriverRoute element={<StartJourney />} />} />
          <Route path="/d/vehicle/registration"  element={<ProtectedDriverRoute element={<VehicleRegistration />} />}/>
          <Route path="/d/vehicle/insurance" element={<ProtectedDriverRoute element={<VehicleInsurance />} />} />
          <Route path="/d/vehicle/create"  element={<ProtectedDriverRoute element={<CreateListing />} />} />
          <Route path="/d/vehicle/edit/:id"  element={<ProtectedDriverRoute element={<EditListing />} />} />
          <Route path="/d/vehicle/pass" element={<ProtectedDriverRoute element={<Pass />} />} />
          <Route path="/d/vehicle/bookings"  element={<ProtectedDriverRoute element={<Bookings />} />}/>
          <Route path="/d/vehicle/listings"  element={<ProtectedDriverRoute element={<Listings />} />} />
          <Route path="/d/accept"  element={<ProtectedDriverRoute element={<Accept/>} />} />
          <Route path="/d/reached" element={<ProtectedDriverRoute element={<Reached/>} />}/>
          <Route path="/d/end" element={<ProtectedDriverRoute element={<End/>} />} />
          <Route path="/d/completed"  element={<ProtectedDriverRoute element={<Completed/>} />} />
          <Route path="/d/review"  element={<ProtectedDriverRoute element={<Review />} />} />
          <Route path="/d/thank-you" element={<ProtectedDriverRoute element={<ThankYou/>} />} />
          <Route path="/d/terms" element={<ProtectedDriverRoute element={<TermsAndConditions />} />} />
          <Route path="/d/revenue"  element={<ProtectedDriverRoute element={<Revenue />} />} />
          <Route path="/d/rides"  element={<ProtectedDriverRoute element={<Rides />} />} />
          <Route path="/d/activity" element={<ProtectedDriverRoute element={<DriverActivity />} />} />
          <Route path="/d/listing"  element={<ProtectedDriverRoute element={<TotalListings />} />} />
          <Route path="/d/bookings" element={<ProtectedDriverRoute element={<TotalBookings />} />} />
          <Route path="/d/rating"  element={<ProtectedDriverRoute element={<RatingsDashboard />} />} />
          <Route path="/d/languages"  element={<ProtectedDriverRoute element={<DriverLanguages />} />} />
          <Route path="/d/privacy-policy"  element={<ProtectedDriverRoute element={<DriverPrivacyPolicy />} />}/>
          <Route path="/d/settings"  element={<ProtectedDriverRoute element={<DriverSettings />} />} />
          <Route path="/d/setup-account"  element={<ProtectedDriverRoute element={<SetupAccount />} />} />
          <Route path="/d/setup-profile"  element={<ProtectedDriverRoute element={<SetupProfile />} />} />
          <Route path="/d/setup-license"  element={<ProtectedDriverRoute element={<SetupLicense />} />} />
          <Route path="/d/wallet"  element={<ProtectedDriverRoute element={<DriverWallet />} />} />
          <Route path="/d/wallet/success"  element={<ProtectedDriverRoute element={<DriverPaymentSuccess />} />} />
          <Route path="/d/package/"  element={<ProtectedDriverRoute element={<PackageGo />} />} />
          <Route path="/d/package/accept"  element={<ProtectedDriverRoute element={<PackageAccept />} />} />
          <Route path="/d/package/reached"  element={<ProtectedDriverRoute element={<PackageCompleted />} />} />
          <Route path="/d/package/end" element={<ProtectedDriverRoute element={<PackageEnd />} />} />
          <Route path="/d/package/delivered" element={<ProtectedDriverRoute element={<PackageDelivered />} />} />
      </Route>
    ),
    {
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
    }
  );

  return <RouterProvider router={router} />;
};

export default App;
