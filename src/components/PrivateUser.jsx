import { Navigate } from "react-router-dom";

function PrivateUser({ children }) {
  // const user = useSelector((state) => state.user);
  const token = localStorage.getItem("token");
  if (token) return children;

  return <Navigate to="/" replace={true} />;
}

export default PrivateUser;
