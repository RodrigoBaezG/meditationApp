# REVIEW INTEGRAL — Letting Be Meditation App

> Fecha de revisión: 2026-04-15  
> Stack: React 19 + Vite 7 (frontend) | Node.js + Express 5 + PostgreSQL (backend)  
> Deployment: Netlify (frontend) + Render (backend)

---

## ÍNDICE

1. [Seguridad](#1-seguridad)
2. [Arquitectura y código](#2-arquitectura-y-código)
3. [Frontend — UX/UI y accesibilidad](#3-frontend--uxui-y-accesibilidad)
4. [Backend — API y base de datos](#4-backend--api-y-base-de-datos)
5. [Mejoras estéticas](#5-mejoras-estéticas)
6. [Testing](#6-testing)
7. [DevOps y deployment](#7-devops-y-deployment)
8. [Orden de prioridad de implementación](#8-orden-de-prioridad-de-implementación)

---

## 1. SEGURIDAD

### 1.1 JWT con expiración inconsistente
**Problema:** El token en `/register` expira en `1h` y en `/login` en `1d`. Esto causa comportamientos inesperados: un usuario recién registrado pierde su sesión en 1 hora sin entender por qué.  
**Archivo:** `meditationApp_backend/src/routes/auth.routes.js`, líneas 36 y 71  
**Solución:** Unificar a `7d` con refresh token o simplemente `7d` para ambos.

```js
// Antes (register)
jwt.sign({ ... }, JWT_SECRET, { expiresIn: '1h' })

// Después (ambos endpoints)
jwt.sign({ ... }, JWT_SECRET, { expiresIn: '7d' })
```

### 1.2 Credenciales de demo hardcodeadas en UI
**Problema:** `Login.jsx` muestra `example@gmail.com / 12345` en el propio formulario. Esto no tiene sentido en producción y confunde al usuario real.  
**Archivo:** `meditationApp_frontend/src/components/Login.jsx`  
**Solución:** Eliminar completamente. Si se necesita para desarrollo, usar variables de entorno con un banner condicional `import.meta.env.DEV`.

### 1.3 Token almacenado en localStorage
**Problema:** `localStorage` es accesible desde cualquier script de la página, vulnerable a XSS.  
**Archivo:** `meditationApp_frontend/src/context/AuthContext.jsx`, línea 30  
**Solución ideal:** Usar `httpOnly cookies` desde el backend. **Solución intermedia aceptable:** mantener `localStorage` pero asegurarse de que no existe ninguna inyección XSS en la app (sanitización de inputs, `dangerouslySetInnerHTML` ausente).

### 1.4 Sin rate limiting en el backend
**Problema:** Las rutas `/api/auth/login` y `/api/auth/register` no tienen limitación de intentos. Esto permite ataques de fuerza bruta.  
**Solución:** Añadir `express-rate-limit`.

```bash
# Backend
npm install express-rate-limit
```

```js
// server.js
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' }
});

app.use('/api/auth', authLimiter);
```

### 1.5 Sin validación de inputs en el backend
**Problema:** Los endpoints `/register` y `/login` no validan el formato del email ni la longitud mínima de la contraseña antes de llegar a la base de datos.  
**Solución:** Añadir `express-validator` o validación manual.

```js
// auth.routes.js — antes de procesar
if (!email || !password) {
  return res.status(400).json({ message: 'Email y contraseña son requeridos' });
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  return res.status(400).json({ message: 'Email inválido' });
}
if (password.length < 6) {
  return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
}
```

---

## 2. ARQUITECTURA Y CÓDIGO

### 2.1 URL de la API hardcodeada en cada componente
**Problema:** `BASE_URL` está repetida en 4 archivos distintos (`Login.jsx`, `SignUp.jsx`, `NewMeditation.jsx`, `History.jsx`). Si la URL cambia, hay que editar 4 archivos.  
**Solución:** Centralizar en un único archivo de configuración o usar variable de entorno de Vite.

```js
// meditationApp_frontend/src/api/config.js (nuevo archivo)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

```js
// En cada componente — en vez de repetir la URL
import { API_BASE_URL } from '../api/config';
```

```
# meditationApp_frontend/.env.local
VITE_API_URL=https://meditation-api-218f.onrender.com/api

# meditationApp_frontend/.env.production
VITE_API_URL=https://meditation-api-218f.onrender.com/api
```

### 2.2 Lógica fetch duplicada en cada componente
**Problema:** El patrón `fetch + headers + Bearer token + manejo de 401` está copiado en `NewMeditation.jsx` y `History.jsx`. Cualquier cambio debe hacerse en dos lugares.  
**Solución:** Crear un cliente HTTP centralizado.

```js
// meditationApp_frontend/src/api/apiClient.js (nuevo archivo)
import { API_BASE_URL } from './config';

export async function apiRequest(endpoint, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const err = new Error(error.message || 'Error en la petición');
    err.status = response.status;
    throw err;
  }

  return response.json();
}
```

### 2.3 Formatters duplicados
**Problema:** Existe `/src/utils/formatters.js` pero `History.jsx` define sus propias funciones `formatDate` y `formatTotalTime` localmente (líneas 14-41).  
**Solución:** Consolidar todo en `formatters.js` y hacer que `History.jsx` los importe.

### 2.4 Archivos CSS redundantes
**Problema:** Existe `/src/App.css`, `/src/Home.css`, `/src/components/Home.css` y posiblemente duplicados. La mezcla de CSS custom + Tailwind utilities + CSS variables crea fricción de mantenimiento.  
**Solución:** Eliminar archivos CSS duplicados. Unificar la estrategia: **solo Tailwind + las CSS variables globales en `styles.css`**. Migrar los estilos de los archivos `.css` de componentes a clases Tailwind directamente en el JSX.

### 2.5 Timer.css no encontrado
**Problema:** `Timer.jsx` línea 2 importa `/src/Timer.css` pero el archivo no aparece en la estructura del proyecto.  
**Verificar:** Si el archivo existe en otra ubicación o si se olvidó crear. Si los estilos son mínimos, moverlos directamente a Tailwind classes.

### 2.6 `useCallback` aplicado incorrectamente
**Problema:** `useCallback` en `History.jsx` línea 55 depende de `authToken` y `logout`, que cambian si el contexto re-renderiza. Revisar si realmente previene re-renders o si es código cosmético.  
**Solución:** Revisar con React DevTools si el memoize tiene efecto real. Si no, simplificar a función ordinaria.

### 2.7 Manejo de errores inconsistente
**Problema:** Algunos componentes muestran el error con `setSaveError(error.message)` y otros con `setSaveError('Error al conectar con el servidor')`. El usuario nunca sabe exactamente qué falló.  
**Solución:** Unificar mensajes de error. Usar los mensajes del backend cuando sean informativos, con fallback genérico para errores de red.

---

## 3. FRONTEND — UX/UI Y ACCESIBILIDAD

### 3.1 Sin feedback de loading en formularios
**Problema:** Al hacer submit en Login o SignUp no hay indicador visual. Si el servidor tarda (Render en cold start puede tardar 30s), el usuario cree que el botón no funcionó y hace click varias veces.  
**Solución:**

```jsx
// En Login.jsx y SignUp.jsx
const [isLoading, setIsLoading] = useState(false);

// En el submit
setIsLoading(true);
try {
  // fetch...
} finally {
  setIsLoading(false);
}

// En el botón
<button disabled={isLoading}>
  {isLoading ? 'Entrando...' : 'Iniciar sesión'}
</button>
```

### 3.2 Sin mensaje de bienvenida contextual
**Problema:** Después del login, el usuario va a Home pero no hay ningún texto que lo reconozca como usuario autenticado ni le indique el siguiente paso.  
**Solución:** En Home, si `isAuthenticated`, mostrar un saludo y CTA directo a "Nueva meditación".

### 3.3 Sin confirmación antes de cerrar sesión
**Problema:** El botón de logout actúa de inmediato sin confirmación. Si el usuario está en medio de una meditación y hace click sin querer, pierde el estado.  
**Solución:** Al menos verificar si `isMeditating` está activo en el contexto antes de ejecutar el logout. Mostrar modal de confirmación opcional.

### 3.4 Timer sin aviso de que la app debe permanecer abierta
**Problema:** Si el usuario minimiza el navegador o cambia de pestaña durante la meditación, el timer en `setInterval` sigue corriendo pero si la pestaña se suspende (comportamiento de Chrome en móvil) el conteo puede desincronizarse.  
**Solución:** Usar `Date.now()` para calcular el tiempo transcurrido en vez de decrementar un contador.

```js
// Timer.jsx — versión robusta
const startTimeRef = useRef(null);
const initialDurationRef = useRef(duration);

// Al iniciar:
startTimeRef.current = Date.now();

// En el intervalo:
const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
const remaining = Math.max(0, initialDurationRef.current - elapsed);
setTimeLeft(remaining);
```

### 3.5 Accesibilidad (a11y)
**Problemas detectados:**
- Los botones de duración en `DurationSelector.jsx` no tienen `aria-label` descriptivo.
- El timer no anuncia el tiempo restante a lectores de pantalla.
- Las imágenes de fondo en Home no tienen texto alternativo para screen readers.
- Falta `role="alert"` en los mensajes de error para que los lectores de pantalla los anuncien.

```jsx
// DurationSelector.jsx
<button aria-label={`Meditar ${minutes} minutos`}>
  {minutes} min
</button>

// Mensajes de error
<p role="alert" className="text-red-500">{error}</p>
```

### 3.6 Sin página 404 personalizada
**Problema:** La ruta `*` redirige silenciosamente a `/` sin explicar qué pasó.  
**Solución:** Crear un componente `NotFound.jsx` con un mensaje amigable.

### 3.7 Página de Instructions sin enlace de vuelta contextual
**Problema:** Las instrucciones terminan sin CTA. El usuario no sabe qué hacer después de leerlas.  
**Solución:** Añadir botón "Comenzar meditación" al final que lleve a `/new-meditation` o a `/login` si no está autenticado.

---

## 4. BACKEND — API Y BASE DE DATOS

### 4.1 Sin paginación en historial
**Problema:** `GET /api/meditations` devuelve TODAS las sesiones del usuario. Si un usuario lleva años usando la app, la query será pesada y la respuesta enorme.  
**Solución:** Añadir paginación o limitar a las últimas N sesiones.

```js
// meditation.model.js
async findByUserId(userId, limit = 50, offset = 0) {
  const result = await pool.query(
    'SELECT * FROM meditations WHERE user_id = $1 ORDER BY meditation_date DESC LIMIT $2 OFFSET $3',
    [userId, limit, offset]
  );
  return result.rows;
}
```

### 4.2 Sin endpoint para eliminar meditaciones
**Problema:** El usuario no puede corregir un registro incorrecto.  
**Solución:** Añadir `DELETE /api/meditations/:id` verificando que `userId` coincide con el dueño del registro.

### 4.3 Sin endpoint para editar notas
**Problema:** Si el usuario cometió un error en la nota, no puede corregirlo.  
**Solución:** Añadir `PATCH /api/meditations/:id` para actualizar solo el campo `note`.

### 4.4 Inconsistencia en duración: register vs login
**Problema detectado:** `POST /api/meditations` recibe `duration` en minutos y lo guarda directamente. Pero el frontend envía `Math.round(durationInSeconds / 60)`. Si el usuario elige 1 minuto, se guarda `1`. Correcto. Pero no hay validación de que `duration > 0` en el backend.  
**Solución:** Validar en backend que `duration >= 1` y `duration <= 480` (8 horas máximo).

### 4.5 Sin manejo de errores de base de datos
**Problema:** Si la query de PostgreSQL falla (conexión caída, constraint violation), el error sin capturar romperá Express con un 500 genérico sin logging útil.  
**Solución:** Añadir try/catch en los modelos y logging estructurado.

```js
// meditation.model.js
async create(userId, duration, date, note) {
  try {
    const result = await pool.query(/* ... */);
    return result.rows[0];
  } catch (err) {
    console.error('[MeditationModel.create]', err.message);
    throw new Error('Error al guardar la meditación');
  }
}
```

### 4.6 Sin health check endpoint
**Problema:** No hay forma de verificar si el backend está vivo sin hacer un request real a la API.  
**Solución:** Añadir `GET /api/health` que devuelva `{ status: 'ok', timestamp: new Date() }`.

---

## 5. MEJORAS ESTÉTICAS

El objetivo es una estética **minimalista y serena** — propia de una app de meditación. Menos saturación, más espacio en blanco, tipografía clara, micro-animaciones sutiles.

### 5.1 Paleta de colores — refinamiento

La paleta verde actual es funcional pero demasiado saturada para una app de calma. Propuesta de refinamiento:

```css
/* styles.css — paleta refinada */
:root {
  /* Primarios — verde salvia (más suave) */
  --color-primary:        #5a8f7b;   /* antes #408d80 — tono más tranquilo */
  --color-primary-dark:   #3d6b5a;   /* antes #3c7965 */
  --color-primary-light:  #c8e6e0;   /* antes #b6dddf — más suave */

  /* Fondos — warm off-white */
  --color-bg:             #f7f5f2;   /* antes #f9fafb — ligeramente cálido */
  --color-bg-card:        #ffffff;
  --color-bg-subtle:      #eef0ec;   /* nuevo — para secciones alternas */

  /* Texto */
  --color-text:           #2d3a35;   /* antes #1f2937 — tono más verde-oscuro */
  --color-text-muted:     #7a8c85;   /* antes #6b7280 */

  /* Estado */
  --color-error:          #c0616a;   /* rojo más suave */
  --color-warning:        #d4a04a;   /* antes #ddaa51 */

  /* Nuevos — acentos */
  --color-accent:         #a8c5ba;   /* para bordes y divisores */
  --color-surface:        #fafaf8;   /* cards con fondo casi blanco */
}
```

### 5.2 Tipografía — jerarquía clara

```css
/* styles.css — tipografía */
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500&display=swap');

body {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  letter-spacing: -0.01em;
}

h1, h2, .display {
  font-family: 'DM Serif Display', serif; /* elegante, evoca calma */
}
```

**Cambio clave:** Reemplazar Roboto (fuente neutra-corporativa) por **Inter** (moderna, legible) + **DM Serif Display** para títulos (evoca calma y naturaleza sin ser pesada).

### 5.3 Navbar — rediseño

**Actual:** Navbar verde sólida con texto blanco.  
**Propuesta:** Fondo transparente con blur que se solidifica al hacer scroll. Texto oscuro sobre fondo claro.

```css
/* App.css */
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(247, 245, 242, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-accent);
  transition: background 0.3s ease;
}

.navbar-brand {
  font-family: 'DM Serif Display', serif;
  font-size: 1.25rem;
  color: var(--color-primary-dark);
  letter-spacing: 0.02em;
}

.nav-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--color-primary);
}
```

### 5.4 Home — hero section

**Actual:** Imagen de fondo con texto encima.  
**Propuesta:** Layout dividido. Lado izquierdo: copy + CTAs. Lado derecho: imagen o ilustración abstracta. En mobile: stack vertical.

```jsx
// Home.jsx — estructura propuesta
<section className="hero">
  <div className="hero-content">
    <span className="hero-eyebrow">Meditación consciente</span>
    <h1 className="hero-title">
      Encontrar paz<br />
      <em>es posible</em>
    </h1>
    <p className="hero-subtitle">
      Letting Be es una práctica simple para observar tu mente
      sin juzgar lo que encuentras.
    </p>
    <div className="hero-actions">
      <Link to="/new-meditation" className="btn-primary">Comenzar ahora</Link>
      <Link to="/instructions" className="btn-ghost">Cómo funciona</Link>
    </div>
  </div>
  <div className="hero-visual">
    {/* Imagen abstracta o gradiente circular animado */}
  </div>
</section>
```

```css
/* Home.css — hero propuesto */
.hero {
  min-height: calc(100vh - 64px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 4rem;
  padding: 4rem 6rem;
  background: var(--color-bg);
}

.hero-eyebrow {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.hero-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.1;
  color: var(--color-text);
  margin-bottom: 1.5rem;
}

.hero-title em {
  color: var(--color-primary);
  font-style: italic;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.breathing-circle {
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--color-primary-light) 0%, transparent 70%);
  animation: breathe 6s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 1; }
}

@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 2rem 1.5rem;
    text-align: center;
  }
  .hero-visual { display: none; }
}
```

### 5.5 Botones — sistema unificado

Actualmente cada componente define sus propios estilos de botón. Unificar en `styles.css`:

```css
/* styles.css — sistema de botones */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.75rem;
  background: var(--color-primary);
  color: white;
  border-radius: 9999px; /* pill shape */
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  text-decoration: none;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(90, 143, 123, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.75rem;
  background: transparent;
  color: var(--color-text-muted);
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1.5px solid var(--color-accent);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-ghost:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
```

### 5.6 Timer — rediseño visual

**Actual:** Display numérico simple.  
**Propuesta:** Círculo de progreso SVG + número grande centrado + controles debajo.

```jsx
// Timer — estructura visual propuesta
<div className="timer-wrapper">
  <svg className="timer-ring" viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="90" className="timer-ring-bg" />
    <circle cx="100" cy="100" r="90" className="timer-ring-progress"
      strokeDasharray={`${circumference}`}
      strokeDashoffset={`${circumference - (progress * circumference)}`}
    />
  </svg>
  <div className="timer-display">
    <span className="timer-time">{formatTime(timeLeft)}</span>
    <span className="timer-label">restante</span>
  </div>
</div>
```

```css
/* Timer.css */
.timer-wrapper {
  position: relative;
  width: 260px;
  height: 260px;
  margin: 0 auto;
}

.timer-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.timer-ring-bg {
  fill: none;
  stroke: var(--color-primary-light);
  stroke-width: 8;
}

.timer-ring-progress {
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}

.timer-display {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.timer-time {
  font-family: 'DM Serif Display', serif;
  font-size: 3rem;
  color: var(--color-text);
  line-height: 1;
}

.timer-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 0.25rem;
}
```

### 5.7 Cards de historial — rediseño

```css
/* History.css — card propuesta */
.meditation-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-accent);
  border-radius: 16px;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: center;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.meditation-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border-color: var(--color-primary-light);
}

