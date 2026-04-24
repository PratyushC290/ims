import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // Check if the user has a token
  const isAuthenticated = localStorage.getItem("token") !== null;

  // If they have a token, render the nested routes (<Outlet />).
  // If not, instantly redirect them to the login page.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
