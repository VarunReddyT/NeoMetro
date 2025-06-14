import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

export default function ProfilePage() {
  const [userDetails, setUserDetails] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const [ticketsPerPage] = useState(5);
  const [selectedQrCode, setSelectedQrCode] = useState(null);
  const [activeTab, setActiveTab] = useState("active"); // 'active' or 'past'
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userResponse, ticketsResponse] = await Promise.all([
          axios.get(`https://neo-metro-backend.vercel.app/api/users/getuser?username=${user.username}`),
          axios.get(`https://neo-metro-backend.vercel.app/api/tickets/getticket?username=${user.username}`)
        ]);
        setUserDetails(userResponse.data);
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
    const endOfJourneyDay = new Date(journeyDateObj);
    endOfJourneyDay.setHours(23, 59, 59, 999);
    return today > endOfJourneyDay;
  };

  // Separate tickets
  const activeTickets = tickets.filter(ticket => !isTicketExpired(ticket.journeyDate));
  const pastTickets = tickets.filter(ticket => isTicketExpired(ticket.journeyDate));

  // Pagination logic
  const getCurrentTickets = () => {
    if (activeTab === "active") {
      const lastIndex = activePage * ticketsPerPage;
      const firstIndex = lastIndex - ticketsPerPage;
      return activeTickets.slice(firstIndex, lastIndex);
    } else {
      const lastIndex = pastPage * ticketsPerPage;
      const firstIndex = lastIndex - ticketsPerPage;
      return pastTickets.slice(firstIndex, lastIndex);
    }
  };

  const openQrModal = (qrCode) => {
    setSelectedQrCode(qrCode);
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
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* User Profile Section */}
        <div className="lg:w-1/3 bg-white shadow-lg rounded-xl p-6 h-min sticky top-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-2xl font-bold">
                {userDetails?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{userDetails?.name || 'User'}</h2>
              <p className="text-gray-500">@{userDetails?.username || 'username'}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{userDetails?.gmail || 'user@example.com'}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{userDetails?.mobilenumber || '+91 XXXXX XXXXX'}</span>
            </div>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="lg:w-2/3 bg-white shadow-lg rounded-xl p-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('active')}
            >
              Active Tickets
              {activeTickets.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {activeTickets.length}
                </span>
              )}
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === 'past' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('past')}
            >
              Past Tickets
              {pastTickets.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {pastTickets.length}
                </span>
              )}
            </button>
          </div>

          {/* Tickets List */}
          {getCurrentTickets().length > 0 ? (
            <div className="space-y-4">
              {getCurrentTickets().map((ticket, index) => (
                <div key={index} className={`border rounded-lg p-4 ${activeTab === 'past' ? 'opacity-80 border-gray-200' : 'border-blue-100 bg-blue-50'}`}>
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${activeTab === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        <p className="font-medium">
                          {activeTab === 'active' 
                            ? `Valid until ${new Date(ticket.journeyDate).toLocaleDateString()}`
                            : `Expired on ${new Date(ticket.journeyDate).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-500">From</p>
                          <p className="font-medium">{ticket.source}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">To</p>
                          <p className="font-medium">{ticket.destination}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fare</p>
                          <p className="font-medium">₹{ticket.fare}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Transaction ID</p>
                          <p className="font-medium text-sm">{ticket.transactionId}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex md:flex-col items-center md:items-end space-x-4 md:space-x-0 md:space-y-2">
                      {activeTab === 'past' ? (
                        <div className="relative">
                          <img
                            src={`data:image/png;base64,${ticket.qrCode}`}
                            alt="QR Code"
                            className="w-24 h-24 rounded-lg object-cover blur-sm"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                              Expired
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <img
                            src={`data:image/png;base64,${ticket.qrCode}`}
                            alt="QR Code"
                            className="w-24 h-24 rounded-lg object-cover cursor-pointer hover:shadow-md"
                            onClick={() => openQrModal(ticket.qrCode)}
                          />
                          <button 
                            className="text-blue-600 text-sm font-medium hover:underline"
                            onClick={() => openQrModal(ticket.qrCode)}
                          >
                            View QR
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {activeTab === 'active' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <p className="mt-3 text-gray-600">
                {activeTab === 'active' ? 'No active bookings found' : 'No past bookings found'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {(activeTab === 'active' ? activeTickets.length : pastTickets.length) > ticketsPerPage && (
            <div className="flex justify-center mt-6">
              {Array.from({ 
                length: Math.ceil(
                  (activeTab === 'active' ? activeTickets.length : pastTickets.length) / ticketsPerPage
                ) 
              }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => activeTab === 'active' ? setActivePage(i + 1) : setPastPage(i + 1)}
                  className={`mx-1 px-4 py-2 rounded-lg transition-colors ${
                    (activeTab === 'active' ? activePage : pastPage) === i + 1 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {selectedQrCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Ticket QR Code</h3>
              <button 
                onClick={() => setSelectedQrCode(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <img
              src={`data:image/png;base64,${selectedQrCode}`}
              alt="QR Code"
              className="w-full rounded-lg border border-gray-200"
            />
            <button
              onClick={() => setSelectedQrCode(null)}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}