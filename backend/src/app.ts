import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { configureCors } from './config/cors';
import productRoutes from './routes/productRoutes';
import quizRoutes from './routes/quizRoutes';
import sampleRoutes from './routes/sampleRoutes';
import orderRoutes from './routes/orderRoutes';
import authRoutes from './routes/authRoutes';
import uploadRoutes from './routes/uploadRoutes';

dotenv.config();

const app: Application = express();

// Middlewares
app.use(configureCors());
app.use(express.json());

// Servir estáticamente las fotografías subidas en /uploads
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Endpoints Principales
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'Perfumería Fabio - Backend API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/products', productRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/samples', sampleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Manejo de rutas inexistentes
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Endpoint no encontrado' });
});

export default app;
