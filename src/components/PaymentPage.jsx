import { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addBooking } from "./features/bookingSlicer";

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' or 'upi'
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [showUpiQr, setShowUpiQr] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const booking = useSelector((state) => state.booking.booking[0]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  const simulatePayment = () => {
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        // Randomly determine success (80% chance) for demo purposes
        const isSuccess = Math.random() < 0.8;
        resolve(isSuccess);
      }, 1500);
    });
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Format card number with spaces every 4 digits
    if (name === "number") {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return;
    }
    
    // Format expiry date with slash
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
        // Validate card details
        if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
          throw new Error("Please fill all card details");
        }
        
        if (cardDetails.number.replace(/\s/g, '').length !== 16) {
          throw new Error("Please enter a valid 16-digit card number");
        }
        
        if (cardDetails.cvv.length < 3 || cardDetails.cvv.length > 4) {
          throw new Error("Please enter a valid CVV");
        }
        
        // Simulate payment processing
        const paymentSuccess = await simulatePayment();
        
        if (!paymentSuccess) {
          throw new Error("Payment failed. Please try again or use another payment method.");
        }
      }
      
      // Save booking to backend
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
    setShowUpiQr(true);
    setPaymentStatus("pending");
    
    try {
      const transactionId = generateTransactionId("upi");
      const qrCode = await getQrCode();
      
      // In a real app, you would wait for UPI payment confirmation via webhook
      // For demo, we'll simulate a successful payment after delay
      setTimeout(async () => {
        try {
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
          setTimeout(() => navigate("/ticket-confirmation"), 2000);
        } catch (e) {
          console.error(e);
          setPaymentStatus("error");
        } finally {
          setLoading(false);
        }
      }, 5000);
    } catch (e) {
      console.error(e);
      setPaymentStatus("error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Payment</h2>
          <p className="text-gray-600 mb-6">Total Amount: ₹{booking?.fare || '0'}</p>
          
          {/* Payment Method Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Choose Payment Method</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod("card")}
                className={`py-2 px-4 rounded-lg border-2 ${paymentMethod === "card" ? 
                  "border-blue-500 bg-blue-50 text-blue-600" : 
                  "border-gray-200 hover:border-gray-300"}`}
              >
                Credit/Debit Card
              </button>
              <button
                onClick={() => setPaymentMethod("upi")}
                className={`py-2 px-4 rounded-lg border-2 ${paymentMethod === "upi" ? 
                  "border-blue-500 bg-blue-50 text-blue-600" : 
                  "border-gray-200 hover:border-gray-300"}`}
              >
                UPI Payment
              </button>
            </div>
          </div>
          
          {/* Payment Form */}
          {paymentMethod === "card" ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                  placeholder="john@example.com" 
                  required 
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Card Number</label>
                <input
                  type="text"
                  name="number"
                  value={cardDetails.number}
                  onChange={handleCardInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Cardholder Name</label>
                <input
                  type="text"
                  name="name"
                  value={cardDetails.name}
                  onChange={handleCardInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Expiry Date</label>
                  <input
                    type="text"
                    name="expiry"
                    value={cardDetails.expiry}
                    onChange={handleCardInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleCardInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <input type="checkbox" id="save-card" className="mr-2" />
                <label htmlFor="save-card" className="text-sm text-gray-600">Save card for future payments</label>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : `Pay ₹${booking?.fare || '0'}`}
              </button>
              
              {paymentStatus === "success" && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Payment successful! Redirecting...
                </div>
              )}
              
              {paymentStatus === "error" && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Payment failed. Please try again.
                </div>
              )}
            </form>
          ) : (
            <div className="text-center">
              {!showUpiQr ? (
                <>
                  <div className="mb-6">
                    <p className="text-gray-600 mb-4">Pay via any UPI app like Google Pay, PhonePe, Paytm, etc.</p>
                    <button
                      onClick={handleUpiPayment}
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg text-lg font-semibold shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? "Generating UPI QR..." : "Show UPI QR Code"}
                    </button>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-gray-600 mb-2">Or enter UPI ID manually</p>
                    <div className="flex">
                      <input
                        type="text"
                        className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="yourname@upi"
                      />
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg">
                        Pay
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block mx-auto">
                    <img 
                      src={`https://neo-metro-flask.vercel.app/qrcode/upi?amount=${booking?.fare}&txnId=${generateTransactionId("upi")}`} 
                      alt="UPI QR Code" 
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p className="text-gray-600">Scan this QR code with any UPI app to complete payment</p>
                  
                  {paymentStatus === "pending" && (
                    <div className="mt-4 p-3 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Waiting for payment confirmation...
                    </div>
                  )}
                  
                  {paymentStatus === "success" && (
                    <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Payment successful! Redirecting...
                    </div>
                  )}
                  
                  <button
                    onClick={() => setShowUpiQr(false)}
                    className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ← Back to payment options
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4">
              <img src="https://via.placeholder.com/40x25?text=VISA" alt="Visa" className="h-6" />
              <img src="https://via.placeholder.com/40x25?text=MC" alt="Mastercard" className="h-6" />
              <img src="https://via.placeholder.com/40x25?text=Rupay" alt="Rupay" className="h-6" />
              <img src="https://via.placeholder.com/40x25?text=UPI" alt="UPI" className="h-6" />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Your payment is secured with 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}