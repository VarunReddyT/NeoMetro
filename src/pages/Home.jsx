import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, Users, MapPin, CreditCard, Train } from "lucide-react";
import ChatbotUI from "./ChatBot";

const Button = ({ children, className = "", variant = "primary", size = "md", ...props }) => {
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

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "", ...props }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default function Home() {
  const features = [
    {
      icon: <Train className="h-8 w-8 text-metro-600" />,
      title: "Compare fares with other transport",
      description: "Check fares and timings of buses, trains, and other metros",
    },
    {
      icon: <Shield className="h-8 w-8 text-metro-600" />,
      title: "Secure Payments",
      description: "Safe and encrypted payment processing",
    },
    {
      icon: <Zap className="h-8 w-8 text-metro-600" />,
      title: "Quick Booking",
      description: "Book tickets in seconds with our streamlined process",
    },
    {
      icon: <Users className="h-8 w-8 text-metro-600" />,
      title: "Group Travel",
      description: "Easy booking for multiple passengers",
    },
    {
      icon: <MapPin className="h-8 w-8 text-metro-600" />,
      title: "Route Planning",
      description: "Optimal route suggestions with fare calculation",
    },
    {
      icon: <CreditCard className="h-8 w-8 text-metro-600" />,
      title: "Digital Passes",
      description: "Convenient metro passes with QR code access",
    },
  ];

  const stats = [
    { label: "Daily Passengers", value: "4.5 Lakh+" },
    { label: "Metro Stations", value: "56" },
    { label: "Route Lines", value: "3" },
    { label: "CO2 Emissions Reduced", value: "424 Million kg" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-metro-500 via-metro-600 to-metro-700 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">Fast.&nbsp;
              <span className="text-gray-800">
                Reliable.&nbsp;
              </span>
              Seamless.</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto animate-slide-up">
              Check metro timings, routes, fares, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link to="/tickets">
                <Button size="lg" className="text-blue-600 hover:bg-metro-500 font-semibold px-8 py-4">
                  Book Tickets Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/fares">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-metro-600 px-8 py-4"
                >
                  Check Fares
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-metro-600 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose NeoMetro?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the features that make our metro system the preferred choice for millions of commuters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-metro-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-metro-100 mb-8 max-w-2xl mx-auto">
            Join millions of satisfied passengers who choose NeoMetro for their daily commute
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/tickets">
              <Button size="lg" className="bg-metro-500 text-metro-600 hover:bg-gray-100 px-8 py-4">
                Book Your First Ride
              </Button>
            </Link>
            <Link to="/routes">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-metro-600 px-8 py-4"
              >
                Explore Routes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <ChatbotUI />
    </div>
  );
}
