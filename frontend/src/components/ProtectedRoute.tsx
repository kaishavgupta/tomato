import { use } from 'react'
import { AppContext } from '../types/user.type'
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useRestaurant } from '../Hooks/useRestaurant';

const ProtectedRoute = () => {
  const { userData, isauth, isLoading } = use(AppContext);

  // ✅ FIX: was `useRestaurant` (missing parentheses — hook was never called)
  // ✅ FIX: use isRestaurantExist (the correct context value name)
  const { isRestaurantExist, isLoading: isRestaurantLoading } = useRestaurant();

  const role = userData?.role;
  const location = useLocation();

  const RESTAURANT_PATHS = ["/restaurant", "/restaurant/menu", "/restaurant/orders"];
  const CREATE_PATH      = "/restaurant/create";
  const USER_PATHS       = ["/", "/menu", "/orders", "/track", "/cart"];
  const RIDER_PATHS      = ["/rider", "/rider/deliveries"];

  // ── loading guard ──────────────────────────────────────────────────────
  // Wait for both user AND restaurant data before making routing decisions.
  // Without this, isRestaurantExist is undefined on first render and causes
  // a flash-redirect to /restaurant/create even for existing restaurants.
  if (isLoading || (role === "restaurant" && isRestaurantLoading)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#FFF8F0" }}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl animate-bounce">🍅</span>
          <p
            className="text-sm font-medium"
            style={{ color: "#E23774", fontFamily: "'DM Sans',sans-serif" }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // ── not logged in ──────────────────────────────────────────────────────
  if (!isauth) return <Navigate to="/login" replace />;

  // ── no role yet ────────────────────────────────────────────────────────
  // Logged in but role not selected → force to select-role
  if (userData?.role === null && location.pathname !== "/select-role")
    return <Navigate to="/select-role" replace />;

  // Already has a role → don't let them back to select-role
  if (userData?.role && location.pathname === "/select-role")
    return <Navigate to={roleHome(role)} replace />;

  // ── restaurant role ────────────────────────────────────────────────────
  if (role === "restaurant") {

    // Block user + rider routes entirely
    if ([...USER_PATHS, ...RIDER_PATHS].includes(location.pathname))
      return <Navigate to={isRestaurantExist ? "/restaurant" : CREATE_PATH} replace />;

    if (!isRestaurantExist) {
      // No restaurant yet → only /restaurant/create is allowed
      // Trying to hit any other restaurant route → redirect to create
      if (location.pathname !== CREATE_PATH)
        return <Navigate to={CREATE_PATH} replace />;
    } else {
      // Restaurant exists → block /restaurant/create (nothing to create)
      if (location.pathname === CREATE_PATH)
        return <Navigate to="/restaurant" replace />;
    }
  }

  // ── user role ──────────────────────────────────────────────────────────
  if (role === "user" && [...RESTAURANT_PATHS, CREATE_PATH, ...RIDER_PATHS].includes(location.pathname))
    return <Navigate to="/" replace />;

  // ── rider role ─────────────────────────────────────────────────────────
  if (role === "rider" && [...USER_PATHS, ...RESTAURANT_PATHS, CREATE_PATH].includes(location.pathname))
    return <Navigate to="/rider" replace />;

  return <Outlet />;
};

export const roleHome = (role?: string | null) => {
  if (role === "restaurant") return "/restaurant";
  if (role === "rider")      return "/rider";
  return "/";
};

export default ProtectedRoute;