.meditation-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--color-bg-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.meditation-card-duration {
  font-family: 'DM Serif Display', serif;
  font-size: 1.5rem;
  color: var(--color-primary);
  white-space: nowrap;
}
```

### 5.8 Formularios — estilo limpio

```css
/* styles.css — inputs */
.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid var(--color-accent);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.9375rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  outline: none;
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(90, 143, 123, 0.12);
}

.form-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.7;
}
```

### 5.9 Animaciones de entrada sutiles

```css
/* styles.css */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: fadeInUp 0.4s ease both;
}

.animate-in-delay-1 { animation-delay: 0.1s; }
.animate-in-delay-2 { animation-delay: 0.2s; }
.animate-in-delay-3 { animation-delay: 0.3s; }
```

Aplicar `animate-in` a los contenedores principales de cada página para una transición suave.

### 5.10 Dark mode (opcional pero recomendado)

```css
/* styles.css */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg:         #1a1f1d;
    --color-bg-card:    #232b27;
    --color-bg-subtle:  #1e2620;
    --color-surface:    #263029;
    --color-text:       #e8f0ec;
    --color-text-muted: #8fa898;
    --color-accent:     #3a4f45;
    --color-primary:    #6ba893;
  }
}
```

---

## 6. TESTING

### 6.1 Backend — tests unitarios e integración

**Setup recomendado:**

```bash
# En meditationApp_backend
npm install --save-dev jest supertest
```

```json
// package.json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
},
"jest": {
  "testEnvironment": "node",
  "testMatch": ["**/__tests__/**/*.test.js"]
}
```

#### Tests a implementar:

**Test A — auth.middleware.js**
```
__tests__/auth.middleware.test.js

