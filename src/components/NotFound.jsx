import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <h1 className="text-6xl font-bold text-blue-600 dark:text-blue-400">404</h1>
            <p className="mt-4 text-xl text-gray-800 dark:text-gray-300">Page Not Found</p>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/"
                className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-lg hover:scale-105 transition-transform shadow-md"
            >
                Go Back Home
            </Link>
        </div>
    );
}