import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      aroma,
      gender,
      brand,
      status,
      availability,
      minPrice,
      maxPrice,
      search,
      sortBy,
      includeAll,
    } = req.query;

    const where: any = {};

    // Si no se pide explícitamente incluir todos los estados (panel admin),
    // el catálogo público solo muestra perfumes ACTIVOS
    if (includeAll === 'true') {
      if (status && typeof status === 'string' && status !== 'Todos') {
        where.status = status;
      }
    } else {
      where.status = 'ACTIVE';
    }

    // Filtro por Familia Olfativa / Aroma
    if (aroma && typeof aroma === 'string' && aroma !== 'Todos') {
      where.aromaType = { contains: aroma, mode: 'insensitive' };
    }

    // Filtro por Género / Público
    if (gender && typeof gender === 'string' && gender !== 'Todos') {
      where.gender = gender;
    }

    // Filtro por Marca
    if (brand && typeof brand === 'string' && brand !== 'Todos') {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    // Filtro por Disponibilidad de existencias
    if (availability === 'available') {
      where.stock = { gt: 0 };
    } else if (availability === 'out_of_stock') {
      where.stock = { lte: 0 };
    } else if (availability === 'low_stock') {
      where.stock = { gt: 0, lte: 5 };
    }

    // Filtro por Rango de Precio en Bs
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    // Búsqueda textual
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { aromaType: { contains: q, mode: 'insensitive' } },
        { topNotes: { contains: q, mode: 'insensitive' } },
        { heartNotes: { contains: q, mode: 'insensitive' } },
        { baseNotes: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Ordenamiento
    let orderBy: any = { isFeatured: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    if (sortBy === 'rating') orderBy = { rating: 'desc' };
    if (sortBy === 'newest') orderBy = { createdAt: 'desc' };
    if (sortBy === 'stock_desc') orderBy = { stock: 'desc' };
    if (sortBy === 'stock_asc') orderBy = { stock: 'asc' };

    const products = await prisma.product.findMany({
      where,
      orderBy,
    });

    res.json({
      success: true,
      total: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor al consultar productos' });
  }
};

export const searchPredictive = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim() === '') {
      return res.json({ success: true, data: [] });
    }

    const query = q.trim();

    const results = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
          { aromaType: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        brand: true,
        price: true,
        imageUrl: true,
        aromaType: true,
        gender: true,
        stock: true,
        volumeMl: true,
      },
      take: 6,
    });

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error en búsqueda predictiva:', error);
    res.status(500).json({ success: false, message: 'Error en búsqueda predictiva' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Perfume no encontrado' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error al obtener perfume por ID:', error);
    res.status(500).json({ success: false, message: 'Error al consultar perfume' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      brand,
      description,
      price,
      stock,
      imageUrl,
      aromaType,
      gender,
      occasion,
      intensity,
      topNotes,
      heartNotes,
      baseNotes,
      volumeMl,
      status,
      category,
      concentration,
      lowStockThreshold,
      isFeatured,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'El nombre del perfume es obligatorio.' });
    }
    if (!brand || !brand.trim()) {
      return res.status(400).json({ success: false, message: 'La marca es obligatoria.' });
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: 'El precio debe ser un número mayor o igual a 0.' });
    }
    if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ success: false, message: 'La cantidad disponible no puede ser negativa.' });
    }

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        brand: brand.trim(),
        description: description?.trim() || 'Fragancia exclusiva seleccionada por Perfumería Fabio.',
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        imageUrl: imageUrl?.trim() || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
        aromaType: aromaType?.trim() || 'Oriental',
        gender: gender?.trim() || 'Unisex',
        occasion: occasion?.trim() || 'Diario',
        intensity: intensity?.trim() || 'Moderada',
        topNotes: topNotes?.trim() || 'Notas aromáticas selectas',
        heartNotes: heartNotes?.trim() || 'Corazón floral o especiado',
        baseNotes: baseNotes?.trim() || 'Fondo amaderado o ambarado',
        volumeMl: volumeMl ? parseInt(volumeMl, 10) : 100,
        status: status === 'DRAFT' || status === 'INACTIVE' ? status : 'ACTIVE',
        category: category?.trim() || 'Perfumes',
        concentration: concentration?.trim() || 'Eau de Parfum',
        lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold, 10) : 5,
        rating: 4.8,
        isFeatured: Boolean(isFeatured),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Perfume registrado exitosamente en el inventario.',
      data: newProduct,
    });
  } catch (error) {
    console.error('Error al crear perfume:', error);
    res.status(500).json({ success: false, message: 'Error interno al registrar perfume.' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      brand,
      description,
      price,
      stock,
      imageUrl,
      aromaType,
      gender,
      occasion,
      intensity,
      topNotes,
      heartNotes,
      baseNotes,
      volumeMl,
      status,
      category,
      concentration,
      lowStockThreshold,
      isFeatured,
    } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'El perfume a editar no existe.' });
    }

    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
      return res.status(400).json({ success: false, message: 'El precio no puede ser negativo.' });
    }
    if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
      return res.status(400).json({ success: false, message: 'La cantidad disponible no puede ser negativa.' });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(brand && { brand: brand.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock, 10) }),
        ...(imageUrl && { imageUrl: imageUrl.trim() }),
        ...(aromaType && { aromaType: aromaType.trim() }),
        ...(gender && { gender: gender.trim() }),
        ...(occasion && { occasion: occasion.trim() }),
        ...(intensity && { intensity: intensity.trim() }),
        ...(topNotes && { topNotes: topNotes.trim() }),
        ...(heartNotes && { heartNotes: heartNotes.trim() }),
        ...(baseNotes && { baseNotes: baseNotes.trim() }),
        ...(volumeMl !== undefined && { volumeMl: parseInt(volumeMl, 10) }),
        ...(status && { status }),
        ...(category && { category: category.trim() }),
        ...(concentration && { concentration: concentration.trim() }),
        ...(lowStockThreshold !== undefined && { lowStockThreshold: parseInt(lowStockThreshold, 10) }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
      },
    });

    res.json({
      success: true,
      message: 'Perfume actualizado exitosamente.',
      data: updated,
    });
  } catch (error) {
    console.error('Error al actualizar perfume:', error);
    res.status(500).json({ success: false, message: 'Error interno al actualizar perfume.' });
  }
};

