import axios from "axios";
import { useState } from "react";
import Select from "./comps/Select.jsx";

export default function Fares() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [path, setPath] = useState([]);
  const [fare, setFare] = useState(0);
  const [distance, setDistance] = useState(0);
  const [loader, setLoader] = useState(false);
  const [view, setView] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoader(true);
    try {
      const response = await axios.get(
        `https://metro-murex.vercel.app/path/${encodeURIComponent(source)}/${encodeURIComponent(destination)}`
      );
      setPath(response.data.path);
      setFare(response.data.fare);
      setDistance(response.data.distance);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
      setView(true);
    }
  };

  return (
    <div>
      <div className="bg-red-600 text-white text-center py-2 px-2 text-sm font-semibold rounded-lg w-max place-self-center mt-2">
        This website is a development project and is not affiliated with Hyderabad Metro Rail. Do not use it for real bookings.
      </div>
      
      <div className="flex flex-col items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="bg-[#E6F0FF] shadow-lg border border-[#A5C4F1] rounded-lg p-6 w-full max-w-md m-3">
          <Select label="Source" value={source} setValue={setSource} />
          <Select label="Destination" value={destination} setValue={setDestination} />

          <button
            type="submit"
            className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-white font-semibold py-3 rounded-md transition-transform transform hover:scale-105"
          >
            Calculate Fare
          </button>
        </form>

        {loader && (
          <div className="w-16 h-16 m-2 border-4 border-dashed rounded-full animate-spin dark:border-blue-600"></div>
        )}

        {!loader && view && (
          <div className="mt-6 bg-[#E6F0FF] shadow-lg border border-[#A5C4F1] rounded-lg p-6 w-full max-w-md text-center">
            <p className="text-lg font-semibold text-[#3B4D66]">
              <span className="text-[#4A90E2]">Route: </span> {path}
            </p>
            <p className="text-lg font-semibold text-[#3B4D66] mt-3">
              <span className="text-[#4A90E2]">Distance: </span> {distance} km
            </p>
            <p className="text-lg font-semibold text-[#3B4D66] mt-3">
              <span className="text-[#4A90E2]">Fare: </span> Rs. {fare}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
