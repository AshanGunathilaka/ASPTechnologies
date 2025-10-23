import React from "react";

const DashboardCard = ({ title }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 text-center hover:shadow-lg transition">
      <h2 className="text-lg font-semibold text-yellow-600">{title}</h2>
    </div>
  );
};

export default DashboardCard;
