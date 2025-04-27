import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addBooking } from "./features/bookingSlicer";
import { motion, AnimatePresence } from "framer-motion";

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null);
  const booking = useSelector((state) => state.booking.booking[0]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [upiQrCode, setUpiQrCode] = useState("");
  const [upiLoading, setUpiLoading] = useState(false);

  const generateTransactionId = (paymentMode) => {
    const timestamp = new Date().toISOString().replace(/^20/, '').replace(/[:-]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const randomComponent = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${paymentMode.substring(0, 3).toUpperCase()}${timestamp}${randomComponent}`;
  };

  const getQrCode = async () => {
    try {
      const qrResponse = await axios.get('https://neo-metro-flask.vercel.app/qrcode/ticket', {
        params: {
          start: booking.source,
          end: booking.destination,
        }
      });
      setQrCode(qrResponse.data.qrcode);
      return qrResponse.data.qrcode; 
    } catch (e) {
      console.error(e);
      return null; 
    }
  };

  const getUpiQrCode = async () => {
    try {
      setUpiLoading(true);
      const response = await axios.get('https://neo-metro-flask.vercel.app/qrcode/gpay');
      setUpiQrCode(response.data.qrcode);
    } catch (error) {
      console.error("Error fetching UPI QR code:", error);
      alert("Failed to generate UPI QR code. Please try again.");
    } finally {
      setUpiLoading(false);
    }
  };

  useEffect(() => {
    if (paymentMethod === "upi") {
      getUpiQrCode();
    }
  }, [paymentMethod]);

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === "number") {
      formattedValue = value.replace(/\D/g, '');
    
      formattedValue = formattedValue.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    
      if (formattedValue.length > 19) return;
    }
    
    if (name === "expiry") {
      formattedValue = value.replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .substring(0, 5);
    }
    
    setCardDetails(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPaymentStatus(null);

    const transactionId = generateTransactionId(paymentMethod);
    const qrCode = await getQrCode();
    
    try {
      if (paymentMethod === "card") {
        if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
          throw new Error("Please fill all card details");
        }
        
        if (cardDetails.number.replace(/\s/g, '').length !== 16) {
          throw new Error("Please enter a valid 16-digit card number");
        }
        
        if (cardDetails.cvv.length < 3 || cardDetails.cvv.length > 4) {
          throw new Error("Please enter a valid CVV");
        }
      }
      
      await axios.post('https://neo-metro-backend.vercel.app/api/tickets/bookedticket', {
        username: booking.username,
        source: booking.source,
        destination: booking.destination,
        tickets: booking.tickets,
        fare: booking.fare,
        distance: booking.distance,
        transactionId: transactionId,
        paymentMode: paymentMethod,
        qrCode: qrCode,
        journeyDate: booking.journeyDate
      });
      
      dispatch(addBooking({ qrCode: qrCode, transactionId: transactionId }));
      setPaymentStatus("success");
      setTimeout(() => navigate("/ticket-confirmation"), 2000);
    } catch (error) {
      console.error(error);
      setPaymentStatus("error");
      alert(error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpiPayment = async () => {
    setLoading(true);
    setPaymentStatus("pending");
    
    try {
      const transactionId = generateTransactionId("upi");
      const qrCode = await getQrCode();
      
      await axios.post('https://neo-metro-backend.vercel.app/api/tickets/bookedticket', {
        username: booking.username,
        source: booking.source,
        destination: booking.destination,
        tickets: booking.tickets,
        fare: booking.fare,
        distance: booking.distance,
        transactionId: transactionId,
        paymentMode: "upi",
        qrCode: qrCode,
        journeyDate: booking.journeyDate
      });
      
      dispatch(addBooking({ qrCode: qrCode, transactionId: transactionId }));
      setPaymentStatus("success");
      setTimeout(() => navigate("/ticket-confirmation"), 1000);
    } catch (e) {
      console.error(e);
      setPaymentStatus("error");
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="bg-red-600 text-white text-center py-2 px-4 text-xs sm:text-sm font-semibold rounded-lg mx-auto my-3 w-full max-w-md">
        This website is a development project and is not affiliated with Hyderabad Metro Rail. Do not use it for real bookings.
      </div>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-t-2xl text-white">
          <h2 className="text-2xl font-bold mb-1">Complete Your Payment</h2>
          <p className="opacity-90">Secure and fast payment processing</p>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm opacity-80">Total Amount</span>
            <span className="text-2xl font-bold">₹{booking.fare}</span>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="bg-white shadow-lg rounded-b-2xl overflow-hidden">
          {/* Payment Method Selection */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Payment Method</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setPaymentMethod("card")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${paymentMethod === "card" ? 
                  "border-blue-500 bg-blue-50 text-blue-600 shadow-sm" : 
                  "border-gray-200 hover:border-gray-300 bg-white"}`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Credit/Debit Card</span>
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod("upi")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${paymentMethod === "upi" ? 
                  "border-blue-500 bg-blue-50 text-blue-600 shadow-sm" : 
                  "border-gray-200 hover:border-gray-300 bg-white"}`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>UPI Payment</span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Payment Form */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {paymentMethod === "card" ? (
                <motion.form
                  key="card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col md:flex-row gap-8"
                >
                  {/* Card Display (Left Side) */}
                  <div className="md:w-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-xl text-white h-56">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm opacity-80">Card Number</p>
                          <p className="text-xl font-medium tracking-wider mt-1">
                            {cardDetails.number || "•••• •••• •••• ••••"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm opacity-80">Expires</p>
                          <p className="font-medium">
                            {cardDetails.expiry || "••/••"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-8">
                        <p className="text-sm opacity-80">Cardholder Name</p>
                        <p className="text-lg font-medium truncate">
                          {cardDetails.name || "YOUR NAME"}
                        </p>
                      </div>
                      <div className="absolute bottom-6 right-6 text-right">
                        <p className="text-xs opacity-80">CVV</p>
                        <p className="font-medium">
                          {cardDetails.cvv ? "•••" : "•••"}
                        </p>
                      </div>
                      <div className="absolute top-6 right-6 text-right">
                        <p className="text-xs font-bold">VISA</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Form (Right Side) */}
                  <div className="md:w-1/2 space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Card Number</label>
                      <input
                        type="text"
                        name="number"
                        value={cardDetails.number}
                        onChange={handleCardInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        onWheel={(e) => e.target.blur()} 
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        name="name"
                        value={cardDetails.name}
                        onChange={handleCardInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Expiry Date</label>
                        <input
                          type="text"
                          name="expiry"
                          value={cardDetails.expiry}
                          onChange={handleCardInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          placeholder="MM/YY"
                          maxLength="5"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">CVV</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-10"
                            placeholder="•••"
                            maxLength="4"
                            required
                          />
                          <div className="absolute right-3 top-3 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Email Receipt</label>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                        placeholder="john@example.com" 
                        required 
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-3 rounded-lg text-lg font-semibold shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          Pay ₹{booking?.fare || '0'}
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="upi"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* UPI Instructions (Left Side) */}
                    <div className="md:w-1/2">
                      <h3 className="text-lg font-medium text-gray-700 mb-4">Pay with UPI</h3>
                      <ol className="list-decimal list-inside space-y-3 text-gray-600">
                        <li>Open any UPI app on your phone</li>
                        <li>Tap on 'Scan QR Code'</li>
                        <li>Point your camera at the QR code</li>
                        <li>Confirm the payment amount</li>
                        <li>Enter your UPI PIN to complete payment</li>
                      </ol>

                      <button
                        onClick={handleUpiPayment}
                        disabled={loading || upiLoading}
                        className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-3 rounded-lg text-lg font-semibold shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          "Confirm UPI Payment"
                        )}
                      </button>
                    </div>
                    
                    {/* QR Code (Right Side) */}
                    <div className="md:w-1/2 flex flex-col items-center">
                      {upiLoading ? (
                        <div className="w-48 h-48 flex items-center justify-center">
                          <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : (
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
                          <div className="relative">
                            <img 
                              src={'data:image/png;base64,' + (upiQrCode || '')}
                              alt="UPI QR Code" 
                              className="w-48 h-48"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 bg-blue-50 p-3 rounded-lg text-center">
                            <p className="text-sm font-medium text-blue-700">Amount: ₹{booking?.fare || '0'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-center space-x-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/d1/RuPay.svg" alt="Rupay" className="h-6" />
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Your payment is secured with 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
}