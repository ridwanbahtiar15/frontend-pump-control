import { createBrowserRouter } from "react-router-dom";

import Login from "./Login";
import Dashboard from "./Dashboard";
import PrivateAuth from "./components/PrivateAuth";
import PrivateUser from "./components/PrivateUser";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateAuth>
        <Login />
      </PrivateAuth>
    ),
    // errorElement: "",
  },
  {
    path: "/dashboard",
    element: (
      <PrivateUser>
        <Dashboard />
      </PrivateUser>
    ),
    // errorElement: "",
  },
]);

export default router;
