import React from 'react';
import { Printer, Mail, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { Order } from '../types';
import { formatBs } from '../services/httpClient';

interface DigitalReceiptProps {
  order: Order;
  onClose: () => void;
  onOpenEmailPreview: () => void;
}

export const DigitalReceipt: React.FC<DigitalReceiptProps> = ({
  order,
  onClose,
  onOpenEmailPreview,
}) => {
  const studentName = localStorage.getItem('fabio_student_name') || 'Fabio';
  const studentRu = localStorage.getItem('fabio_student_ru') || 'RU-1002345 / CI-9876543';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0f0f16] border border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl my-6 text-gray-100">
        {/* Acciones Superiores */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800 print:hidden">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> Pago Confirmado con Éxito
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenEmailPreview}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
            >
              <Mail className="w-3.5 h-3.5" /> Ver Correo Enviado
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir Ticket
            </button>
          </div>
        </div>

        {/* Contenido Imprimible del Ticket Digital */}
        <div className="pt-4 space-y-5 print:p-0">
          {/* Encabezado del Comercio */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-serif font-bold tracking-widest text-amber-300">
              PERFUMERÍA FABIO
            </h2>
            <p className="text-xs text-gray-400">
              Boutique de Fragancias & Alta Perfumería • Comprobante Oficial
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-amber-500/30 text-[11px] text-amber-200 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Verificación: {studentName} ({studentRu})</span>
            </div>
          </div>

          {/* Metadatos de la Orden */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-800 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase">Nº de Ticket / Pedido</span>
              <strong className="font-mono text-amber-300 text-sm">{order.orderNumber}</strong>
            </div>
            <div className="text-right">
              <span className="text-gray-400 block text-[10px] uppercase">Fecha y Hora</span>
              <span className="text-gray-200">{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase">Cliente</span>
              <span className="font-semibold text-gray-100">{order.customerName}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-400 block text-[10px] uppercase">Email / Contacto</span>
              <span className="text-gray-300">{order.customerEmail}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-gray-800">
              <span className="text-gray-400 block text-[10px] uppercase">Dirección de Entrega</span>
              <span className="text-gray-200">{order.shippingAddress}</span>
            </div>
          </div>

          {/* Desglose de Productos Comprados */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Fragancias Adquiridas
            </h4>
            <div className="space-y-2 divide-y divide-gray-800/80">
              {order.items.map((item) => (
                <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex-1">
                    <span className="font-bold text-white">{item.product.name}</span>
                    <span className="text-gray-400 block text-[11px]">
                      {item.product.brand} • {item.product.volumeMl}ml (Cant: {item.quantity})
                    </span>
                  </div>
                  <div className="text-right font-mono font-bold text-gray-200">
                    {formatBs(item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECCIÓN ESPECIAL OBLIGATORIA: Muestras de Cortesía en el Ticket */}
          <div className="p-4 bg-gradient-to-r from-amber-950/40 via-[#1a1712] to-amber-950/40 border border-amber-500/40 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <span>🎁 Muestras de Cortesía Seleccionadas (2ml)</span>
              </h4>
              <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded">
                Cortesía Bs 0,00
              </span>
            </div>

            {order.samples && order.samples.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                {order.samples.map((sampleItem, index) => (
                  <div
                    key={sampleItem.id || index}
                    className="flex items-center justify-between text-xs bg-black/40 px-3 py-2 rounded-lg border border-amber-500/20"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div>
                        <span className="font-bold text-amber-100">{sampleItem.sample.name}</span>
                        <span className="text-[10px] text-gray-400 block">
                          Familia {sampleItem.sample.aromaType} • Decant Oficial de 2ml
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-amber-400 text-xs">
                      Bs 0,00
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 italic">
                No se seleccionaron muestras de cortesía para este pedido.
              </div>
            )}
          </div>

          {/* Totales y QR */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <QrCode className="w-12 h-12 text-gray-400 bg-white p-1 rounded-lg" />
              <div className="text-[10px] text-gray-400 leading-tight">
                <span>Comprobante Digital Válido</span><br />
                <span className="font-mono text-gray-300">Autenticidad Perfumería Fabio</span>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-xs text-gray-400">
                Subtotal: <span className="font-mono">{formatBs(order.subtotal)}</span>
              </div>
              <div className="text-xs text-amber-400">
                Muestras (2ml): <span className="font-mono font-bold">GRATIS</span>
              </div>
              <div className="text-lg font-serif font-bold text-amber-300">
                Total Pagado: <span className="font-mono font-sans font-bold">{formatBs(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Pie del Ticket */}
          <div className="text-center pt-3 border-t border-gray-800/60 text-[10px] text-gray-500">
            Gracias por confiar en Perfumería Fabio. Conserva este comprobante digital.
          </div>
        </div>

        {/* Botón de Cerrar */}
        <div className="pt-4 text-center print:hidden">
          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 py-2.5 rounded-xl text-xs font-semibold transition-colors"
          >
            Volver a la Tienda
          </button>
        </div>
      </div>
    </div>
  );
};
