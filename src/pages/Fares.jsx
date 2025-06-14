import axios from "axios";
import { useState } from "react";
import Select from "../components/comps/Select.js";
import { CreditCard, Clock } from "lucide-react";

export default function Fares() {
  const fareStructure = [
    { distance: "Upto 2 km", fare: 12 },
    { distance: "2 to 4 km", fare: 18 },
    { distance: "4 to 6 km", fare: 30 },
    { distance: "6 to 9 km", fare: 40 },
    { distance: "9 to 12 km", fare: 50 },
    { distance: "12 to 15 km", fare: 55 },
    { distance: "15 to 18 km", fare: 60 },
    { distance: "18 to 21 km", fare: 66 },
    { distance: "21 to 24 km", fare: 70 },
    { distance: "More than 24 km", fare: 75 },
  ];

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [path, setPath] = useState([]);
  const [fare, setFare] = useState(0);
  const [distance, setDistance] = useState(0);
  const [loader, setLoader] = useState(false);
  const [view, setView] = useState(false);

  // Updated API endpoint for fare calculation
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoader(true);
    try {
      const response = await axios.get(
        `https://neo-metro-flask.vercel.app/path/${encodeURIComponent(source)}/${encodeURIComponent(destination)}`
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Fare Information
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transparent and affordable pricing for all your metro travel needs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fare Summary */}
          <div>
            <form
              onSubmit={handleSubmit}
              className="bg-[#E6F0FF] shadow-lg border border-[#A5C4F1] rounded-lg p-6 w-full max-w-md m-3"
            >
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
              <div className="mt-6 bg-[#E6F0FF] shadow-lg border border-[#A5C4F1] rounded-lg p-6 w-full max-w-md">
                <div className="space-y-6">
                  <div className="bg-white shadow-lg rounded-lg p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-metro-600" />
                        Fare Summary
                      </h3>
                    </div>
                    {fare ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">Route</span>
                          <span className="font-medium">
                            {source} → {destination}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">Distance</span>
                          <span className="font-medium">{distance} km</span>
                        </div>

                        <div className="flex justify-between items-center py-2 text-lg font-bold">
                          <span>Total Fare</span>
                          <span className="text-metro-600">₹{fare}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select your journey details to calculate fare</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Distance-based Fares */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <CreditCard className="h-6 w-6 mr-2 text-metro-600" />
                Distance-based Fares
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fareStructure.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{item.distance}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-metro-600">
                      ₹{item.fare}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Fares are calculated based on the shortest
                route between stations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
