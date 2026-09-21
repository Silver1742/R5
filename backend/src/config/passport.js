const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const DiscordStrategy = require("passport-discord").Strategy;
const pool = require("./db");

// Busca al usuario por (provider, provider_id); si no existe lo crea.
// Así cada proveedor queda asociado a su propia fila, aunque compartan email.
async function findOrCreateUser({ provider, providerId, name, email, avatarUrl }) {
  const [existing] = await pool.query(
    "SELECT * FROM users WHERE provider = ? AND provider_id = ?",
    [provider, providerId]
  );

  if (existing.length > 0) {
    await pool.query(
      "UPDATE users SET name = ?, email = ?, avatar_url = ? WHERE id = ?",
      [name, email, avatarUrl, existing[0].id]
    );
    return { ...existing[0], name, email, avatar_url: avatarUrl };
  }

  const [result] = await pool.query(
    "INSERT INTO users (provider, provider_id, name, email, avatar_url) VALUES (?, ?, ?, ?, ?)",
    [provider, providerId, name, email, avatarUrl]
  );

  return { id: result.insertId, provider, provider_id: providerId, name, email, avatar_url: avatarUrl };
}

// Cada proveedor se registra solo si sus credenciales están cargadas en .env.
// Así el server arranca aunque todavía no hayas configurado los tres (ej: falta Discord).
const configuredProviders = new Set();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  configuredProviders.add("google");
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateUser({
            provider: "google",
            providerId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value || null,
            avatarUrl: profile.photos?.[0]?.value || null,
          });
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
} else {
  console.warn("⚠️  Google OAuth no configurado (faltan GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET en .env)");
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  configuredProviders.add("github");
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateUser({
            provider: "github",
            providerId: profile.id,
            name: profile.displayName || profile.username,
            email: profile.emails?.[0]?.value || null,
            avatarUrl: profile.photos?.[0]?.value || null,
          });
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
} else {
  console.warn("⚠️  GitHub OAuth no configurado (faltan GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET en .env)");
}

if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  configuredProviders.add("discord");
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: process.env.DISCORD_CALLBACK_URL,
        scope: ["identify", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const avatarUrl = profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : null;
          const user = await findOrCreateUser({
            provider: "discord",
            providerId: profile.id,
            name: profile.global_name || profile.username,
            email: profile.email || null,
            avatarUrl,
          });
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
} else {
  console.warn("⚠️  Discord OAuth no configurado (faltan DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET en .env)");
}

module.exports = passport;
module.exports.configuredProviders = configuredProviders;