✅ checkAuth: rechaza request sin Authorization header → 401
✅ checkAuth: rechaza token malformado → 401
✅ checkAuth: rechaza token expirado → 401
✅ checkAuth: acepta token válido y añade req.userId
✅ checkAuth: acepta token válido y añade req.userEmail
```

**Test B — auth.routes.js (integración con supertest)**
```
__tests__/auth.routes.test.js

✅ POST /api/auth/register: crea usuario con email/password válidos → 201
✅ POST /api/auth/register: rechaza email duplicado → 409
✅ POST /api/auth/register: rechaza email inválido → 400
✅ POST /api/auth/register: rechaza password corta → 400
✅ POST /api/auth/register: retorna token JWT + user data
✅ POST /api/auth/login: autentica con credenciales correctas → 200
✅ POST /api/auth/login: rechaza password incorrecta → 401
✅ POST /api/auth/login: rechaza email inexistente → 404
✅ POST /api/auth/login: retorna token JWT + user data
```

**Test C — meditation.routes.js (integración)**
```
__tests__/meditation.routes.test.js

✅ POST /api/meditations: rechaza request sin token → 401
✅ POST /api/meditations: guarda sesión con datos válidos → 201
✅ POST /api/meditations: rechaza duration <= 0 → 400
✅ POST /api/meditations: rechaza date inválida → 400
✅ GET /api/meditations: rechaza request sin token → 401
✅ GET /api/meditations: retorna historial del usuario autenticado → 200
✅ GET /api/meditations: retorna array vacío si no hay sesiones → 200 []
✅ GET /api/meditations: NO retorna sesiones de otro usuario
```

**Test D — user.model.js y meditation.model.js**
```
__tests__/models.test.js

