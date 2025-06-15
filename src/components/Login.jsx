import backend from "../api/backend";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "./features/authSlicer";
import { Link } from "react-router-dom";

export default function Login() {
    const [loader, setLoader] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoader(true);
        try {
            const response = await backend.post("/api/users/login", {
                username,
                password,
            });

            dispatch(login({ username: username, token: response.data.token }));
            setLoader(false);
            setError("");
            navigate("/");
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoader(false);
            setError("Invalid username or password");
            setTimeout(() => {
                setError("");
            }, 3000);
        }
    };

    return (
        <div className="place-items-center p-2">
            <div className="w-full max-w-md p-8 space-y-3 rounded-xl bg-[#E6F0FF] dark:text-gray-800">
                <h1 className="text-2xl font-bold text-center">Login</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1 text-sm">
                        <label htmlFor="username" className="block dark:text-gray-600">Username</label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            className="w-full px-4 py-3 rounded-md dark:border-gray-300 dark:bg-gray-50 dark:text-gray-800 focus:dark:border-violet-600"
                        />
                    </div>
                    <div className="space-y-1 text-sm">
                        <label htmlFor="password" className="block dark:text-gray-600">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full px-4 py-3 rounded-md dark:border-gray-300 dark:bg-gray-50 dark:text-gray-800 focus:dark:border-violet-600"
                        />
                        <div className="flex justify-end text-xs dark:text-gray-600">
                            <a rel="noopener noreferrer" href="#">Forgot Password?</a>
                        </div>
                    </div>
                    {loader ? (
                        <div className="w-16 h-16 m-2 border-4 border-dashed rounded-full animate-spin dark:border-blue-600"></div>
                    ) : (
                        <button
                            type="submit"
                            className="block w-full p-3 text-center rounded-sm dark:text-gray-50 dark:bg-violet-600"
                        >
                            Sign in
                        </button>
                    )}
                </form>
                <p className="text-xs text-center sm:px-6 dark:text-gray-600">
                    Don't have an account?
                    <Link to="/register" className="underline dark:text-gray-800 font-semibold">Sign up</Link>
                </p>
            </div>
            {error && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50 transition-all duration-300">
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
}