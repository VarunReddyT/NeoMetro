import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

export default function ProfilePage() {
  const [userDetails, setUserDetails] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(5);
  const [selectedQrCode, setSelectedQrCode] = useState(null);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    async function fetchData() {
      try {
        const userResponse = await axios.get(`https://neo-metro-backend.vercel.app/api/users/getuser?username=${user.username}`);
        setUserDetails(userResponse.data);

        const ticketsResponse = await axios.get(`https://neo-metro-backend.vercel.app/api/tickets/getticket?username=${user.username}`);
        setTickets(ticketsResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user.username]);

  const isTicketExpired = (journeyDate) => {
    const today = new Date();
    const journeyDateObj = new Date(journeyDate);
    const timeDifference = today - journeyDateObj;
    return timeDifference > 24 * 60 * 60 * 1000;
  };

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openQrModal = (qrCode) => {
    setSelectedQrCode(qrCode);
  };

  const closeQrModal = () => {
    setSelectedQrCode(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto flex gap-6">
        {/* User Details Section (Left Side - 1/3 width) */}
        <div className="w-1/3 bg-white shadow-lg rounded-lg p-6 h-min">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">User Details</h2>
          {userDetails && (
            <div className="space-y-4">
              <p className="text-lg font-medium">Name: {userDetails.name}</p>
              <p className="text-lg font-medium">Username: {userDetails.username}</p>
              <p className="text-lg font-medium">Email: {userDetails.gmail}</p>
              <p className="text-lg font-medium">Mobile Number: {userDetails.mobilenumber}</p>
            </div>
          )}
        </div>

        {/* Bookings Section (Right Side - 2/3 width) */}
        <div className="w-2/3 bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Your Bookings</h2>
          {currentTickets.length > 0 ? (
            currentTickets.map((ticket, index) => {
              const isExpired = isTicketExpired(ticket.journeyDate);
              return (
                <div key={index} className="border-b border-gray-200 py-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex-1">
                      <p className="text-lg font-medium">From: {ticket.source}</p>
                      <p className="text-lg font-medium">To: {ticket.destination}</p>
                      <p className="text-lg font-medium">Fare: ₹{ticket.fare}</p>
                      <p className="text-lg font-medium">Journey Date: {new Date(ticket.journeyDate).toLocaleDateString()}</p>
                      <p className="text-lg font-medium">Transaction ID: {ticket.transactionId}</p>
                    </div>
                    <div className="relative mt-4 md:mt-0">
                      {isExpired ? (
                        <div className="relative">
                          <img
                            src={`data:image/png;base64,${ticket.qrCode}`}
                            alt="QR Code"
                            className="w-40 h-40 rounded-lg object-cover blur-sm"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-red-600 font-bold text-lg">Expired</p>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={`data:image/png;base64,${ticket.qrCode}`}
                          alt="QR Code"
                          className="w-40 h-40 rounded-lg object-cover cursor-pointer"
                          onClick={() => openQrModal(ticket.qrCode)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-lg text-gray-600">No bookings found.</p>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            {Array.from({ length: Math.ceil(tickets.length / ticketsPerPage) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`mx-1 px-4 py-2 rounded-lg ${
                  currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {selectedQrCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <img
              src={`data:image/png;base64,${selectedQrCode}`}
              alt="QR Code"
              className="w-64 h-64 rounded-lg object-cover"
            />
            <button
              onClick={closeQrModal}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}