import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import { Toaster } from "react-hot-toast";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import SelectRole from "./Pages/SelectRole"
import Layout from "./components/Layout";
import Menu from "./Pages/Menu";
import Track from "./Pages/Track";
import Order from "./Pages/Order";
const App = () => {
const router = createBrowserRouter([
  {
    element: <Layout />,           // ✅ Navbar always visible
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/", element: <Home /> },
          { path: "/select-role", element: <SelectRole /> },
          {path:"/track",element:<Track/>},
          {path:"/orders",element:<Order/>},
          {path:"/cart",element:<Order/>}
        ],
      },
      {
          path:"/menu",element:<Menu/>,
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