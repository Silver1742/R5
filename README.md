# R5 · Login OAuth 2.0 + ABMLC de tareas

Ejercicio R3 (React Ya): login con **Google, GitHub y Discord** usando OAuth 2.0, más un panel de tareas con ABMLC completo (Alta, Baja, Modificación, Listado y Consulta), responsivo con Bootstrap y modo claro/oscuro.

## Stack

- **Frontend**: React 19 + Vite, React Router, Bootstrap 5 + Bootstrap Icons, Axios.
- **Backend**: Node + Express, MySQL (mysql2), Passport.js (estrategias Google / GitHub / Discord), JWT.
- **Base de datos**: MySQL (ver [`backend/schema.sql`](backend/schema.sql)).

## ¿Cómo funciona el login OAuth?

1. El usuario hace clic en "Continuar con Google/GitHub/Discord" → el frontend redirige a `GET /api/auth/:provider` del backend.
2. El backend (con Passport) redirige al proveedor. El usuario inicia sesión y autoriza la app.
3. El proveedor vuelve a `GET /api/auth/:provider/callback` con un código; Passport lo intercambia por el perfil del usuario.
4. El backend busca o crea el usuario en MySQL (tabla `users`), genera un **JWT propio** y redirige al frontend a `/oauth-callback?token=...`.
5. El frontend guarda el token en `localStorage` y lo manda como `Authorization: Bearer <token>` en cada request al ABMLC de tareas.

El Client Secret de cada proveedor **nunca** se expone al frontend — todo el intercambio pasa por el backend.

## Puesta en marcha

### 1. Base de datos

Ejecutá el script en tu MySQL local (Workbench, phpMyAdmin, CLI, etc.):

```bash
mysql -u root -p < backend/schema.sql
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # completar con tus credenciales OAuth y las de MySQL
npm run dev
```

Corre en `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Corre en `http://localhost:5173`.

## Registrar las apps OAuth (esto lo tenés que hacer vos)

Necesitás un Client ID + Client Secret por cada proveedor, y cargarlos en `backend/.env`.

### Google
1. [console.cloud.google.com](https://console.cloud.google.com) → crear proyecto.
2. "APIs & Services" → "OAuth consent screen" → tipo **External**, agregá tu email como usuario de prueba.
3. "Credentials" → "Create Credentials" → **OAuth client ID** → tipo **Web application**.
4. En "Authorized redirect URIs" agregá: `http://localhost:5000/api/auth/google/callback`
5. Copiá el Client ID y Client Secret a `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

### GitHub
1. [github.com/settings/developers](https://github.com/settings/developers) → "New OAuth App".
2. Homepage URL: `http://localhost:5173`
3. Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Copiá el Client ID, generá un Client Secret, y cargalos en `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`.

### Discord
1. [discord.com/developers/applications](https://discord.com/developers/applications) → "New Application".
2. Pestaña **OAuth2** → copiá el **Client ID**, generá el **Client Secret**.
3. En "Redirects" agregá: `http://localhost:5000/api/auth/discord/callback`
4. Cargalos en `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`.

> Los tres proveedores exigen que la Authorization callback URL coincida **exactamente** con la que configuraste (protocolo, host y puerto incluidos).

## ABMLC

El panel de tareas (`/dashboard`, requiere login) implementa las 5 operaciones sobre la tabla `tasks`, todas filtradas por el usuario logueado:

| Operación | Dónde |
|---|---|
| **A**lta | Botón "Nueva tarea" → `POST /api/tasks` |
| **B**aja | Botón eliminar (con confirmación) → `DELETE /api/tasks/:id` |
| **M**odificación | Botón editar → `PUT /api/tasks/:id` |
| **L**istado | Tabla principal con búsqueda y filtro por estado → `GET /api/tasks` |
| **C**onsulta | Clic en una fila → detalle → `GET /api/tasks/:id` |

## Estructura

```
R5/
├─ backend/
│  ├─ server.js
│  ├─ schema.sql
│  └─ src/
│     ├─ config/       (conexión MySQL + estrategias Passport)
│     ├─ middleware/    (verificación de JWT)
│     ├─ routes/        (auth, tasks)
│     └─ controllers/   (lógica del ABMLC)
└─ frontend/
   └─ src/
      ├─ context/        (Theme, Auth)
      ├─ components/      (Navbar, Modal, tabla y modales de tareas)
      ├─ pages/           (Login, OAuthCallback, Dashboard)
      └─ styles/          (theme.css con variables para modo claro/oscuro)
```
