import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Carousel = () => {
  const slides = [
    {
      title: "Save $50 per month",
      subtitle: "Subscribe to MoovR Plus now!",
      image: "/images/gift.png",
    },
    {
      title: "Get 20% off your first ride",
      subtitle: "Use code FIRST20",
      image: "/images/gift.png",
    },
    {
      title: "Refer a friend, get $10",
      subtitle: "Earn rewards with referrals",
      image: "/images/gift.png",
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: false,
    appendDots: (dots) => (
      <div
        style={{
          position: "absolute",
          bottom: "-80px", // Positioning the dots 10px from the bottom
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <ul style={{ margin: 0 }}>{dots}</ul>
      </div>
    ),
    customPaging: (i) => (
      <div
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: "#fff",
          opacity: 0.75,
        }}
      ></div>
    ),
  };

  return (
    <div
      style={{ backgroundImage: `url('/images/carousel-bg.png')` }}
      className="max-w-6xl h-[199px] mx-auto text-white rounded-lg m-8 p-8 mt-8 bg-cover bg-center relative"
    >
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div key={index} className="text-center relative">
            <h3 className="text-[24px] font-[600]">{slide.title}</h3>
            <p className="mt-2 text-[16px] text-white/60">{slide.subtitle}</p>
            <div className="mt-4">
              <img
                src={slide.image}
                alt="Promo"
                className="absolute right-5 top-1/2 -translate-y-1/2"
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Carousel;
