import { use } from 'react'
import { AppContext } from '../types/user.type'
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const { userData, isauth, isLoading } = use(AppContext);
  const role = userData?.role;

  const location = useLocation();
  const RESTAURANT_PATHS = ["/restaurant", "/restaurant/menu", "/restaurant/orders"];
  const USER_PATHS       = ["/", "/menu", "/orders", "/track", "/cart"];
  const RIDER_PATHS      = ["/rider", "/rider/deliveries"];
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

  // Not Login
  if (!isauth) return <Navigate to="/login" replace />;

  // login but no role and not at select-role page redirects to select-role
  if (userData?.role === null && location.pathname !== "/select-role")
    return <Navigate to="/select-role" replace />;

  // if role selected and yet at select-role redirects to login page
  if (userData?.role && location.pathname === "/select-role")
    return <Navigate to={roleHome(role)} replace />;

  // if role is restaurant redirects to restaurant routes only
   if (role === "restaurant" && [...USER_PATHS,...RIDER_PATHS].includes(location.pathname))
    return <Navigate to="/restaurant" replace />;

   // If trying to access restaurant pages → redirect to user home
  if (role === "user" && [...RESTAURANT_PATHS,...RIDER_PATHS].includes(location.pathname))
    return <Navigate to="/" replace />;

  // if rider trying to access wrong pages
  if (role === "rider" && [...USER_PATHS, ...RESTAURANT_PATHS].includes(location.pathname))
    return <Navigate to="/rider" replace />;

  return <Outlet />;
}

export const roleHome = (role: string) => {
  if (role === "restaurant") return "/restaurant"; 
  if (role === "rider")     return "/rider";
  return "/";  // user
}

export default ProtectedRoute;