# 🌸 Perfumería Fabio - Tienda Oficial de Perfumes & Fragancias

Sistema integral de comercio electrónico de fragancias de diseñador y nicho de alta perfumería.

---

## 🌟 Características Principales del Proyecto

1. **Buscador Rápido y Predictivo en Tiempo Real**:
   - Sugerencias automáticas desplegables con miniatura, marca, nombre, familia olfativa y precio.
2. **Filtros Avanzados Olfativos**:
   - Familias: *Amaderado, Cítrico, Floral, Oriental, Fresco*.
   - Género: *Hombre, Mujer, Unisex*.
   - Deslizador de rango de precio y ordenamiento múltiple.
3. **Quiz / Test Interactivo "Encuentra tu Perfume Ideal"**:
   - Evaluación en 4 pasos (ocasión, intensidad, familia olfativa y destinatario).
   - Motor inteligente de afinidad que calcula un porcentaje de compatibilidad y recomienda el **TOP 3 de fragancias exactas**, con botón directo de *Agregar al Carrito*.
4. **Módulo de Muestras Gratis en Checkout (Cross-Selling / Fidelización)**:
   - Se activa al alcanzar el umbral mínimo de compra (\$50.00).
   - Sección interactiva **"Elige tus muestras aquí"**.
   - Validación estricta en tiempo real de **máximo 2 muestras de 2ml** gratuitas, con alerta visual inmediata si se intenta seleccionar una tercera.
5. **Resumen en Ticket Digital y Correo Electrónico**:
   - Generación de comprobante digital imprimible con desglose de productos y la sección destacada de muestras gratuitas a costo \$0.00.
   - Simulación de correo electrónico corporativo de confirmación de pedido con entrega estimada y muestras incluidas.
6. **Módulo de Identificación para Evidencias**:
   - Barra superior con marca de agua personalizable con Nombre Completo (Fabio) y RU/CI para capturas infalsificables.

---

## 🛠️ Stack Tecnológico

- **Backend**: Node.js, Express, Prisma ORM, CORS LAN, TypeScript.
- **Frontend**: React 18, Vite, TailwindCSS, Lucide Icons, TypeScript.
- **Base de Datos**: PostgreSQL 15 (Docker) / Prisma Client.
- **Despliegue & Red**: Docker Compose, soporte de IP en Red Local (LAN).

---

## 🚀 Guía Rápida de Despliegue

### Opción A: Despliegue con Docker Compose (Recomendado)

1. Abre tu terminal en la carpeta raíz del proyecto:
   ```bash
   cd venta-perfumes
   ```
2. Inicia los contenedores compilando los servicios:
   ```bash
   docker compose up --build
   ```
3. Accede a las aplicaciones:
   - **Frontend**: `http://localhost:5173` o `http://<TU_IP_LOCAL>:5173`
   - **Backend API**: `http://localhost:5000` o `http://<TU_IP_LOCAL>:5000/api`
   - **Healthcheck**: `http://localhost:5000/api/health`

---

### Opción B: Ejecución en Entorno Local (Modo Desarrollo)

#### 1. Backend:
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev
```

#### 2. Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 📡 Configuración para Red Local (LAN)

1. Identifica tu dirección IPv4 local ejecutando:
   - En Windows: `ipconfig` (ejemplo: `192.168.100.8`)
   - En Linux/macOS: `ip a` o `ifconfig`
2. En `frontend/.env`:
   ```env
   # Desarrollador: Fabio - Perfumería Fabio
   VITE_API_URL=http://<TU_IP_LOCAL>:5000/api
   ```
3. En `backend/.env`:
   ```env
   FRONTEND_URL=http://<TU_IP_LOCAL>:5173
   PORT=5000
   ```
4. Conéctate desde cualquier celular o PC en la misma red Wi-Fi ingresando a:
   `http://<TU_IP_LOCAL>:5173`

---

## 📷 Guía de Evidencias del Proyecto
Consulta el archivo [GUIA_EVIDENCIAS.md](./GUIA_EVIDENCIAS.md) para ver el procedimiento paso a paso para tomar las 5 capturas de pantalla de evidencia.
