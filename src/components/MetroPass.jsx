import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function MetroPass() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [validPass, setValidPass] = useState(null);
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    useEffect(() => {
        async function checkMetroPass() {
            if (user?.username) {
                try {
                    const response = await axios.get(
                        `https://neo-metro-backend.vercel.app/api/users/${user.username}/checkmetropass`
                    );
                    if (response.data) {
                        setValidPass(response.data);
                        setSubmitted(true);
                    }
                } catch (err) {
                    console.error("Error checking metro pass:", err);
                }
            }
        }
        checkMetroPass();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !phone) return alert("Please fill all fields.");
        setLoading(true);

        try {
            const response = await axios.post(
                `https://neo-metro-backend.vercel.app/api/users/${user.username}/generatemetropass`,
                { name, email, phone }
            );
            setQrCode(response.data.qrCode);
            setSubmitted(true);
        } catch (err) {
            console.error("Error generating metro pass:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="bg-red-600 text-white text-center py-2 px-2 text-sm font-semibold rounded-lg w-max place-self-center mt-2">
                This website is a development project and is not affiliated with Hyderabad Metro Rail. Do not use it for real bookings.
            </div>

            <div className="flex flex-col items-center justify-center p-4">
                {!submitted ? (
                    <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">Apply for Metro Pass</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium">Full Name</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded-md" onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium">Email</label>
                            <input type="email" className="w-full p-3 border border-gray-300 rounded-md" onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium">Phone Number</label>
                            <input type="tel" className="w-full p-3 border border-gray-300 rounded-md" onChange={(e) => setPhone(e.target.value)} required />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700">
                            Submit
                        </button>
                    </form>
                ) : (
                    <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl flex items-center">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-blue-600 mb-4">Your Metro Pass</h2>
                            <p className="text-lg font-medium">Name: {name}</p>
                            <p className="text-lg font-medium">Email: {email}</p>
                            <p className="text-lg font-medium">Phone: {phone}</p>
                            <p className="mt-2 text-xs text-gray-600">Collect your pass at any nearest metro station with this QR code.</p>
                            <div className="flex justify-center mt-4">
                                <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700" onClick={() => navigate("/")}>
                                    Return to Home
                                </button>
                            </div>
                        </div>
                        {loading ? (
                            <div className="w-16 h-16 m-2 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
                        ) : qrCode || validPass?.qrCode ? (
                            <img src={`data:image/png;base64,${qrCode || validPass.qrCode}`} alt="QR Code" className="w-40 h-40 rounded-lg object-cover mt-4" />
                        ) : (
                            <p className="mt-3 text-blue-600 font-bold">Failed to load QR Code</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}