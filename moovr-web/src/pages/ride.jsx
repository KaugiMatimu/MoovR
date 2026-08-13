import React from "react";
import Header from "../components/header";
import Carousel from "../components/carousel";
import RideForm from "../components/ride-form";
import Map from "../components/map";

const Ride = () => {
  return (
    <div>
      <Header />
      <div className="grid md:grid-cols-2 min-h-[500px] items-center p-4">
        <RideForm />
        {/* <Map /> */}
        <img
          src="/images/map-img.png"
          alt=""
          className="h-[422px] rounded-[12px]"
        />
      </div>
      <Carousel />
    </div>
  );
};

export default Ride;
