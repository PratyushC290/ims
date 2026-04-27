import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import StudentLogin from "./pages/StudentLogin";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import AuditLogs from "./pages/AuditLogs";
import ProtectedRoute from "./components/ProtectedRoutes";
import Register from "./pages/Register";
import StudentPortal from "./pages/StudentPortal";
import Requests from "./pages/Requests";
import NoDues from "./pages/NoDues";

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/student-login" element={<StudentLogin />} />

      {/* Protected Routes - All users must be authenticated */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Layout />}>
          {/* Admin Routes */}
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:userId" element={<UserDetail />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="requests" element={<Requests />} />
          <Route path="no-dues" element={<NoDues />} />
          
          {/* Student Route */}
          <Route path="my-portal" element={<StudentPortal />} />
        </Route>
      </Route>

      {/* Catch-All */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;