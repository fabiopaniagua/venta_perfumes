import { Request, Response } from 'express';
import { prisma } from '../config/db';

const MINIMUM_FREE_SAMPLE_THRESHOLD_BS = 50.0; // Umbral mínimo de compra en Bs para muestras de cortesía

export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      sampleIds = [],
    } = req.body;

    if (!customerName || !customerEmail || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Datos de pedido incompletos. Se requiere nombre, correo y al menos un perfume seleccionado.',
      });
    }

    // Validación estricta del límite de muestras gratuitas (Máximo 2)
    if (sampleIds && Array.isArray(sampleIds) && sampleIds.length > 2) {
      return res.status(400).json({
        success: false,
        message: 'Límite excedido: Solo está permitido un máximo de 2 muestras de cortesía por pedido.',
      });
    }

    // Ejecutar verificación y registro en transacción atómica de PostgreSQL
    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const validatedItems: {
        productId: string;
        name: string;
        quantity: number;
        unitPrice: number;
      }[] = [];

      // 1. Verificación de existencia y existencias disponibles para cada producto
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`El perfume seleccionado ya no está disponible en la tienda.`);
        }

        if (product.status !== 'ACTIVE') {
          throw new Error(`El perfume "${product.name}" se encuentra inactivo para la venta.`);
        }

        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);

        if (product.stock < qty) {
          throw new Error(
            `Existencias insuficientes para "${product.name}". Solicitaste ${qty} unidad(es), pero solo quedan ${product.stock} disponibles.`
          );
        }

        const itemTotal = product.price * qty;
        subtotal += itemTotal;

        validatedItems.push({
          productId: product.id,
          name: product.name,
          quantity: qty,
          unitPrice: product.price,
        });
      }

      // 2. Validar umbral de muestras de cortesía
      if (sampleIds.length > 0 && subtotal < MINIMUM_FREE_SAMPLE_THRESHOLD_BS) {
        throw new Error(
          `El pedido debe ser mayor o igual a Bs ${MINIMUM_FREE_SAMPLE_THRESHOLD_BS.toFixed(2)} para incluir muestras de cortesía.`
        );
      }

      // Validar existencias de muestras
      for (const sId of sampleIds) {
        const sample = await tx.sample.findUnique({ where: { id: sId } });
        if (!sample || sample.stock < 1) {
          throw new Error(`La muestra de cortesía seleccionada ya no tiene existencias disponibles.`);
        }
      }

      const total = subtotal; // Envío asegurado de lujo incluido en Bs
      const orderNumber = `PF-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      // 3. Crear el registro oficial de la venta en PostgreSQL
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone?.trim() || 'Sin teléfono',
          shippingAddress: shippingAddress?.trim() || 'Retiro en tienda central',
          subtotal,
          total,
          status: 'COMPLETADO',
          items: {
            create: validatedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
          samples: {
            create: (sampleIds as string[]).map((sampleId) => ({
              sampleId,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          samples: {
            include: {
              sample: true,
            },
          },
        },
      });

      // 4. Descontar las unidades vendidas del inventario en la misma transacción atómica
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      for (const sId of sampleIds) {
        await tx.sample.update({
          where: { id: sId },
          data: { stock: { decrement: 1 } },
        });
      }

      return order;
    });

    res.status(201).json({
      success: true,
      message: 'Venta procesada exitosamente y stock descontado del inventario.',
      data: result,
    });
  } catch (error: any) {
    console.error('Error al procesar orden de venta:', error.message || error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error interno al procesar el pedido. No se realizaron cargos ni descuentos de stock.',
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        samples: {
          include: {
            sample: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden de venta no encontrada' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error al consultar orden:', error);
    res.status(500).json({ success: false, message: 'Error al consultar la orden' });
  }
};

export const getOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        samples: {
          include: {
            sample: true,
          },
        },
      },
    });

    res.json({
      success: true,
      total: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Error al consultar órdenes:', error);
    res.status(500).json({ success: false, message: 'Error al consultar órdenes' });
  }
};
