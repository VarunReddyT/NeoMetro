import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { logout } from "./features/authSlicer";

const isTokenValid = (token) => {
    if (!token) return false;
    try {
        const decoded = jwtDecode(token);
        return decoded.exp * 1000 > Date.now();
    } catch (error) {
        return false;
    }
};

export default function ProtectedRoute({ children }) {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.user?.token);
    const navigate = useNavigate();
    const [showAlert, setShowAlert] = useState(false);
    useEffect(() => {
        if (!token || !isTokenValid(token)) {
            setShowAlert(true);
            dispatch(logout());
            setTimeout(() => {
                setShowAlert(false);
                navigate('/login');
            }, 2000);
        }
    }, [token, navigate, dispatch]);

    return (
        <>
            {showAlert && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50 transition-all duration-300">
                    ⚠️ Please login to continue
                </div>
            )}
            {showAlert && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center space-y-4 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg z-50">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
                    <p className="text-lg font-semibold text-center text-gray-800 dark:text-gray-300">
                        Redirecting to login...
                    </p>
                </div>
            )}
            {token && isTokenValid(token) ? children : null}
        </>
    );
}
