import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Pages/Login";
import Home from "./Pages/User/Home";
import { Toaster } from "react-hot-toast";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import SelectRole from "./Pages/SelectRole";
import Layout from "./components/Layout";
import Menu from "./Pages/User/Menu";
import Track from "./Pages/User/Track";
import RestaurantMenu from "./Pages/Restaurant/Menu.restaurant";
import RestaurantOrders from "./Pages/Restaurant/Orders.restaurant";
import RiderHome from "./Pages/Rider/RiderHome";
import RiderDeliveries from "./Pages/Rider/RiderDeliveries";
import Cart from "./Pages/User/Cart";
import CreateRestaurant from "./Pages/Restaurant/CreateRestaurant";
import RestaurentAnalytics from "./Pages/Restaurant/Analytics.restaurant";
import RestaurentSettings from "./Pages/Restaurant/RestaurantSettings";
import RestaurantDashboard from "./Pages/Restaurant/Dashboard.restaurant";
import { MenuProvider } from "./context/MenuProvider";
import UserSettings from "./Pages/User/UserSettings";
import UserProfile from "./Pages/User/UserProfile";
import "leaflet/dist/leaflet.css";
import OrdersPage from "./Pages/User/OrderPage";
import { OrderProvider } from "./context/OrderProvider";
import Checkout from "./Pages/User/Checkout";

const App = () => {
  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        {
          element: <ProtectedRoute />,
          children: [
            { path: "/select-role", element: <SelectRole /> },

            // ── Home — explore feed, global mode ──
            {
              path: "/",
              element: (
                <MenuProvider mode="global">
                  <Home />
                </MenuProvider>
              ),
            },

            // ── Menu — browse all restaurants, global mode ──
            {
              path: "/menu",
              element: (
                <MenuProvider mode="global">
                  <Menu />
                </MenuProvider>
              ),
            },

            {
              path: "/orders",
              element: (
                <OrderProvider>
                  <OrdersPage />
                </OrderProvider>
              ),
            },
            { path: "/track", element: <Track /> },
            {
              path: "/cart",
              element: (
                <OrderProvider>
                  <Cart />
                </OrderProvider>
              ),
            },
            { path: "/settings", element: <UserSettings /> },
            { path: "/profile", element: <UserProfile /> },

            // ── Checkout: supports both /checkout and /checkout/:orderId ──
            { path: "/checkout",           element: <Checkout /> },
            { path: "/checkout/:orderId",  element: <Checkout /> },

            // ── restaurant routes ──
            { path: "/restaurant", element: <RestaurantDashboard /> },
            {
              path: "/restaurant/menu",
              element: (
                <MenuProvider mode="owner">
                  <RestaurantMenu />
                </MenuProvider>
              ),
            },
            { path: "/restaurant/orders", element: <RestaurantOrders /> },
            { path: "/restaurant/create", element: <CreateRestaurant /> },
            { path: "/restaurant/analytics", element: <RestaurentAnalytics /> },
            { path: "/restaurant/settings", element: <RestaurentSettings /> },

            // ── rider routes ──
            { path: "/rider", element: <RiderHome /> },
            { path: "/rider/deliveries", element: <RiderDeliveries /> },
          ],
        },
        {
          element: <PublicRoute />,
          children: [{ path: "/login", element: <Login /> }],
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