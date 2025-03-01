import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./features/authSlicer";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const userName = useSelector((state) => state.auth.user?.username);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        async function getnotifications() {
            if (isAuthenticated) {
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
    }, [isAuthenticated]);

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
                    notification.id === notificationId ? { ...notification, read: true } : notification
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
                    {isAuthenticated && (
                        <div className="relative">
                            <button
                                onClick={toggleNotificationDropdown}
                                className="text-white focus:outline-none relative"
                            >
                                <i className="fas fa-bell text-xl"></i>
                                {notifications.length > 0 && notifications.filter(notification => !notification.read).length > 0 && (
                                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">!</span>
                                    )}
                            </button>
                            {isNotificationDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 notification-dropdown">
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Notifications</h3>
                                        {notifications.length > 0 ? (
                                            notifications.map((notification) => (
                                                <div key={notification._id} className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                                    <p className="text-sm text-gray-700 dark:text-white">{notification.message}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(notification.timestamp).toLocaleString()}
                                                    </p>
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => markAsRead(notification._id)}
                                                            className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                                        >
                                                            Mark as Read
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">No new notifications.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {!isAuthenticated ? (
                        <Link to="/login" className="hidden md:inline-block bg-gradient-to-r from-blue-500 to-violet-600 text-white px-6 py-2 rounded-full font-medium shadow-md hover:scale-105 transition-transform">
                            Login/Register
                        </Link>
                    ) : (
                        <div className="relative flex items-center space-x-2">
                            <div className="flex items-center space-x-2 cursor-pointer mt-1" onClick={toggleProfileDropdown}>
                                <span className="text-white">
                                    {userName.charAt(0).toUpperCase() + userName.slice(1)}
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-9">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                            </div>
                            {isProfileDropdownOpen && (
                                <div className="absolute top-1/2 right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 profile-dropdown">
                                    <Link to="/profile" className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                                        Profile
                                    </Link>
                                    <button className="block text-left w-full px-4 py-2 text-gray-800 dark:text-white hover:bg-red-700 dark:hover:bg-red-700" onClick={handleLogout}>
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
                className={`md:hidden absolute top-full left-1/2 transform -translate-x-1/2 w-[90%] bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-lg rounded-full overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "scale-y-100 opacity-100 py-4" : "scale-y-0 opacity-0 py-0"
                    } origin-top`}
            >
                <ul className="flex flex-col items-center space-y-3">
                    <li>
                        <Link to="/" className="px-6 py-2 text-gray-800 dark:text-white font-medium transition hover:text-violet-600">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/fares" className="px-6 py-2 text-gray-800 dark:text-white font-medium transition hover:text-violet-600">
                            Fares
                        </Link>
                    </li>
                    <li>
                        <Link to="/compare" className="px-6 py-2 text-gray-800 dark:text-white font-medium transition hover:text-violet-600">
                            Compare
                        </Link>
                    </li>
                    <li>
                        <Link to="/tickets" className="px-6 py-2 text-gray-800 dark:text-white font-medium transition hover:text-violet-600">
                            Tickets
                        </Link>
                    </li>
                    {!isAuthenticated ? (
                        <li>
                            <Link to="/login" className="bg-gradient-to-r from-blue-500 to-violet-600 text-white px-6 py-2 rounded-full font-medium shadow-md hover:scale-105 transition-transform">
                                Login/Register
                            </Link>
                        </li>
                    ) : (
                        <li>
                            <div className="flex items-center space-x-2 cursor-pointer" onClick={toggleProfileDropdown}>
                            </div>
                            {isProfileDropdownOpen && (
                                <div className="mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                                    <Link to="/profile" className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                                        Profile
                                    </Link>
                                    <button className="block w-full px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}