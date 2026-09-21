import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = params.get("token");
    if (!token) {
      navigate("/login?error=token", { replace: true });
      return;
    }

    loginWithToken(token).then(() => navigate("/dashboard", { replace: true }));
  }, []);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center gap-3" style={{ minHeight: "100vh" }}>
      <i className="bi bi-arrow-repeat spin fs-1" style={{ color: "var(--accent)" }} />
      <p className="text-muted-custom">Confirmando tu sesión...</p>
    </div>
  );
}
