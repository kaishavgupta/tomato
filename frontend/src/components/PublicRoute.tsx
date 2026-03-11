import { use } from "react"
import { AppContext } from "../context/AppProvider"
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const { isauth, isLoading } = use(AppContext);

  // ✅ Show spinner instead of blank screen
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

  return isauth ? <Navigate to="/" replace /> : <Outlet />;
}

export default PublicRoute;