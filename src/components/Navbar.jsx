import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./features/authSlicer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const isTokenValid = (token) => {
    if (!token) return false;
    try {
        const decoded = jwtDecode(token);
        return decoded.exp * 1000 > Date.now();
    } catch (error) {
        return false;
    }
};

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const token = useSelector((state) => state.auth.user?.token);
    const userName = useSelector((state) => state.auth.user?.username);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); 
    useEffect(() => {
        if (token && !isTokenValid(token)) {
            dispatch(logout());
            navigate("/login");
        }
    }, [token, dispatch, navigate]);

    useEffect(() => {
        async function getnotifications() {
            if (isTokenValid(token)) {
                await axios.get(`https://neo-metro-backend.vercel.app/api/users/${userName}/getnotifications`)
                    .then(response => {
                        setNotifications(response.data);
                    })
                    .catch(error => {
                        console.error("Error fetching notifications:", error);
                    });
            }
        }
        getnotifications();
    }, [token, isAuthenticated, userName]);

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
        setIsNotificationDropdownOpen(false);
    };

    const toggleNotificationDropdown = () => {
        setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
        setIsProfileDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isProfileDropdownOpen && !event.target.closest(".profile-dropdown")) {
                setIsProfileDropdownOpen(false);
            }
            if (isNotificationDropdownOpen && !event.target.closest(".notification-dropdown")) {
                setIsNotificationDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isProfileDropdownOpen, isNotificationDropdownOpen]);

    useEffect(() => {
        setIsProfileDropdownOpen(false);
        setIsNotificationDropdownOpen(false);
    }, [window.location.pathname]);

    const handleLogout = () => {
        dispatch(logout());
        setIsProfileDropdownOpen(false);
        navigate("/login");
    };

    const markAsRead = async (notificationId) => {
        await axios.put(`https://neo-metro-backend.vercel.app/api/users/${userName}/markasread`, { notificationId })
            .then(() => {
                setNotifications(notifications.map(notification =>
                    notification._id === notificationId ? { ...notification, read: true } : notification
                ));
            })
            .catch(error => {
                console.error("Error marking notification as read:", error);
            });
    };

    return (
        <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[80%] md:max-w-[80%] bg-white/80 dark:bg-blue-900/80 backdrop-blur-lg shadow-lg rounded-full px-6 py-3 z-50">
            <div className="flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-white">
                    NeoMetro
                </Link>
                <ul className="hidden md:flex space-x-6 text-gray-800 dark:text-white font-medium">
                    <li>
                        <Link to="/fares" className="relative px-3 py-2 transition-all duration-300 hover:text-blue-300 hover:underline">
                            Fares
                        </Link>
                    </li>
                    <li>
                        <Link to="/metro-pass" className="relative px-3 py-2 transition-all duration-300 hover:text-blue-300 hover:underline">
                            Metro Pass
                        </Link>
                    </li>
                    <li>
                        <Link to="/compare" className="relative px-3 py-2 transition-all duration-300 hover:text-blue-300 hover:underline">
                            Compare
                        </Link>
                    </li>
                    <li>
                        <Link to="/tickets" className="relative px-3 py-2 transition-all duration-300 hover:text-blue-300 hover:underline">
                            Tickets
                        </Link>
                    </li>
                </ul>
                <div className="flex items-center space-x-4">
                    {isTokenValid(token) && (
                        <div className="relative">
                            <button
                                onClick={toggleNotificationDropdown}
                                className="text-gray-800 dark:text-white focus:outline-none relative"
                                aria-label="Notifications"
                            >
                                <i className="fas fa-bell text-xl"></i>
                                {notifications.length > 0 && notifications.filter(notification => !notification.read).length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                        {notifications.filter(notification => !notification.read).length}
                                    </span>
                                )}
                            </button>
                            {isNotificationDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 notification-dropdown">
                                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Notifications</h3>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto p-2">
                                        {notifications.length > 0 ? (
                                            notifications.map((notification) => (
                                                <div 
                                                    key={notification._id} 
                                                    className={`mt-2 p-3 ${notification.read ? 'bg-gray-50 dark:bg-gray-700' : 'bg-blue-50 dark:bg-blue-900'} rounded-lg border ${notification.read ? 'border-gray-100 dark:border-gray-600' : 'border-blue-100 dark:border-blue-800'}`}
                                                >
                                                    <p className="text-sm text-gray-700 dark:text-white">{notification.message}</p>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(notification.timestamp).toLocaleString()}
                                                        </p>
                                                        {!notification.read && (
                                                            <button
                                                                onClick={() => markAsRead(notification._id)}
                                                                className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md transition"
                                                            >
                                                                Mark as Read
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-6">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                </svg>
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">No notifications yet</p>
                                            </div>
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                                            <button 
                                                className="w-full text-center text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                                onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                                            >
                                                Mark all as read
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {!isTokenValid(token) ? (
                        <Link to="/login" className="hidden md:inline-block bg-gradient-to-r from-blue-500 to-violet-600 text-white px-6 py-2 rounded-full font-medium shadow-md hover:scale-105 transition-transform">
                            Login/Register
                        </Link>
                    ) : (
                        <div className="relative flex items-center space-x-2">
                            <div className="flex items-center space-x-2 cursor-pointer mt-1" onClick={toggleProfileDropdown}>
                                <span className="text-gray-800 dark:text-white hidden sm:block">
                                    {userName.charAt(0).toUpperCase() + userName.slice(1)}
                                </span>
                                <div className="bg-blue-600 rounded-full p-1 text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                </div>
                            </div>
                            {isProfileDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 profile-dropdown">
                                    <Link to="/profile" className="px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile
                                    </Link>
                                    <button className="text-left w-full px-4 py-2 hover:bg-red-100 dark:hover:bg-red-800 text-red-600 dark:text-red-400 flex items-center" onClick={handleLogout}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <button
                    className="md:hidden text-gray-800 dark:text-white focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Menu"
                >
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    )}
                </button>
            </div>
            <div
                className={`md:hidden absolute top-full left-1/2 transform -translate-x-1/2 w-[90%] bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "scale-y-100 opacity-100 py-4" : "scale-y-0 opacity-0 py-0"
                    } origin-top`}
            >
                <ul className="flex flex-col items-center space-y-3">
                    <li>
                        <Link to="/" className="px-6 py-2 text-gray-800 dark:text-white font-medium transition-all hover:text-blue-400 hover:underline">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/fares" className="px-6 py-2 text-gray-800 dark:text-white font-medium transition-all hover:text-blue-400 hover:underline">
                            Fares
                        </Link>
                    </li>
                    <li>
                        <Link to="/metro-pass" className="px-6 py-2 text-gray-800 dark:text-white font-medium transition-all hover:text-blue-400 hover:underline">
                            Metro Pass
                        </Link>
                    </li>
                    <li>
                        <Link to="/compare" className="px-6 py-2 text-gray-800 dark:text-white font-medium transition-all hover:text-blue-400 hover:underline">
                            Compare
                        </Link>
                    </li>
                    <li>
                        <Link to="/tickets" className="px-6 py-2 text-gray-800 dark:text-white font-medium transition-all hover:text-blue-400 hover:underline">
                            Tickets
                        </Link>
                    </li>
                    {!isTokenValid(token) && (
                        <li className="pt-2">
                            <Link to="/login" className="bg-gradient-to-r from-blue-500 to-violet-600 text-white px-6 py-2 rounded-full font-medium shadow-md hover:scale-105 transition-transform">
                                Login/Register
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}