✅ User.create: inserta usuario en DB
✅ User.findByEmail: encuentra usuario existente
✅ User.findByEmail: retorna null si no existe
✅ Meditation.create: inserta sesión correctamente
✅ Meditation.findByUserId: retorna sesiones ordenadas por fecha DESC
✅ Meditation.findByUserId: retorna array vacío para usuario sin sesiones
```

### 6.2 Frontend — tests de componentes

**Setup recomendado:**

```bash
# En meditationApp_frontend
npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

```js
// vite.config.js — añadir
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/__tests__/setup.js',
}
```

```js
// src/__tests__/setup.js
import '@testing-library/jest-dom';
```

#### Tests a implementar:

**Test E — AuthContext**
```
src/__tests__/AuthContext.test.jsx

✅ handleAuth: guarda token en localStorage
✅ handleAuth: setea isAuthenticated a true
✅ logout: borra token de localStorage
✅ logout: setea isAuthenticated a false
✅ Al montar: carga token existente de localStorage
✅ Al montar sin token: isAuthenticated = false
```

**Test F — Login**
```
src/__tests__/Login.test.jsx

✅ Renderiza formulario con campos email y password
✅ Muestra error si se envía formulario vacío
✅ Deshabilita botón durante el loading
✅ Llama a handleAuth al recibir respuesta exitosa
✅ Muestra mensaje de error ante respuesta 401
✅ Navega a "/" tras login exitoso
```

