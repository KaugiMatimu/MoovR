import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip
);

const RevenueChart = () => {
  const labels = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

  const [chartData, setChartData] = useState({
    labels,
    datasets: [
      {
        label: "Total Revenue",
        data: [10, 20, 30, 40, 50, 45, 30, 35, 40, 45, 50, 55, 20, 60],
        fill: true,
        backgroundColor: "rgba(144, 71, 255, 0.1)", // Placeholder, updated dynamically
        borderColor: "rgba(144, 71, 255, 1)",
        borderWidth: 2.5,
        pointBackgroundColor: "rgba(144, 71, 255, 1)",
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.35,
      },
    ],
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(144, 71, 255, 0.9)",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        displayColors: false,
        callbacks: {
          label: (context) => `₦${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#888888",
          font: {
            size: 13,
          },
        },
      },
      y: {
        grid: {
          color: "#eaeaea",
        },
        ticks: {
          color: "#888888",
          font: {
            size: 13,
          },
          stepSize: 10,
          callback: (value) => `${value}`,
        },
        beginAtZero: true,
        max: 60,
      },
    },
    onResize(chart) {
      applyGradient(chart);
    },
    animation: {
      onComplete: ({ chart }) => applyGradient(chart),
    },
  };

  const applyGradient = (chart) => {
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;

    if (!chartArea) return; // Ensure chart area is available

    const gradient = ctx.createLinearGradient(
      0,
      chartArea.top,
      0,
      chartArea.bottom
    );
    gradient.addColorStop(0, "rgba(144, 71, 255, 0.4)"); // Strong purple at the top
    gradient.addColorStop(1, "rgba(144, 71, 255, 0)"); // Transparent at the bottom

    const updatedDatasets = chartData.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: gradient,
    }));

    setChartData({
      ...chartData,
      datasets: updatedDatasets,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="relative h-60">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RevenueChart;
