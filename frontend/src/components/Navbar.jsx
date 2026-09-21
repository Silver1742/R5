import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar navbar-expand fixed-top app-navbar">
      <div className="container d-flex align-items-center justify-content-between">
        <a className="navbar-brand font-display fw-bold brand-mark mb-0" href="/">
          <span className="brand-bracket">/</span>Mis Tareas<span className="brand-bracket">/</span>
        </a>

        <div className="d-flex align-items-center gap-3">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Cambiar entre modo claro y oscuro"
            title="Cambiar tema"
          >
            <i className={`bi ${theme === "dark" ? "bi-sun-fill" : "bi-moon-stars-fill"}`} />
          </button>

          {user && (
            <div className="dropdown" ref={menuRef}>
              <button
                className="user-chip btn p-0"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} />
                ) : (
                  <i className="bi bi-person-circle fs-4" />
                )}
                <span className="d-none d-sm-inline fw-semibold">{user.name}</span>
                <i className="bi bi-chevron-down small text-muted-custom" />
              </button>
              <ul className={`dropdown-menu dropdown-menu-end mt-2 ${menuOpen ? "show" : ""}`}>
                <li>
                  <span className="dropdown-item-text small text-muted-custom text-capitalize">
                    <i className="bi bi-patch-check-fill me-1" />
                    {user.provider}
                  </span>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={logout}>
                    <i className="bi bi-box-arrow-right me-2" />
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
