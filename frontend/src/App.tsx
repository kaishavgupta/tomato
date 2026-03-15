import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Pages/Login";
import Home from "./Pages/User/Home";
import { Toaster } from "react-hot-toast";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import SelectRole from "./Pages/SelectRole"
import Layout from "./components/Layout";
import Menu from "./Pages/User/Menu";
import Track from "./Pages/User/Track";
import Order from "./Pages/User/Order";
import RestaurantMenu from "./Pages/Restaurant/Menu.restaurant";
import RestaurantOrders from "./Pages/Restaurant/Orders.restaurant";
import RiderHome from "./Pages/Rider/RiderHome";
import RiderDeliveries from "./Pages/Rider/RiderDeliveries";
import Cart from "./Pages/User/Cart";
import CreateRestaurant from "./Pages/Restaurant/CreateRestaurant";
import RestaurentAnalytics from "./Pages/Restaurant/Analytics.restaurant";
import RestaurentSettings from "./Pages/Restaurant/Settings.restaurant";
import RestaurantDashboard from "./Pages/Restaurant/Dashboard.restaurant";
const App = () => {
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [

          // ── role selection (all authenticated users) ──
          { path: "/select-role", element: <SelectRole /> },

          // ── user routes ──
          { path: "/",        element: <Home /> },
          { path: "/menu",    element: <Menu /> },
          { path: "/orders",  element: <Order /> },
          { path: "/track",   element: <Track /> },
          { path: "/cart",    element: <Cart /> },

          // ── restaurant routes ──
          { path: "/restaurant",         element: <RestaurantDashboard /> },
          { path: "/restaurant/menu",    element: <RestaurantMenu /> },
          { path: "/restaurant/orders",  element: <RestaurantOrders /> },
          { path: "/restaurant/create",  element: <CreateRestaurant /> },
          { path: "/restaurant/analytics",  element: <RestaurentAnalytics /> },
          { path: "/restaurant/settings",  element: <RestaurentSettings /> },

          // ── rider routes ──
          { path: "/rider",              element: <RiderHome /> },
          { path: "/rider/deliveries",   element: <RiderDeliveries /> },

        ],
      },
      {
        element: <PublicRoute />,
        children: [
          { path: "/login", element: <Login /> },
        ],
      },
    ],
  },
]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
};

export default App;