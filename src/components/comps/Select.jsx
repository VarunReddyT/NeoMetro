import React from "react";
import stations from "../Stations.js";

export default function Select({ label, value, setValue }) {
  return (
    <div className="mb-4">
      <label className="block text-[#2C3E50] font-medium mb-1">{label}</label>
      <select
        className="w-full p-3 border border-[#A5C4F1] rounded-md bg-[#F0F7FF] text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        required
      >
        <option value="">Select {label}</option>
        {stations.map((station, index) => (
          <option key={index} value={station}>
            {station}
          </option>
        ))}
      </select>
    </div>
  );
}
