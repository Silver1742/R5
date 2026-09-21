import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

// Discord se saca de la lista por ahora (se va a habilitar más adelante).
// El backend ya tiene la estrategia y las rutas listas: alcanza con volver a
// agregar el objeto de abajo cuando se carguen las credenciales en .env.
// { id: "discord", label: "Continuar con Discord", icon: "bi-discord", className: "provider-discord" },
const PROVIDERS = [
  { id: "google", label: "Continuar con Google", icon: "bi-google", className: "provider-google" },
  { id: "github", label: "Continuar con GitHub", icon: "bi-github", className: "provider-github" },
];

export default function Login() {
  const { user, loading, loginWithProvider } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [params] = useSearchParams();
  const error = params.get("error");
  const [available, setAvailable] = useState(null);

  useEffect(() => {
    document.title = "Iniciar sesión · Mis Tareas";
    api
      .get("/auth/providers")
      .then(({ data }) => setAvailable(data))
      .catch(() => setAvailable({ google: true, github: true, discord: true }));
  }, []);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="login-shell">
      <button
        className="theme-toggle position-fixed top-0 end-0 m-3"
        onClick={toggleTheme}
        aria-label="Cambiar entre modo claro y oscuro"
      >
        <i className={`bi ${theme === "dark" ? "bi-sun-fill" : "bi-moon-stars-fill"}`} />
      </button>

      <div className="surface login-card fade-up">
        <div className="login-logo float-glow">
          <i className="bi bi-check2-square" />
        </div>
        <h1 className="h4 fw-bold mb-1">Mis Tareas</h1>
        <p className="text-muted-custom mb-4">Iniciá sesión para gestionar tu ABMLC de tareas</p>

        {error && (
          <div className="alert alert-danger text-start small" role="alert">
            No se pudo iniciar sesión con {error}. Probá de nuevo.
          </div>
        )}

        <div className="d-flex flex-column gap-2">
          {PROVIDERS.map((p) => {
            const disabled = available ? !available[p.id] : false;
            return (
              <button
                key={p.id}
                className={`provider-btn ${p.className}`}
                onClick={() => loginWithProvider(p.id)}
                disabled={disabled}
                title={disabled ? "Este proveedor todavía no está configurado en el backend" : undefined}
                style={disabled ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
              >
                <i className={`bi ${p.icon}`} />
                {p.label}
                {disabled && <span className="ms-auto badge text-bg-secondary">Próximamente</span>}
              </button>
            );
          })}
        </div>

        <p className="text-muted-custom small mt-4 mb-0">
          Usamos OAuth 2.0: nunca vemos ni guardamos tu contraseña.
        </p>
      </div>
    </div>
  );
}
