import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import Contact from "./pages/Contact/Contact";
import ExploreBooks from "./pages/ExploreBooks/ExploreBooks";
import ReserveBooks from "./pages/ReserveBook/ReserveBooks";
import ManageUsers from "./pages/ManageUsers/ManageUsers";
import ManageNotificationes from "./pages/Notifications/ManageNotifications";

// Protected Route Component
const ProtectedRoute = ({ element: Component }) => {
  const token = localStorage.getItem("token");
  return token ? <Component /> : <Login />;
};

// Main Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={<ProtectedRoute element={Dashboard} />}
      />
      <Route 
        path="/profile" 
        element={<ProtectedRoute element={Profile} />}
      />
      <Route 
        path="/contact" 
        element={<ProtectedRoute element={Contact} />}
      />
      <Route 
        path="/explore" 
        element={<ProtectedRoute element={ExploreBooks} />}
      />
      <Route 
        path="/reserve" 
        element={<ProtectedRoute element={ReserveBooks} />}
      />
      <Route 
        path="/usuarios" 
        element={<ProtectedRoute element={ManageUsers} />}
      />
      <Route 
        path="/notificaciones" 
        element={<ProtectedRoute element={ManageNotificationes} />}
      />
    </Routes>
  );
};

export default AppRoutes;