**Test G — Timer**
```
src/__tests__/Timer.test.jsx

✅ Renderiza el tiempo inicial correctamente (MM:SS)
✅ Botón "Iniciar" arranca la cuenta regresiva
✅ Botón "Pausar" detiene la cuenta
✅ Botón "Continuar" reanuda desde donde paró
✅ Llama a onComplete cuando llega a 00:00
✅ Reproduce sonido cuando llega a 00:00 (mock de Audio)
```

**Test H — NewMeditation**
```
src/__tests__/NewMeditation.test.jsx

✅ Renderiza selector de duración como primer paso
✅ Al seleccionar duración y confirmar, muestra el timer
✅ Al completar el timer, muestra el formulario de registro
✅ Envía POST con duration, date y note correctos
✅ Navega a /history tras guardar exitosamente
✅ Muestra error ante fallo de red
```

**Test I — History**
```
src/__tests__/History.test.jsx

✅ Muestra spinner/loading durante fetch
✅ Renderiza cards de meditación con datos correctos
✅ Muestra estado vacío si no hay sesiones
✅ Calcula y muestra total de sesiones correctamente
✅ Calcula y muestra tiempo total acumulado correctamente
✅ Muestra error ante fallo de API
```

**Test J — ProtectedRoute**
```
src/__tests__/ProtectedRoute.test.jsx

✅ Redirige a /login si !isAuthenticated
✅ Muestra children si isAuthenticated = true
✅ Muestra loading mientras isLoading = true
```

