import React from "react";
import Header from "../../../components/driver-panel/header";
import { MdOutlinePersonOutline } from "react-icons/md";
import { IoIosStar } from "react-icons/io";
import { Link } from "react-router-dom";

const PackageEnd = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-100">
        <div className="relative h-[80vh]">
          <img
            src="/map.png"
            alt="Map"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex justify-between items-center p-4">
            <div className="bg-white shadow-lg rounded-lg p-6 max-w-[282px]">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex flex-col justify-center items-center w-full gap-1">
                  <div className="w-10 h-10 bg-primaryPurple rounded-full flex items-center justify-center text-white">
                    <MdOutlinePersonOutline size={25} />
                  </div>
                  <h2 className="text-[16px] font-[600]">MoovR X</h2>
                  <p className="font-[600] text-[24px]">
                    <span className="text-[14px] mr-1">₦</span>125
                  </p>
                  <p className="text-[12px] text-black/50">Includes 5% tax</p>
                  <p className="flex items-center gap-2 text-[12px] text-black">
                    <IoIosStar className="text-primaryPurple" /> 4.3 Cash
                    Payment
                  </p>
                </div>
              </div>
              <div className="flex gap-2 items-start ">
                <img
                  className="mt-2"
                  src="/driver/horizontal-sm-connector.svg"
                  alt=""
                />
                <div>
                  <div className="mb-4 text-black text-[16px]">
                    <p>Pickup point </p>
                    <p className="text-[12px] text-black/50">
                      House no 32, Freetown, Abuja, Nigeria
                    </p>
                  </div>
                  <div>
                    <p>15 mins (4.5Km) trip</p>
                    <p className="text-[12px] text-black/50">
                      Dropoff: Transcorp hill station, Sani Abacha way, Abuja,
                      Nigeria
                    </p>
                  </div>
                </div>
              </div>
              <Link to={"/d/package/delivered"}>
                <button className="bg-[#F3E9FE]  w-full mt-4 py-4 font-[600] rounded-full">
                  End
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PackageEnd;