export const updateProductStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stock, delta } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Perfume no encontrado.' });
    }

    let newStock = existing.stock;
    if (stock !== undefined) {
      newStock = parseInt(stock, 10);
    } else if (delta !== undefined) {
      newStock += parseInt(delta, 10);
    }

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad disponible no puede ser menor a cero.',
      });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { stock: newStock },
    });

    res.json({
      success: true,
      message: `Existencias actualizadas: ${updated.name} ahora tiene ${updated.stock} unidades disponibles.`,
      data: updated,
    });
  } catch (error) {
    console.error('Error al actualizar existencias:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar existencias.' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Perfume no encontrado.' });
    }

    // Si tiene ventas asociadas en OrderItem, realizamos DESACTIVACIÓN LÓGICA
    // para proteger la integridad histórica de pedidos y clientes
    if (existing._count.orderItems > 0) {
      const deactivated = await prisma.product.update({
        where: { id },
        data: { status: 'INACTIVE' },
      });

      return res.json({
        success: true,
        isLogicalDeactivation: true,
        message: `El perfume "${existing.name}" tiene ${existing._count.orderItems} ventas históricas asociadas. Se ha desactivado de la publicación para proteger el historial de ventas.`,
        data: deactivated,
      });
    }

    // Si no tiene ventas, se puede eliminar físicamente de manera segura
    await prisma.product.delete({
      where: { id },
    });

    res.json({
      success: true,
      isLogicalDeactivation: false,
      message: `Perfume "${existing.name}" eliminado del catálogo exitosamente.`,
    });
  } catch (error) {
    console.error('Error al eliminar perfume:', error);
    res.status(500).json({ success: false, message: 'Error interno al eliminar el perfume.' });
  }
};

export const getAdminStats = async (_req: Request, res: Response) => {
  try {
    const totalPerfumes = await prisma.product.count();
    const activePerfumes = await prisma.product.count({ where: { status: 'ACTIVE' } });
    const draftPerfumes = await prisma.product.count({ where: { status: 'DRAFT' } });
    const inactivePerfumes = await prisma.product.count({ where: { status: 'INACTIVE' } });

    // Perfumes agotados (stock <= 0)
    const outOfStockPerfumes = await prisma.product.count({
      where: { stock: { lte: 0 } },
    });

    // Perfumes con stock bajo (stock > 0 y stock <= 5)
    const lowStockPerfumes = await prisma.product.count({
      where: { stock: { gt: 0, lte: 5 } },
    });

    // Unidades totales disponibles para vender (suma de stock en productos activos)
    const availableUnitsSum = await prisma.product.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { stock: true },
    });
    const totalUnitsAvailable = availableUnitsSum._sum.stock || 0;

    // Métricas de ventas
    const totalOrders = await prisma.order.count();
    const totalRevenueSum = await prisma.order.aggregate({
      _sum: { total: true },
    });
    const totalRevenueBs = totalRevenueSum._sum.total || 0;

    res.json({
      success: true,
      data: {
        totalPerfumes,
        activePerfumes,
        draftPerfumes,
        inactivePerfumes,
        outOfStockPerfumes,
        lowStockPerfumes,
        totalUnitsAvailable,
        totalOrders,
        totalRevenueBs,
        currency: 'Bs',
      },
    });
  } catch (error) {
    console.error('Error al calcular estadísticas:', error);
    res.status(500).json({ success: false, message: 'Error al consultar estadísticas del panel' });
  }
};

export const getStoreSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.storeSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    res.json({ success: true, data: settingsMap });
  } catch (error) {
    console.error('Error al consultar configuraciones:', error);
    res.status(500).json({ success: false, message: 'Error al consultar configuraciones' });
  }
};

export const updateStoreSettings = async (req: Request, res: Response) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Datos de configuración inválidos' });
    }

    for (const [key, value] of Object.entries(settings)) {
      await prisma.storeSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    res.json({ success: true, message: 'Configuración actualizada exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar configuración' });
  }
};
