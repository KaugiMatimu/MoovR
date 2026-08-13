import Header from "../../components/driver-panel/header";

export default function Pass() {
  const passes = [
    {
      type: "Daily",
      duration: "24hours",
      url: "day-pass",
      price: 25,
      description:
        "This MoovR Pass available for 24 hours with unlimited rides.",
    },
    {
      type: "Weekly",
      duration: "07 Days",
      url: "week-pass",
      price: 125,
      description:
        "This MoovR Pass available for 07 days with unlimited rides.",
    },
    {
      type: "Monthly",
      duration: "01 Month",
      url: "month-pass",
      price: 425,
      description:
        "This MoovR Pass available for 01 month with unlimited rides.",
    },
    {
      type: "Annually",
      duration: "01 Year",
      url: "year-pass",
      price: 1025,
      description:
        "This MoovR Pass available for 01 year with unlimited rides.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-[]16px font-[600] mb-2">MoovR Pass</h1>
        <p className="text-[24px] font-[600] mb-8">
          Select a MoovR Pass to start earnig.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {passes.map((pass) => (
            <div key={pass.type} className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-medium mb-6">{pass.type}</h2>

              <div className="flex justify-between items-start mb-6">
                <img src={`/driver/pass/${pass.url}.svg`} alt="" />

                <div className="flex-1 ml-6">
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {pass.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <button className="px-6 py-2 bg-primaryPurple rounded-full text-white  hover:bg-[#7347d5]">
                      Get Pass
                    </button>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="text-lg font-medium">₦{pass.price}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
