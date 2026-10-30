import cors, { CorsOptions } from 'cors';

export const configureCors = (): ReturnType<typeof cors> => {
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ];

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (como curl, aplicaciones móviles o Postman)
      if (!origin) return callback(null, true);

      // Si está en la lista permitida o coincide con una IP de red local (192.168.x.x o 10.x.x.x o 172.x.x.x)
      const isLocalNetwork = /^http:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}):\d+$/.test(origin);

      if (allowedOrigins.includes(origin) || isLocalNetwork) {
        callback(null, true);
      } else {
        // En modo desarrollo de laboratorio, permitir el acceso con advertencia
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  return cors(corsOptions);
};
