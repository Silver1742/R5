const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("../config/passport");
const pool = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function requireProviderConfigured(provider) {
  return (req, res, next) => {
    if (!passport.configuredProviders.has(provider)) {
      return res.status(503).json({
        error: `El login con ${provider} todavía no está configurado en el backend (faltan las credenciales en .env)`,
      });
    }
    next();
  };
}

function issueTokenAndRedirect(req, res) {
  const user = req.user;
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatar_url, provider: user.provider },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
}

// --- Google ---
router.get(
  "/google",
  requireProviderConfigured("google"),
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
  "/google/callback",
  requireProviderConfigured("google"),
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google` }),
  issueTokenAndRedirect
);

// --- GitHub ---
router.get(
  "/github",
  requireProviderConfigured("github"),
  passport.authenticate("github", { scope: ["user:email"], session: false })
);
router.get(
  "/github/callback",
  requireProviderConfigured("github"),
  passport.authenticate("github", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=github` }),
  issueTokenAndRedirect
);

// --- Discord ---
router.get(
  "/discord",
  requireProviderConfigured("discord"),
  passport.authenticate("discord", { session: false })
);
router.get(
  "/discord/callback",
  requireProviderConfigured("discord"),
  passport.authenticate("discord", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=discord` }),
  issueTokenAndRedirect
);

// Le dice al frontend qué proveedores tienen credenciales cargadas,
// para deshabilitar los botones de login que todavía no están listos.
router.get("/providers", (req, res) => {
  res.json({
    google: passport.configuredProviders.has("google"),
    github: passport.configuredProviders.has("github"),
    discord: passport.configuredProviders.has("discord"),
  });
});

// Devuelve los datos frescos del usuario logueado (a partir del JWT)
router.get("/me", requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, provider, name, email, avatar_url, created_at FROM users WHERE id = ?",
    [req.user.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(rows[0]);
});

module.exports = router;
