import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Fares from "./components/Fares";
import MetroPass from "./components/MetroPass";
import Login from "./components/Login";
import Register from "./components/Register";
import Compare from "./components/Compare";
import Tickets from "./components/Tickets";
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentPage from "./components/PaymentPage";
import TicketConfirmation from "./components/TicketConfirmation";
import Profile from "./components/Profile";
import NotFound from "./components/NotFound";

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
    </Router>
  );
}

export default App;