import { useAtom } from "jotai";
import { tokenAtom } from "./authStore";
import { Navigate } from "react-router-dom";

export default function Protected({ children, role }) {
  const [token] = useAtom(tokenAtom);
  if (!token) return <Navigate to="/login" replace />;
  if (role) {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== role) return <Navigate to="/" replace />;
  }
  return children;
}