### 6.3 Tests E2E (Playwright)

```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Flujos críticos a testear:**

```
e2e/auth.spec.js
✅ Flujo completo de registro → login → logout
✅ Redirección a /login si se accede a ruta protegida sin sesión
✅ Token expirado → redirige a /login automáticamente

e2e/meditation.spec.js
✅ Flujo completo: seleccionar duración → meditar → guardar → ver en historial
✅ Timer se pausa y reanuda correctamente
✅ Botón "Volver" durante timer pregunta confirmación

e2e/responsive.spec.js
✅ Todas las páginas se ven correctamente en 375px (mobile)
✅ Navbar se colapsa en mobile
✅ Timer y botones son accesibles en pantalla táctil
```

---

## 7. DEVOPS Y DEPLOYMENT

### 7.1 Sin archivo .env.example
**Problema:** No existe documentación de las variables de entorno necesarias para instalar el proyecto.  
**Solución:** Crear `meditationApp_backend/.env.example`:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
JWT_SECRET=minimum_32_character_secret_here
PORT=3000
```

### 7.2 Sin CI/CD
**Problema:** No hay pipeline automatizado. Los errores solo se descubren en producción.  
**Solución:** Crear `.github/workflows/ci.yml` con:
- Lint (ESLint backend y frontend)
- Build frontend
- Tests backend
- Tests frontend

