import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import { Toaster } from "react-hot-toast";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import SelectRole from "./Pages/SelectRole"
const App = () => {
const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,   // no children prop, Outlet handles it
    children: [
      { path: "/", element: <Home /> },
      { path: "/select-role", element: <SelectRole /> },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <Login /> },
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