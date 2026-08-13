import React from "react";

const Discover = () => {
  const discoverCards = [
    {
      image: "/images/discover-img-1.jpeg",
      title: "Your ride, your way, your time",
      description:
        "Now more than ever, reservations are a way of life. Reserve a premium MoovR experience, up to 90 days in advance, for whenever you’re ready to ride.",
      link: "Learn more",
    },
    {
      image: "/images/discover-img-2.png",
      title: "Rent a car, rent an adventure",
      description:
        "Your priority for car rentals. Book online for family vacations, weekend getaways, and road trips.",
      link: "Learn more",
    },
    {
      image: "/images/discover-img-3.png",
      title: "Drive without driving",
      description:
        "With MoovR, your car becomes a luxury ride at your convenience. Whether it’s a late-night airport pickup or a busy workday, our drivers are ready to take the wheel.",
      link: "Learn more",
    },
  ];

  return (
    <div className="px-8 py-10">
      <h2 className="text-xl font-semibold mb-6">Discover</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {discoverCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={card.image}
              alt={card.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-gray-600 mb-4">{card.description}</p>
              <a
                href="#"
                className="text-purple-500 font-semibold hover:underline"
              >
                {card.link}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Discover;
