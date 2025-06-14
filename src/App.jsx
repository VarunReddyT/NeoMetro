import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
// import Navbar from "./components/Navbar";
import Navbar from "./components/layout/Navbar";
import Fares from "./pages/Fares";
import MetroPass from "./pages/MetroPass";
import Login from "./components/Login";
import Register from "./components/Register";
import Compare from "./pages/Compare";
import Tickets from "./pages/Tickets";
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentPage from "./pages/PaymentPage";
import TicketConfirmation from "./pages/TicketConfirmation";
import Profile from "./pages/Profile";
import NotFound from "./components/NotFound";
import { Footer } from "./components/layout/Footer";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/fares' element={<Fares />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/compare' element={<Compare />} />
        <Route path='/*' element={<NotFound />} />
        <Route path='/metro-pass' element={
          <ProtectedRoute>
            <MetroPass />
          </ProtectedRoute>
        } />
        <Route path='/tickets' element={
          <ProtectedRoute>
            <Tickets />
          </ProtectedRoute>
        } />
        <Route path='/payment' element={
          <ProtectedRoute>
              <PaymentPage />
          </ProtectedRoute>
        } />
        <Route path='/ticket-confirmation' element={
          <ProtectedRoute>
            <TicketConfirmation />
          </ProtectedRoute>
        } />
        <Route path='/profile' element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

      </Routes>
      <Footer />
    </Router>
  );
}

export default App;