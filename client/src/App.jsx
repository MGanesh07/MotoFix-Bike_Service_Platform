import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './contexts/AuthContext';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import MechanicLayout from './layouts/MechanicLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages - Auth
import Login from './pages/Login';
import Register from './pages/Register';

// Pages - Customer
import CustomerHome from './pages/customer/CustomerHome';
import MyBikes from './pages/customer/MyBikes';
import BookService from './pages/customer/BookService';
import MyBookings from './pages/customer/MyBookings';
import Notifications from './pages/customer/Notifications';

// Pages - Mechanic
import MechanicDashboard from './pages/mechanic/MechanicDashboard';
import MechanicSchedule from './pages/mechanic/MechanicSchedule';
import ActiveRepairs from './pages/mechanic/ActiveRepairs';
import MechanicInventory from './pages/mechanic/MechanicInventory';
import MechanicHistory from './pages/mechanic/MechanicHistory';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'mechanic' ? '/mechanic' : '/'} replace />;
  }

  return children;
};

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={user ? <Navigate to={user.role === 'mechanic' ? '/mechanic' : '/'} replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      </Route>

      {/* Customer Routes */}
      <Route path="/" element={<ProtectedRoute allowedRole="customer"><CustomerLayout /></ProtectedRoute>}>
        <Route index element={<CustomerHome />} />
        <Route path="bikes" element={<MyBikes />} />
        <Route path="book" element={<BookService />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Mechanic Routes */}
      <Route path="/mechanic" element={<ProtectedRoute allowedRole="mechanic"><MechanicLayout /></ProtectedRoute>}>
        <Route index element={<MechanicDashboard />} />
        <Route path="schedule" element={<MechanicSchedule />} />
        <Route path="active-repairs" element={<ActiveRepairs />} />
        <Route path="inventory" element={<MechanicInventory />} />
        <Route path="history" element={<MechanicHistory />} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
