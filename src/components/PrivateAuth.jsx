import { Navigate } from "react-router-dom";

function PrivateAuth({ children }) {
  // const user = useSelector((state) => state.user);
  const token = localStorage.getItem("token");
  if (!token) return children;

  return <Navigate to="/dashboard" replace={true} />;
}

export default PrivateAuth;
