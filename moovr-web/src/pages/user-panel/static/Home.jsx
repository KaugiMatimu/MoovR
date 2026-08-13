import React from "react";
import Navbar from "../../../components/user-panel/static/Navbar";
import HeroSection from "../../../components/user-panel/static/Hero";
import Discover from "../../../components/user-panel/static/Discover";
import Banner from "../../../components/user-panel/static/Banner";
import Description from "../../../components/user-panel/static/Description";
import FAQs from "../../../components/user-panel/static/FAQs";
import Footer from "../../../components/user-panel/static/Footer";
import Download from "../../../components/user-panel/static/Download";

const HomePage = () => {
  return (
    <div className="">
      <Navbar />
      <div className="max-w-[1180px] mx-auto text-start">
        <HeroSection />
        <Discover />
        <Banner />
        <Description />
        <Download />
        <FAQs />
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
