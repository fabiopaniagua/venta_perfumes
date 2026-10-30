import { Request, Response } from 'express';
import { prisma } from '../config/db';

interface QuizAnswers {
  occasion?: string;   // 'Diario', 'Citas / Noche', 'Fiesta', 'Formal'
  intensity?: string;  // 'Sutil', 'Moderada', 'Intensa'
  aromaType?: string;  // 'Amaderado', 'Cítrico', 'Floral', 'Oriental', 'Fresco', 'Dulce', 'Ámbar', 'Especiado'
  gender?: string;     // 'Hombre', 'Mujer', 'Unisex', 'Cualquiera'
}

export const recommendPerfumes = async (req: Request, res: Response) => {
  try {
    const answers: QuizAnswers = req.body || {};

    // Obtener únicamente productos ACTIVOS y con existencias disponibles
    const activeProducts = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        stock: { gt: 0 },
      },
    });

    if (activeProducts.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No hay perfumes activos con existencias disponibles en este momento.',
        data: [],
      });
    }

    // Algoritmo de afinidad olfativa con pesos calibrados
    const scoredProducts = activeProducts.map((product) => {
      let score = 50; // Puntuación base
      const matchReasons: string[] = [];

      // 1. Coincidencia por Familia Aromática (Peso: 25 puntos)
      if (
        answers.aromaType &&
        product.aromaType.toLowerCase().includes(answers.aromaType.toLowerCase())
      ) {
        score += 25;
        matchReasons.push(`Familia olfativa preferida: ${product.aromaType}`);
      }

      // 2. Coincidencia por Ocasión (Peso: 15 puntos)
      if (
        answers.occasion &&
        product.occasion.toLowerCase().includes(answers.occasion.toLowerCase())
      ) {
        score += 15;
        matchReasons.push(`Ocasión ideal: ${product.occasion}`);
      }

      // 3. Coincidencia por Intensidad/Estela (Peso: 10 puntos)
      if (
        answers.intensity &&
        product.intensity.toLowerCase().includes(answers.intensity.toLowerCase())
      ) {
        score += 10;
        matchReasons.push(`Intensidad de estela ${product.intensity}`);
      }

      // 4. Coincidencia por Género objetivo (Si no es 'Cualquiera')
      if (answers.gender && answers.gender !== 'Cualquiera') {
        if (
          product.gender.toLowerCase() === answers.gender.toLowerCase() ||
          product.gender === 'Unisex'
        ) {
          score += 10;
        } else {
          score -= 15;
        }
      }

      // Calificación general del perfume da puntos extra
      score += Math.round(product.rating * 2);

      // Limitar entre 68% y 99%
      const matchPercentage = Math.min(99, Math.max(68, score));

      return {
        product,
        matchPercentage,
        matchReasons:
          matchReasons.length > 0
            ? matchReasons
            : ['Excelente fijación y balance armónico de notas aromáticas'],
      };
    });

    // Ordenar de mayor a menor afinidad y seleccionar el TOP 3
    scoredProducts.sort((a, b) => b.matchPercentage - a.matchPercentage);
    const topRecommendations = scoredProducts.slice(0, 3);

    res.json({
      success: true,
      data: topRecommendations,
    });
  } catch (error) {
    console.error('Error al procesar el quiz:', error);
    res.status(500).json({ success: false, message: 'Error al procesar la recomendación olfativa' });
  }
};
