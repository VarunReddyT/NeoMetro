import { Link } from "react-router-dom";
export default function Home() {
    return (
        <section className="">
            <div className="container mx-auto flex flex-col justify-center p-6 px-20 lg:flex-row lg:justify-between">
                <div className="flex flex-col justify-center p-6 text-center rounded-sm lg:max-w-md xl:max-w-lg lg:text-left">
                    <h1 className="text-4xl sm:text-5xl font-bold leading-none">
                    Fast. <span className="dark:text-blue-600">Reliable.</span> Seamless.
                    </h1>
                    <p className="mt-4 text-lg sm:text-xl">
                        Check metro timings, routes, fares, and more.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
                        <Link to="/fares" className="px-6 py-3 text-lg font-semibold rounded dark:bg-blue-600 dark:text-gray-50">
                            Check Fares
                        </Link>
                        <Link to="/tickets" className="px-6 py-3 text-lg font-semibold border rounded dark:bg-white">
                            Tickets
                        </Link>
                    </div>
                </div>
                <div className="flex items-center justify-center p-6 mt-8 lg:mt-0">
                    <img
                        src="/metro2.png"
                        alt="Metro"
                        className="object-contain min-w-[300px] w-[450px] sm:w-[500px] lg:w-[550px] xl:w-[600px] 2xl:w-[650px]"
                    />
                </div>
            </div>
        </section>
    );
}
