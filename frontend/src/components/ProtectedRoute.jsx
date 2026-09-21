import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <i className="bi bi-arrow-repeat spin fs-2 text-muted-custom" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
