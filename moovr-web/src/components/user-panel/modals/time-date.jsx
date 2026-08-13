import React, { useState, useRef } from "react";

const DateTimeModal = ({ isOpen, onClose, onSetPickupTime }) => {
  const [selectedDate, setSelectedDate] = useState("Wed Sep 05");
  const [selectedTime, setSelectedTime] = useState({
    hour: "5",
    minute: "30",
    period: "PM",
  });

  const dateRef = useRef();
  const hourRef = useRef();
  const minuteRef = useRef();

  // Handle scrolling to detect the middle item
  const handleScroll = (ref, items, setter) => {
    const containerHeight = ref.current.offsetHeight; // Height of the scroll container
    const scrollTop = ref.current.scrollTop; // Scroll position
    const itemHeight = ref.current.firstChild.offsetHeight; // Height of each item
    const middlePosition = scrollTop + containerHeight / 2; // Middle position in the visible area
    const centeredIndex = Math.floor(middlePosition / itemHeight); // Determine the centered item index
    setter(items[centeredIndex]); // Set the selected value
  };

  const handleSetPickupTime = () => {
    const pickupTime = `${selectedDate}, ${selectedTime.hour}:${selectedTime.minute} ${selectedTime.period}`;
    onSetPickupTime(pickupTime);
    onClose();
  };

  if (!isOpen) return null;

  const dates = [
    "Mon Sep 03",
    "Tue Sep 04",
    "Wed Sep 05",
    "Thu Sep 06",
    "Fri Sep 07",
    "Sat Sep 08",
    "Sun Sep 09",
  ];
  const hours = Array.from({ length: 24 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-lg p-6">
        {/* Modal Header */}
        <h2 className="text-center text-lg font-semibold text-gray-900 mb-6">
          When you want to leave?
        </h2>

        {/* Content */}
        <div className="flex gap-4 justify-center">
          {/* Date Selector */}
          <div
            ref={dateRef}
            onScroll={() => handleScroll(dateRef, dates, setSelectedDate)}
            className="h-36 overflow-y-auto scrollbar-hidden p-2 text-gray-700 snap-y snap-mandatory"
          >
            {dates.map((date, index) => (
              <div
                key={index}
                className={`cursor-pointer py-2 px-3 text-center rounded-md snap-center ${
                  selectedDate === date
                    ? "text-[16px] font-semibold text-black"
                    : "text-gray-400"
                }`}
              >
                {date}
              </div>
            ))}
          </div>

          {/* Hour Selector */}
          <div
            ref={hourRef}
            onScroll={() =>
              handleScroll(hourRef, hours, (hour) =>
                setSelectedTime({ ...selectedTime, hour })
              )
            }
            className="h-36 overflow-y-auto scrollbar-hidden p-2 text-gray-700 snap-y snap-mandatory"
          >
            {hours.map((hour, index) => (
              <div
                key={index}
                className={`cursor-pointer py-2 px-3 text-center rounded-md snap-center ${
                  selectedTime.hour === hour
                    ? "text-[16px] font-semibold text-black"
                    : "text-gray-400"
                }`}
              >
                {hour}
              </div>
            ))}
          </div>

          {/* Minute Selector */}
          <div
            ref={minuteRef}
            onScroll={() =>
              handleScroll(minuteRef, minutes, (minute) =>
                setSelectedTime({ ...selectedTime, minute })
              )
            }
            className="h-36 overflow-y-auto scrollbar-hidden p-2 text-gray-700 snap-y snap-mandatory"
          >
            {minutes.map((minute, index) => (
              <div
                key={index}
                className={`cursor-pointer py-2 px-3 text-center rounded-md snap-center ${
                  selectedTime.minute === minute
                    ? "text-[16px] font-semibold text-black"
                    : "text-gray-400"
                }`}
              >
                {minute}
              </div>
            ))}
          </div>

          {/* Period Selector */}
          <div className="h-36 overflow-y-auto scrollbar-hidden p-2 text-gray-700 snap-y snap-mandatory">
            {["AM", "PM"].map((period, index) => (
              <div
                key={index}
                onClick={() =>
                  setSelectedTime({ ...selectedTime, period: period })
                }
                className={`cursor-pointer py-2 px-3 text-center rounded-md snap-center ${
                  selectedTime.period === period
                    ? "text-[16px] font-semibold text-black"
                    : "text-gray-400"
                }`}
              >
                {period}
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleSetPickupTime}
            className="w-full max-w-xs py-3 bg-purple-500 text-white font-medium rounded-full hover:bg-purple-600 transition"
          >
            Set pickup time
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeModal;
