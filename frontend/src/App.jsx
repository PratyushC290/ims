import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import ProtectedRoute from "./components/ProtectedRoutes";
import Register from "./pages/Register";

const App = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* 2. Wrap all secure routes inside the ProtectedRoute */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:userId" element={<UserDetail />} />
        </Route>
      </Route>

      {/* 3. The Smart Catch-All */}
      {/* Because the secure routes are protected above, if someone types a random URL, 
          we can safely send them to /dashboard. 
          If they are logged in, they will go to the dashboard. 
          If they are NOT logged in, the ProtectedRoute will intercept them and kick them to /login! */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
