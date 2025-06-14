import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CreditCard, QrCode, Calendar, CheckCircle } from "lucide-react";

const Button = ({ children, className = "", variant = "primary", size = "md", loading = false, disabled, ...props }) => {
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

const Card = ({ children, className = "", ...props }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

const Input = ({ label, error, className = "", ...props }) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-metro-500 focus:border-transparent transition-all duration-200 ${error && "border-red-500 focus:ring-red-500"} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default function MetroPass() {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validPass, setValidPass] = useState(null);
  const [validLoading, setValidLoading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [generatedPass, setGeneratedPass] = useState(null);
  const [existingPass, setExistingPass] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", passType: null });
  const [generateError, setGenerateError] = useState(null);
  const [generateLoading, setGenerateLoading] = useState(false);
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

            const today = new Date();
            const validTo = new Date(response.data.validTo);
            if (today > validTo) {
              setIsExpired(true);
              setSubmitted(false); // Ensure submitted is false if expired
            } else {
              setIsExpired(false);
              setSubmitted(true); // Ensure submitted is true if valid
            }
          } else {
            setSubmitted(false); // No valid pass found
          }
          setValidLoading(false);
        } catch (err) {
          setValidLoading(false);
          console.error("Error checking metro pass:", err);
        }
      }
    }
    setValidLoading(true);
    checkMetroPass();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, passType } = formData;
    if (!name || !email || !phone || !passType) {
      setGenerateError("Please fill all fields.");
      return;
    }
    setGenerateError(null);
    setGenerateLoading(true);
    setLoading(true);
    let type = passType === 1 ? "monthly" : "quarterly";
    try {
      const response = await axios.post(
        `https://neo-metro-backend.vercel.app/api/users/${user.username}/generatemetropass`,
        { name, email, phone, passType: type }
      );
      setQrCode(response.data.qrCode);
      setSubmitted(true);
      setIsExpired(false);
      setGeneratedPass({
        qrCode: response.data.qrCode,
        validFrom: response.data.validFrom,
        validTo: response.data.validTo,
        passType: type,
      });
    } catch (err) {
      console.error("Error generating/renewing metro pass:", err);
    } finally {
      setLoading(false);
      setGenerateLoading(false);
      setFormData({ name: "", email: "", phone: "", passType: null });
      
    }
  };

  const calculateRemainingDays = (validTo) => {
    const today = new Date();
    const validToDate = new Date(validTo);
    const timeDifference = validToDate - today;
    return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  };

  const passTypes = [
    { id: 1, name: "Monthly Pass", price: 500, validity: "30 days", description: "Unlimited rides for 30 days", popular: true, type: "monthly" },
    { id: 2, name: "Quarterly Pass", price: 1400, validity: "90 days", description: "Unlimited rides for 90 days", popular: false, type: "quarterly" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {submitted && validPass ? (
          <Card className="text-center">
            <div className="py-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Metro Pass</h1>
              <p className="text-gray-600 mb-8">Details of your active metro pass are displayed below.</p>

              <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 mb-8">
                {validPass.qrCode ? (
                  <img
                    src={"data:image/png;base64," + validPass.qrCode}
                    alt="Metro Pass QR Code"
                    className="h-32 w-32 mx-auto mb-4"
                  />
                ) : (
                  <>
                    <QrCode className="h-32 w-32 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500">QR Code will be displayed here</p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-left mb-8">
                <div>
                  <p className="text-sm text-gray-500">Pass Type</p>
                  <p className="font-semibold">{validPass.passType.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valid Until</p>
                  <p className="font-semibold">{new Date(validPass.validTo).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valid From</p>
                  <p className="font-semibold">{new Date(validPass.validFrom).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold text-green-600">Active</p>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Metro Pass</h1>
              <p className="text-gray-600">Get unlimited rides with our convenient metro passes</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Pass Types */}
              <div className="lg:col-span-2">
                <Card className="mb-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Choose Your Pass Type</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {passTypes.map((pass) => (
                      <div
                        key={pass.id}
                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.passType === pass.id
                            ? "border-metro-600 bg-metro-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setFormData((prev) => ({ ...prev, passType: pass.id }))}
                      >
                        {pass.popular && (
                          <div className="absolute -top-2 left-4 bg-metro-600 text-white text-xs px-2 py-1 rounded">
                            Most Popular
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{pass.name}</h3>
                          <span className="text-2xl font-bold text-metro-600">₹{pass.price}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{pass.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          Valid for {pass.validity}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Application Form */}
                <Card>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required />
                      <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Phone Number"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {generateError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{generateError}</p>
                      </div>
                    )}

                    <Button type="submit" className="w-full" loading={generateLoading}>
                      Generate Metro Pass
                    </Button>
                  </form>
                </Card>
              </div>

              {/* Summary */}
              <div className="space-y-6">
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-3">Benefits</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Skip ticket queues
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Contactless entry with QR code
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Unlimited rides for 3 months
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Valid on all metro lines
                    </li>
                  </ul>
                </Card>
                <Card>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-metro-600" />
                      Pass Summary
                    </h3>
                  </div>
                  {formData.passType && (
                    <div className="space-y-4">
                      {(() => {
                        const selectedPass = passTypes.find((p) => p.id === formData.passType);
                        return selectedPass ? (
                          <>
                            <div className="text-center py-4 border-b">
                              <h3 className="text-lg font-semibold text-gray-900">{selectedPass.name}</h3>
                              <p className="text-3xl font-bold text-metro-600 mt-2">₹{selectedPass.price}</p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Validity</span>
                                <span className="font-medium">{selectedPass.validity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Unlimited Rides</span>
                                <span className="font-medium text-green-600">✓</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">All Lines</span>
                                <span className="font-medium text-green-600">✓</span>
                              </div>
                            </div>
                          </>
                        ) : null;
                      })()}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}