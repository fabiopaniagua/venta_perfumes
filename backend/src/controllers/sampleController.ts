import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getSamples = async (req: Request, res: Response) => {
  try {
    const samples = await prisma.sample.findMany({
      where: {
        isAvailable: true,
        stock: { gt: 0 },
      },
      orderBy: {
        brand: 'asc',
      },
    });

    res.json({
      success: true,
      data: samples,
    });
  } catch (error) {
    console.error('Error al obtener muestras gratuitas:', error);
    res.status(500).json({ success: false, message: 'Error al consultar muestras' });
  }
};
