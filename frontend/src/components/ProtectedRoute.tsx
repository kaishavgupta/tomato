import { use } from 'react'
import { AppContext } from '../context/AppProvider'
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const { userData, isauth, isLoading } = use(AppContext);
  const location = useLocation();

  // ✅ Show a minimal branded spinner instead of blank screen
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#FFF8F0" }}>
      <div className="flex flex-col items-center gap-3">
        <span className="text-4xl animate-bounce">🍅</span>
        <p className="text-sm font-medium" style={{ color: "#E23774", fontFamily: "'DM Sans',sans-serif" }}>
          Loading...
        </p>
      </div>
    </div>
  );

  if (!isauth) return <Navigate to="/login" replace />;

  if (userData?.role === null && location.pathname !== "/select-role")
    return <Navigate to="/select-role" replace />;

  if (userData?.role && location.pathname === "/select-role")
    return <Navigate to="/" replace />;

  return <Outlet />;
}

export default ProtectedRoute;