import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
export default function Register() {
    const [loader, setLoader] = useState(false);
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [number, setNumber] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoader(true);
        try {
            await axios.post("https://metro-backend-eight.vercel.app/api/users/register", {
                name,
                username,
                password,
                gmail : email,
                mobilenumber : number
            });
            setLoader(false);
            navigate("/login");
        } catch (error) {
            console.error("Error registering:", error);
            setLoader(false);
        }
    };

    return (
        <div className="place-items-center p-2">
            <div className="w-full max-w-md p-8 space-y-3 rounded-xl bg-[#E6F0FF] dark:text-gray-800">
                <h1 className="text-2xl font-bold text-center">Register</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1 text-sm">
                        <label htmlFor="name" className="block dark:text-gray-600">Full Name</label>
                        <input type="text" name="name" id="name" onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full px-4 py-3 rounded-md dark:border-gray-300 dark:bg-gray-50 dark:text-gray-800 focus:dark:border-violet-600" required />
                    </div>
                    <div className="space-y-1 text-sm">
                        <label htmlFor="username" className="block dark:text-gray-600">Username</label>
                        <input type="text" name="username" id="username" onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full px-4 py-3 rounded-md dark:border-gray-300 dark:bg-gray-50 dark:text-gray-800 focus:dark:border-violet-600" required />
                    </div>
                    <div className="space-y-1 text-sm">
                        <label htmlFor="email" className="block dark:text-gray-600">Gmail</label>
                        <input type="email" name="email" id="email" onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-md dark:border-gray-300 dark:bg-gray-50 dark:text-gray-800 focus:dark:border-violet-600" required />
                    </div>
                    <div className="space-y-1 text-sm">
                        <label htmlFor="number" className="block dark:text-gray-600">Phone Number</label>
                        <input type="tel" name="number" id="number" onChange={(e) => setNumber(e.target.value)} placeholder="Phone Number" className="w-full px-4 py-3 rounded-md dark:border-gray-300 dark:bg-gray-50 dark:text-gray-800 focus:dark:border-violet-600" required />
                    </div>
                    <div className="space-y-1 text-sm">
                        <label htmlFor="password" className="block dark:text-gray-600">Password</label>
                        <input type="password" name="password" id="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-md dark:border-gray-300 dark:bg-gray-50 dark:text-gray-800 focus:dark:border-violet-600" required />
                    </div>
                    {loader ? (
                        <div className="w-16 h-16 m-2 border-4 border-dashed rounded-full animate-spin dark:border-blue-600"></div>
                    ) : (
                        <button type="submit" className="block w-full p-3 text-center rounded-sm dark:text-gray-50 dark:bg-violet-600">Sign Up</button>
                    )}
                </form>
                <p className="text-xs text-center sm:px-6 dark:text-gray-600">
                    Already have an account? 
                    <Link to="/login" className="underline dark:text-gray-800 font-semibold">Login</Link>
                </p>
            </div>
        </div>
    );
}
