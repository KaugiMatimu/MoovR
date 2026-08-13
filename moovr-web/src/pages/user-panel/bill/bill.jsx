import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import Header from "../../../components/user-panel/header";
import { Link , useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../../../utils/BaseURL";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";
import { DotLoader } from "react-spinners";

const Bill = () => {
  const navigate = useNavigate()
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BaseURL}/bill`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if(response.data.length<1){
          toast.error("your do not have any bill yet?")
        }
        if (response.status === 200) {
          setBills(response.data);
          console.log(response.data);
        } else {
          toast.error("Failed to fetch bills. Please try again.");
        }
      } catch (error) {
        toast.error("Error fetching bills. Please try again.");
        console.error("Error fetching bills:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBills();
  }, []);

const hadleRouteChange = ()=>{
  navigate('/ride')
}

  return (
    <div className="h-screen w-screen overflow-x-hidden">
      <Toaster />
      {/* Header */}
      <Header />

      <div className="max-w-[1180px] mx-auto p-6 md:p-12">
        {/* Back Button */}
        <div className="flex items-center mb-4 cursor-pointer">
         <button onClick={hadleRouteChange}>
           <FaArrowLeft className="text-lg mr-2" />
         </button>
          
        </div>
        <div className="p-4">
          <div className="text-lg font-bold mb-4">Your Bills</div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <DotLoader color="#A75AF2" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bills.map((bill) => (
                <Link
                  to={`/bill/details/${bill.id}`}
                  state={{ bill }}
                  key={bill.id}
                  className="border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="relative">
                    <img
                      src={`/images/${
                        bill.type === "ride" ? "map-img.png" : "bill.png"
                      }`}
                      alt={`${bill.type} Map`}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#E9D6FE] px-3 py-1 text-[16px] rounded-full">
                      {bill.type}
                    </div>
                  </div>
                  <div className="flex justify-between items-end p-3">
                    <div className="text-[16px] font-bold">
                      {bill.createdAt
                        ? format(new Date(bill.createdAt), "dd/MM/yyyy")
                        : "Invalid Date"}
                    </div>
                    <div>
                      <div className="text-[12px] font-bold text-gray-800 ">
                        ₦ <span className="text-[16px]">{bill.fare}</span>
                      </div>
                      {/* <div className="text-yellow-500 text-lg mt-1">
                        {"★".repeat(bill.rating)}
                      </div> */}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bill;
