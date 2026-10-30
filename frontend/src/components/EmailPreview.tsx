import React from 'react';
import { X, Mail, ShieldCheck, Gift, Package, ArrowLeft } from 'lucide-react';
import { Order } from '../types';
import { formatBs } from '../services/httpClient';

interface EmailPreviewProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onBackToReceipt: () => void;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({
  order,
  isOpen,
  onClose,
  onBackToReceipt,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#14141d] border border-gray-700 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Cabecera del Cliente de Correo Simulado */}
        <div className="bg-[#1b1b26] px-5 py-3 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Mail className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white">Bandeja de Entrada • Correo de Confirmación de Pedido</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToReceipt}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al Ticket
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metadatos del Mensaje */}
        <div className="p-4 bg-gray-900/50 border-b border-gray-800 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">De:</span>
            <span className="text-amber-300 font-medium">Perfumería Fabio &lt;pedidos@perfumeriafabio.com&gt;</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Para:</span>
            <span className="text-gray-200">{order.customerName} &lt;{order.customerEmail}&gt;</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Asunto:</span>
            <span className="text-white font-semibold">
              ¡Tu pedido #{order.orderNumber} está confirmado! Incluye tus muestras exclusivas de cortesía
            </span>
          </div>
        </div>

        {/* Cuerpo del Correo Electrónico con Plantilla Elegante */}
        <div className="p-6 space-y-6 text-gray-200 text-sm max-h-[70vh] overflow-y-auto">
          {/* Banner de Bienvenida */}
          <div className="text-center py-4 bg-gradient-to-b from-amber-950/40 to-transparent border border-amber-500/30 rounded-2xl space-y-1">
            <h2 className="text-xl font-serif font-bold text-amber-200">
              ¡Gracias por tu compra en Perfumería Fabio!
            </h2>
            <p className="text-xs text-gray-400">
              Estamos preparando tu envío con el mayor cuidado y empaque de lujo.
            </p>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            Estimado/a <strong>{order.customerName}</strong>,<br />
            Hemos recibido correctamente tu orden <strong className="text-amber-300">#{order.orderNumber}</strong>. A continuación encontrarás el resumen detallado de los productos adquiridos y las muestras de cortesía que viajarán contigo:
          </p>

          {/* Lista de Perfumes */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-400" /> Fragancias en tu Pedido
            </h4>
            <div className="bg-[#181824] rounded-xl p-3 divide-y divide-gray-800 text-xs">
              {order.items.map((item) => (
                <div key={item.id} className="py-2 first:pt-0 last:pb-0 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white">{item.product.name}</span>
                    <span className="text-[11px] text-gray-400 block">
                      {item.product.brand} ({item.product.volumeMl}ml) × {item.quantity}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-gray-200">
                    {formatBs(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECCIÓN ESPECIAL OBLIGATORIA: Muestras de Cortesía en el Correo */}
          <div className="p-4 bg-gradient-to-r from-amber-950/60 via-black to-amber-950/60 border border-amber-500/50 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-serif font-bold text-amber-300 flex items-center gap-1.5 uppercase">
                <Gift className="w-4 h-4 text-amber-400" /> Tus Muestras de Cortesía Incluidas
              </h4>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                Sin Costo (Bs 0,00)
              </span>
            </div>

            {order.samples && order.samples.length > 0 ? (
              <div className="space-y-2 pt-1">
                {order.samples.map((sampleItem, idx) => (
                  <div key={idx} className="bg-gray-900/80 p-2.5 rounded-xl border border-gray-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white">{sampleItem.sample.name}</span>
                      <span className="text-[10px] text-amber-400/80 block">
                        Familia Olfativa: {sampleItem.sample.aromaType} • Decant 2ml
                      </span>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold text-xs">
                      Bs 0,00
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No se incluyeron muestras en esta orden.</p>
            )}
          </div>

          {/* Resumen Total */}
          <div className="bg-[#181824] p-4 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal:</span>
              <span className="font-mono text-gray-200">{formatBs(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Envío Estándar Protegido:</span>
              <span className="text-emerald-400 font-medium">Gratis</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-gray-800">
              <span>Total Abonado:</span>
              <span className="text-amber-300 font-mono text-base">{formatBs(order.total)}</span>
            </div>
          </div>

          {/* Pie del Correo */}
          <div className="text-center pt-2 text-[11px] text-gray-400 space-y-1">
            <p>Dirección de Envío confirmada: <strong>{order.shippingAddress}</strong></p>
            <p className="text-gray-400">Perfumería Fabio • Plataforma de Comercio Electrónico</p>
          </div>
        </div>
      </div>
    </div>
  );
};
