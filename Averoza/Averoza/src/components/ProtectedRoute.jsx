import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({
  children,
  requireAuth = true,
  allowedRoles = [],
}) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !user) {
    // Store the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but doesn't have required role
  if (requireAuth && user && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user?.role)) {
      return <Navigate to="/" replace />;
    }
  }

  // If authentication is not required or user is authenticated, allow access
  return children;
};

export default ProtectedRoute;
