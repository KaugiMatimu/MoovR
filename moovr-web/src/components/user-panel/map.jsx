import React from "react";

const Map = () => {
  return (
    <div className="mt-8 w-full h-64">
      <iframe
        title="Map"
        src="/images/map-img.png"
        className="w-full h-full rounded-lg"
        allowFullScreen=""
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default Map;
