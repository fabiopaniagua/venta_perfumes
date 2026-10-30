import { Router, Request, Response } from 'express';
import { upload } from '../config/upload';
import { requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', requireAdmin, upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se subió ningún archivo de imagen.',
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({
      success: true,
      message: 'Fotografía subida exitosamente.',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error: any) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al procesar la imagen.',
    });
  }
});

export default router;
