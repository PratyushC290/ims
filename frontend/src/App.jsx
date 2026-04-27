import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import IssuedItems from "./pages/IssuedItems";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import UserAssets from "./pages/UserAssets";
import AuditLogs from "./pages/AuditLogs";
import ProtectedRoute from "./components/ProtectedRoutes";
import Register from "./pages/Register";
import StudentPortal from "./pages/StudentPortal";
import Requests from "./pages/Requests";
import NoDues from "./pages/NoDues";
import NoDuesVerifications from "./pages/NoDuesVerifications";

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/student-register" element={<StudentRegister />} />

      {/* Protected Routes - All users must be authenticated */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Layout />}>
          {/* Admin Routes */}
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="issued-items" element={<IssuedItems />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:userId" element={<UserDetail />} />
          <Route path="user-assets" element={<UserAssets />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="requests" element={<Requests />} />
          <Route path="no-dues" element={<NoDues />} />
          <Route path="no-dues-verifications" element={<NoDuesVerifications />} />
          
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