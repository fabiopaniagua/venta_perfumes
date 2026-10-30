import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('=====================================================');
  console.log(`🌸 Perfumería Fabio - Backend API Activo 🌸`);
  console.log(`🚀 Servidor ejecutándose en el puerto: ${PORT}`);
  console.log(`📡 URL Local: http://localhost:${PORT}`);
  console.log(`🩺 Healthcheck: http://localhost:${PORT}/api/health`);
  console.log('=====================================================');
});
