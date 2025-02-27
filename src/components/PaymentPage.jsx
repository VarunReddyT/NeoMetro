import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const booking = useSelector((state) => state.booking.booking[0]);
  const navigate = useNavigate();

  const generateTransactionId = (paymentMode) => {
    const timestamp = new Date().toISOString().replace(/^20/, '').replace(/[:-]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const randomComponent = Math.random().toString(36).substring(2, 6).toUpperCase();
    const result = `${paymentMode.substring(0, 3).toUpperCase()}${timestamp}${randomComponent}`;
    return result;
  };

  const getQrCode = async () => {
    try{
      const qrResponse = await axios.get('https://neo-metro-flask.vercel.app/qrcode/ticket', {
        params: {
          start: booking.source,
          end: booking.destination,
        }
      });
      setQrCode(qrResponse.data.qrcode);
    }
    catch(e){
      console.error(e);
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const transactionId = generateTransactionId("card");
    await getQrCode();

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
      billing_details: { email },
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      console.log("PaymentMethod:", paymentMethod);
      try{
        await axios.post('https://neo-metro-backend.vercel.app/api/tickets/bookedticket', {
          username: booking.username,
          source: booking.source,
          destination: booking.destination,
          tickets: booking.tickets,
          fare: booking.fare,
          distance: booking.distance,
          transactionId: transactionId,
          paymentMode: "card",
          qrCode: qrCode,
          journeyDate: booking.journeyDate
        });
        navigate("/");
      }
      catch(e){
        console.error(e);
      }
    }
  };

  return (
    <div className="mt-10 flex items-center justify-center">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Secure Payment</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-600 text-sm mb-2">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="john@example.com" required />
          </div>
          <div className="mb-4 p-3 border rounded-lg">
            <CardElement />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold shadow-md transition" disabled={!stripe || loading}>
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </form>
      </div>
    </div>
  );
}
