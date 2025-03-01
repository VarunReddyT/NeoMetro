import { useEffect, useState } from "react";
import Select from "./comps/Select";
import { addBooking } from "./features/bookingSlicer";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

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

    return (

        <div>
            <div className="bg-red-600 text-white text-center py-2 px-2 text-sm font-semibold rounded-lg w-max place-self-center mt-2">
                This website is a development project and is not affiliated with Hyderabad Metro Rail. Do not use it for real bookings.
            </div>

            <div className="max-w-md mx-auto p-6 mt-2 bg-white shadow-lg rounded-lg">

                <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">Book Your Ticket</h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <Select label="Source" value={source} setValue={setSource} />
                    <Select label="Destination" value={destination} setValue={setDestination} />

                    <div className="flex items-center gap-4">
                        <label className="text-gray-700 font-medium">Number of Tickets:</label>
                        <button type="button" className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                            onClick={() => { if (tickets > 1) setTickets(tickets - 1); }}>
                            -
                        </button>
                        <div className="w-16 border rounded p-2 text-center">{tickets}</div>
                        <button type="button" className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                            onClick={() => { if (tickets < 10) setTickets(tickets + 1); }}>
                            +
                        </button>
                    </div>

                    <div>
                        <label className="text-gray-700 font-medium">Select Date:</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border rounded p-2 mt-1 text-gray-700 focus:ring focus:ring-blue-300 outline-none"
                            min={new Date().toISOString().split("T")[0]}
                            max={new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0]}
                        />
                    </div>
                    {fare !== null && (
                        <div className="bg-gray-100 p-3 rounded">
                            <p className="text-gray-700 font-medium">Fare per Ticket: <span className="font-bold">₹ {fare}</span></p>
                            <p className="text-gray-700 font-medium">Total Fare: <span className="font-bold">₹ {fare * tickets}</span></p>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition">
                        Book Now
                    </button>
                </form>
            </div>
        </div>
    );
}