### 7.3 Backend en Render con cold start
**Problema:** El plan gratuito de Render apaga el servidor después de 15 minutos de inactividad. El primer request puede tardar 30+ segundos, causando timeout en el login.  
**Solución:** 
1. Mostrar en la UI un mensaje de "Conectando con el servidor..." durante cold start.
2. Implementar un ping periódico desde el frontend (cada 14 minutos) para mantener el servidor activo.
3. O bien: upgradear a plan pago en Render ($7/mes).

### 7.4 CORS demasiado permisivo (probable)
**Verificar en server.js:** Si `cors()` se usa sin `origin` específico, acepta requests de cualquier dominio. En producción, restringir:

```js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
}));
```

---

## 8. ORDEN DE PRIORIDAD DE IMPLEMENTACIÓN

### Fase 1 — Seguridad y estabilidad crítica (inmediato)

| # | Tarea | Tiempo est. |
|---|-------|-------------|
| 1 | Unificar expiración JWT a `7d` | 5 min |
| 2 | Eliminar credenciales demo del UI | 5 min |
| 3 | Añadir validación de inputs en backend (email, password) | 1h |
| 4 | Añadir `express-rate-limit` a rutas de auth | 30 min |
| 5 | Restringir CORS a dominio del frontend | 15 min |
| 6 | Añadir `GET /api/health` endpoint | 15 min |
| 7 | Crear `.env.example` en backend | 5 min |

### Fase 2 — Calidad de código (siguiente sprint)

| # | Tarea | Tiempo est. |
|---|-------|-------------|
| 8 | Centralizar `BASE_URL` en variable de entorno Vite | 30 min |
| 9 | Crear `apiClient.js` y refactorizar todos los fetch | 2h |
| 10 | Consolidar formatters en `utils/formatters.js` | 30 min |
| 11 | Eliminar CSS duplicados | 1h |
| 12 | Fix Timer con `Date.now()` para robustez en background | 1h |
| 13 | Añadir loading states en formularios Login/SignUp | 30 min |
| 14 | Añadir paginación en `GET /api/meditations` | 1h |

### Fase 3 — Rediseño estético (sprint siguiente)

| # | Tarea | Tiempo est. |
|---|-------|-------------|
| 15 | Actualizar paleta de colores en `styles.css` | 1h |
| 16 | Cambiar fuentes a Inter + DM Serif Display | 30 min |
| 17 | Rediseñar Navbar (glassmorphism, sticky) | 1h |
| 18 | Rediseñar Home con layout split + breathing circle | 2h |
| 19 | Rediseñar Timer con anillo SVG de progreso | 3h |
| 20 | Unificar sistema de botones en `styles.css` | 1h |
| 21 | Aplicar nuevos estilos a cards de historial | 1h |
| 22 | Añadir animaciones de entrada `fadeInUp` | 30 min |
| 23 | Añadir dark mode via `prefers-color-scheme` | 1h |

### Fase 4 — Testing (paralelo a desarrollo)

| # | Tarea | Tiempo est. |
|---|-------|-------------|
| 24 | Setup Jest + Supertest en backend | 1h |
| 25 | Tests de auth.middleware (Test A) | 1h |
| 26 | Tests de auth.routes integración (Test B) | 2h |
| 27 | Tests de meditation.routes integración (Test C) | 2h |
| 28 | Setup Vitest + Testing Library en frontend | 1h |
| 29 | Tests de AuthContext (Test E) | 1h |
| 30 | Tests de Login y Timer (Tests F, G) | 2h |
| 31 | Tests de NewMeditation e History (Tests H, I) | 2h |
| 32 | Setup Playwright + E2E flujos críticos | 3h |

### Fase 5 — Features adicionales (backlog)

| # | Tarea | Propósito |
|---|-------|-----------|
| 33 | `DELETE /api/meditations/:id` | Permitir borrar registros incorrectos |
| 34 | `PATCH /api/meditations/:id` | Editar notas |
| 35 | Estadísticas de racha (streak) | Gamificación simple |
| 36 | Selector de tipo de sonido (gong, cuenco, silencio) | Personalización |
| 37 | Página de perfil con total acumulado de por vida | Contexto y motivación |
| 38 | Notificación push opcional para recordatorio diario | Engagement |
| 39 | Export de historial a CSV | Data portability |
| 40 | CI/CD con GitHub Actions | Automatización |

---

*Revisión generada para la app en estado de commit `9167b67`.*
