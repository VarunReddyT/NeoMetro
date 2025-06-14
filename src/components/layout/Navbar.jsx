"use client";

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Bell, User, Train } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/authSlicer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {jwtDecode} from "jwt-decode";

const Button = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-metro-600 hover:bg-metro-700 text-white focus:ring-metro-500",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500",
    outline: "border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-500",
    ghost: "hover:bg-gray-100 text-gray-700 focus:ring-gray-500",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${(disabled || loading) && "opacity-50 cursor-not-allowed"} ${className}`;

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

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
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Book Tickets", href: "/tickets" },
    { name: "Metro Pass", href: "/metro-pass" },
    { name: "Fares", href: "/fares" },
    { name: "Compare", href: "/compare" },
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (token && !isTokenValid(token)) {
      dispatch(logout());
      navigate("/login");
    }
  }, [token, dispatch, navigate]);

  useEffect(() => {
    async function getnotifications() {
      if (isTokenValid(token)) {
        await axios
          .get(`https://neo-metro-backend.vercel.app/api/users/${userName}/getnotifications`)
          .then((response) => {
            setNotifications(response.data);
          })
          .catch((error) => {
            console.error("Error fetching notifications:", error);
          });
      }
    }
    getnotifications();
  }, [token, userName]);

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
    await axios
      .put(`https://neo-metro-backend.vercel.app/api/users/${userName}/markasread`, { notificationId })
      .then(() => {
        setNotifications(
          notifications.map((notification) =>
            notification._id === notificationId ? { ...notification, read: true } : notification
          )
        );
      })
      .catch((error) => {
        console.error("Error marking notification as read:", error);
      });
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-metro-600 p-2 rounded-lg">
                <Train className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">NeoMetro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? "text-metro-600 border-b-2 border-metro-600"
                    : "text-gray-700 hover:text-metro-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isTokenValid(token) && (
              <div className="relative">
                {/* Notification Dropdown */}
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={toggleNotificationDropdown}
                >
                  <Bell className="h-5 w-5" />
                </button>
                {isNotificationDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 notification-dropdown">
                    <div className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                      Notifications
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-2 text-center text-gray-500 dark:text-gray-400 text-sm">
                          No new notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`px-4 py-2 flex items-center space-x-2 cursor-pointer transition-all duration-200 ${
                              !notification.read
                                ? "bg-blue-50 dark:bg-blue-900"
                                : "bg-transparent"
                            }`}
                            onClick={() => {
                              markAsRead(notification._id);
                              navigate(notification.route);
                            }}
                          >
                            <div className="flex-shrink-0">
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                            </div>
                            <div className="flex-1 text-sm">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {notification.title}
                              </span>{" "}
                              <span className="text-gray-500 dark:text-gray-400">
                                {notification.message}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      <Link
                        to="/notifications"
                        className="block px-4 py-2 text-sm text-center text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        View all notifications
                      </Link>
                    </div>
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

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-400 hover:text-gray-600">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? "text-metro-600 bg-metro-50"
                    : "text-gray-700 hover:text-metro-600 hover:bg-gray-50"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
