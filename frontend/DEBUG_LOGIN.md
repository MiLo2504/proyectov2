# DEBUG: Login Usuario "apoyo"

## Pasos para diagnosticar:

### 1. Abre la consola del navegador (F12)

Antes de hacer login, abre DevTools:

- Presiona `F12`
- Ve a la pestaña **Console**
- Ve a la pestaña **Network**

### 2. Intenta iniciar sesión

- Email: `hola@hola.com`
- Password: `hola`
- Click en "Iniciar sesión"

### 3. Revisa la consola

Busca en la **Console**:

```
Usuario logueado con permisos: [...]
```

### 4. Revisa Network

En la pestaña **Network**:

- Busca la petición a `auth/login`
- Busca la petición a `auth/me`
- Verifica que ambas tengan Status 200

### 5. ¿Qué ves?

**CASO A: "No hace nada"** (el botón se queda cargando)

- Revisa si hay errores en rojo en Console
- Busca el texto del error

**CASO B: Muestra un mensaje de error**

- ¿Qué dice el mensaje?

**CASO C: Redirige pero muestra página en blanco**

- Verifica la URL a la que redirigió
- Busca errores en Console

**CASO D: Redirige a /login de nuevo**

- Puede ser que `hooks.server.js` esté bloqueando

---

## Verificación manual del store de permissions

Abre la consola y ejecuta:

```javascript
// Ver el contenido del localStorage
console.log("Token:", localStorage.getItem("token"));
console.log("User:", JSON.parse(localStorage.getItem("user")));

// Ver las cookies
console.log("Cookies:", document.cookie);
```

---

## Si sigue fallando, prueba esto:

1. **Limpia el navegador:**

   - Presiona `Ctrl + Shift + Delete`
   - Elimina cookies y caché
   - Cierra y abre el navegador

2. **Revisa el archivo de login:**

   - `frontend/src/routes/login/+page.svelte`
   - Línea 50: Debería tener `permissions.loadPermissions(user);`

3. **Verifica que el servidor FastAPI esté actualizado:**
   - El endpoint `/auth/me` debe devolver `rol_name`

---

## Logs esperados (buenos):

```
[Console] Usuario logueado con permisos: [{ id: 4, name: "Ver Usuarios", ... }]
[Network] POST /auth/login → 200 OK
[Network] GET /auth/me → 200 OK
[Location] Navegando a /dinamico
```

## Logs de error comunes:

**Error 1: "Cannot read property 'loadPermissions' of undefined"**
→ El import de permissions está mal

**Error 2: "redirect is not defined"**
→ Error en hooks.server.js

**Error 3: "Cannot read property 'length' of undefined"**
→ modules no está definido en el user

**Error 4: Bucle infinito de redirects**
→ hooks.server.js está redirigiendo mal

---

Por favor, copia y pega lo que veas en la consola aquí.
