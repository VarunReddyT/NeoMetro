import React, { useState } from "react";
import axios from "axios";
import Select from "../components/comps/Select";

export default function Compare() {
    const [view, setView] = useState(false);
    const [mileage, setMileage] = useState("");
    const [dailyDistance, setDailyDistance] = useState("");
    const [petrolPrice, setPetrolPrice] = useState("");
    const [extraExpenses, setExtraExpenses] = useState("");
    const [totalExpensesV, setTotalExpensesV] = useState("");
    const [totalExpensesM, setTotalExpensesM] = useState("");
    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");
    const [fare, setFare] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setView(false);
        setLoading(true);
        const totalExpenses = (parseInt(dailyDistance) / parseInt(mileage)) * parseFloat(petrolPrice);
        setTotalExpensesV(totalExpenses.toFixed(2));
        try {
            const response = await axios.get(
                `https://neo-metro-flask.vercel.app/path/${source}/${destination}`
            );
            const fareValue = response.data.fare;
            setFare(fareValue);
            setTotalExpensesM(parseInt(fareValue) + parseInt(extraExpenses || 0));
            setLoading(false);
            setView(true);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 ">
            <div className="bg-white shadow-lg border border-gray-300 rounded-lg p-6 w-full max-w-2xl">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-3">
                    Compare Expenses
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-white shadow-md rounded-lg">
                            <h3 className="text-xl font-bold text-blue-600 mb-4">Vehicle</h3>
                            <label className="block text-gray-700 font-medium">Mileage (km)</label>
                            <input type="number" placeholder="Enter Vehicle Mileage" onChange={(e) => setMileage(e.target.value)} className="w-full p-3 border rounded-md bg-gray-50 text-gray-700" required />

                            <label className="block text-gray-700 font-medium mt-3">Travel Distance (km)</label>
                            <input type="number" placeholder="Distance of travel (one way)" onChange={(e) => setDailyDistance(e.target.value)} className="w-full p-3 border rounded-md bg-gray-50 text-gray-700" required />

                            <label className="block text-gray-700 font-medium mt-3">Petrol Price (Rs)</label>
                            <input type="text" placeholder="Enter Petrol Price" onChange={(e) => setPetrolPrice(e.target.value)} className="w-full p-3 border rounded-md bg-gray-50 text-gray-700" required />
                        </div>

                        <div className="p-4 bg-white shadow-md rounded-lg">
                            <h3 className="text-xl font-bold text-blue-600 mb-4">Metro</h3>
                            <Select label="Source" value={source} setValue={setSource} />
                            <Select label="Destination" value={destination} setValue={setDestination} />

                            <label className="block text-gray-700 font-medium mt-3">Extra Expenses (if any)</label>
                            <input type="number" placeholder="Expenses for other transport" onChange={(e) => setExtraExpenses(e.target.value)} className="w-full p-3 border rounded-md bg-gray-50 text-gray-700" />
                        </div>
                    </div>
                    {loading && (
                        <div className="flex justify-center mt-4">
                            <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-md transition-transform transform hover:scale-105">
                        Compare
                    </button>
                </form>
                {view && (
                    <div className="mt-6 p-6 bg-white border border-gray-200 shadow-lg rounded-lg text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Comparision</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="text-lg font-bold text-blue-700">Vehicle</h4>
                                <p className="text-gray-800 mt-2 text-lg">Total Expenses: <span className="font-bold text-gray-900">Rs. {totalExpensesV}</span></p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <h4 className="text-lg font-bold text-green-700">Metro</h4>
                                <p className="text-gray-800 mt-2 text-lg">Total Expenses: <span className="font-bold text-gray-900">Rs. {totalExpensesM}</span></p>
                                <p className="text-gray-800 mt-2 text-sm">(Metro Fare: <span className="font-bold text-gray-900">Rs. {fare}</span>)</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
