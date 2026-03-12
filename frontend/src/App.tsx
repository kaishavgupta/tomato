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
import Restaurant from "./Pages/Restaurant/Restaurant";
import RestaurantMenu from "./Pages/Restaurant/RestaurantMenu";
import RestaurantOrders from "./Pages/Restaurant/RestaurantOrders";
import RiderHome from "./Pages/Rider/RiderHome";
import RiderDeliveries from "./Pages/Rider/RiderDeliveries";
import Cart from "./Pages/User/Cart";
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
          { path: "/restaurant",         element: <Restaurant /> },
          { path: "/restaurant/menu",    element: <RestaurantMenu /> },
          { path: "/restaurant/orders",  element: <RestaurantOrders /> },

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