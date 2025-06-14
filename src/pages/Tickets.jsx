import { useEffect, useState } from "react";
import Select from "../components/comps/Select";
import { addBooking } from "../components/features/bookingSlicer";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { MapPin, CreditCard, Clock } from "lucide-react";

export default function Tickets() {
    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");
    const [tickets, setTickets] = useState(1);
    const [date, setDate] = useState("");
    const [fare, setFare] = useState(null);
    const [distance, setDistance] = useState(null);
    const username = useSelector((state) => state.auth.user?.username);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (!source || !destination) return;

        const getFare = async () => {
            try {
                const encodedSource = encodeURIComponent(source);
                const encodedDestination = encodeURIComponent(destination);
                const response = await axios.get(`https://neo-metro-flask.vercel.app/path/${encodedSource}/${encodedDestination}`);
                setFare(response.data.fare);
                setDistance(response.data.distance);
            } catch (e) {
                console.error("Error fetching fare:", e);
            }
        };

        getFare();
    }, [source, destination]);

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            if (!source || !destination || !date) return alert("Please fill all fields.");
            const booking = { username, source, destination, tickets, journeyDate: date, fare: fare * tickets, distance };
            dispatch(addBooking(booking));
            navigate("/payment");
        } catch (e) {
            console.error(e);
        }
    };

    const handleSourceChange = (value) => {
        if (value === destination) {
            alert("Source and destination cannot be the same.");
            return;
        }
        setSource(value);
    };

    const handleDestinationChange = (value) => {
        if (value === source) {
            alert("Source and destination cannot be the same.");
            return;
        }
        setDestination(value);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Metro Tickets</h1>
                    <p className="text-gray-600">Quick and easy ticket booking for your metro journey</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Booking Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <MapPin className="h-5 w-5 mr-2 text-metro-600" />
                                    Journey Details
                                </h3>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">From Station</label>
                                        <Select label="Source" value={source} setValue={handleSourceChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">To Station</label>
                                        <Select label="Destination" value={destination} setValue={handleDestinationChange} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Journey Date</label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-metro-500 focus:border-transparent transition-all duration-200"
                                            min={new Date().toISOString().split("T")[0]}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Tickets</label>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                                                onClick={() => { if (tickets > 1) setTickets(tickets - 1); }}
                                            >
                                                -
                                            </button>
                                            <div className="w-16 border rounded p-2 text-center">{tickets}</div>
                                            <button
                                                type="button"
                                                className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                                                onClick={() => { if (tickets < 10) setTickets(tickets + 1); }}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {fare !== null && (
                                    <div className="bg-gray-100 p-4 rounded-lg">
                                        <p className="text-gray-700 font-medium">Fare per Ticket: <span className="font-bold">₹ {fare}</span></p>
                                        <p className="text-gray-700 font-medium">Total Fare: <span className="font-bold">₹ {fare * tickets}</span></p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!source || !destination || !date || fare === null}
                                    className={`w-full font-bold py-3 rounded-lg transition ${!source || !destination || !date || fare === null ? "bg-gray-300 text-gray-500" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                                >
                                    Proceed to Payment
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Fare Summary */}
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
                                        <span className="font-medium">{source} → {destination}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-gray-600">Distance</span>
                                        <span className="font-medium">{distance} km</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-gray-600">Tickets</span>
                                        <span className="font-medium">{tickets}</span>
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
            </div>
        </div>
    );
}
