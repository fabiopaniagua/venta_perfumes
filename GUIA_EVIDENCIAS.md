# 📸 Guía Paso a Paso para la Toma de Evidencias
## Proyecto: Perfumería Fabio (venta-perfumes)

Sigue cada uno de estos 5 pasos para obtener las capturas de pantalla exactas exigidas para la presentación del proyecto **Perfumería Fabio**.

---

### 📷 Evidencia 1: Clonación y Estructura del Repositorio
**Objetivo:** Demostrar la preparación inicial del entorno en tu terminal.

1. Abre tu terminal favorita (PowerShell, CMD o Git Bash).
2. Ejecuta primero tu comando de identificación personal:
   ```powershell
   echo "Proyecto realizado por: Fabio - Perfumería Fabio"
   ```
3. Ingresa a la carpeta del proyecto y muestra la estructura de archivos:
   ```powershell
   cd C:\Users\FIRNT\.gemini\antigravity\scratch\venta-perfumes
   dir
   ```
4. **Captura requerida:** Toma la captura completa de la ventana de la terminal donde se vea claramente el comando `echo` con tu nombre (**Fabio**), la ruta del proyecto y la lista de carpetas (`backend`, `frontend`, `docker-compose.yml`).

---

### 📷 Evidencia 2: Configuración de IP y Variables de Entorno
**Objetivo:** Demostrar la configuración de red y variables `.env` para la conectividad local/LAN.

1. Abre la carpeta del proyecto en **Visual Studio Code**:
   ```powershell
   code C:\Users\FIRNT\.gemini\antigravity\scratch\venta-perfumes
   ```
2. Obtén tu dirección IPv4 local ejecutando en la terminal integrada:
   ```powershell
   ipconfig
   ```
   *(Localiza la "Dirección IPv4", por ejemplo: `192.168.100.8` o `192.168.1.15`)*.
3. Abre en el editor el archivo `frontend/.env`.
4. Asegúrate de que tenga en la primera línea tu comentario de personalización:
   ```env
   # Desarrollador: Fabio - Perfumería Fabio
   VITE_API_URL=http://<TU_IP_LOCAL>:5000/api
   ```
5. **Captura requerida:** Captura de pantalla de Visual Studio Code mostrando el archivo `frontend/.env` abierto, con tu comentario `# Desarrollador: Fabio - Perfumería Fabio` en la línea 1 y la barra lateral de archivos visible.

---

### 📷 Evidencia 3: Inicio de Servicios / Contenedores
**Objetivo:** Evidenciar que los contenedores o servicios del sistema están corriendo en ejecución activa.

1. Si utilizas **Docker Desktop**:
   - Asegúrate de que Docker Desktop esté abierto.
   - En la terminal raíz del proyecto ejecuta:
     ```powershell
     echo "Iniciando contenedores: Fabio - Perfumería Fabio"
     docker compose up --build
     ```
2. Si utilizas el **modo desarrollo local (sin Docker)**:
   - Terminal 1 (Backend):
     ```powershell
     cd backend
     npm run dev
     ```
   - Terminal 2 (Frontend):
     ```powershell
     cd frontend
     npm run dev
     ```
3. **Captura requerida:** Captura de la terminal con las trazas activas de compilación e inicio (`perfumeria_fabio_backend`, `perfumeria_fabio_frontend`, `perfumeria_fabio_db`), donde se observe el usuario de Windows del prompt o el mensaje echo con tus datos.

---

### 📷 Evidencia 4: Pantalla de Login / Dashboard en el Navegador Web
**Objetivo:** Demostrar la interacción con el sistema en el navegador con la consola de desarrollador abierta.

1. Abre tu navegador web (Google Chrome o Edge).
2. Ingresa a la URL:
   `http://localhost:5173` o `http://<TU_IP_LOCAL>:5173`
3. En la barra superior de la tienda, haz clic en el botón de edición de la marca de agua (esquina superior) y coloca tu nombre: **Fabio**.
4. Haz clic en el botón **Ingresar** en la esquina superior derecha para abrir la ventana modal de login de **Perfumería Fabio**.
5. Presiona la tecla **F12** para abrir las **Herramientas de Desarrollador**.
6. Dirígete a la pestaña **Console** (o **Network**). Observarás el log oficial:
   `[Perfumería Fabio] Conectado a la API en: http://...:5000/api`
7. **Captura requerida:** Captura de pantalla completa de tu monitor donde se aprecie:
   - La barra de direcciones del navegador con la URL activa.
   - La pantalla de login/dashboard con la marca de agua de **Perfumería Fabio**.
   - Las herramientas de desarrollador (F12) con el registro de conexión visible.

---

### 📷 Evidencia 5: Acceso desde Dispositivo Móvil en LAN (Misma Red Wi-Fi)
**Objetivo:** Validar la disponibilidad del sistema en red local multidispositivo.

1. Asegúrate de que tu teléfono móvil esté conectado a la **misma red Wi-Fi** que tu computadora.
2. Abre el navegador de tu móvil (Chrome, Safari, etc.) e ingresa a:
   `http://<TU_IP_LOCAL>:5173`
3. Observarás la tienda **Perfumería Fabio** adaptada al diseño responsive móvil, mostrando la marca de agua superior con tu nombre.
4. Para mayor autenticidad:
   - Coloca tu teléfono sobre el escritorio al lado de tu teclado.
   - Pon al lado un **papel manuscrito** con: **Perfumería Fabio**, tu Nombre (**Fabio**) y la Fecha actual.
5. **Captura requerida:** Toma una fotografía con otro teléfono o una captura directa desde el móvil con la nota manuscrita visible mostrando la tienda de perfumes cargada correctamente desde la IP local.

---

## 💎 Pruebas Adicionales de Funcionalidades Innovadoras (Para Puntuación Extra)

- **Captura Extra A (Quiz Interactivo):**
  Abre el test *"Encuentra tu Perfume Ideal"*, responde las 4 preguntas y captura el resultado con el **TOP 3 de perfumes recomendados** y el botón *"Al Carrito"*.
- **Captura Extra B (Checkout y Muestras Gratis):**
  Agrega un perfume de \$185 al carrito, procede al checkout y muestra la sección *"Elige tus muestras aquí"* con 2 muestras seleccionadas y la alerta visual si intentas elegir una tercera.
- **Captura Extra C (Ticket Digital y Correo):**
  Genera la orden y captura el **Ticket de Compra Digital** de **Perfumería Fabio** mostrando el bloque de muestras a costo **\$0.00** o el correo de confirmación enviado al cliente.
