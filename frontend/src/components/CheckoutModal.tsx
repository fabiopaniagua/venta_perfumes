import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, CreditCard, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { httpClient, formatBs, UPLOADS_BASE_URL } from '../services/httpClient';
import { CartItem, Sample, Order } from '../types';
import { SamplePicker } from './SamplePicker';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  samples: Sample[];
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  samples,
  onOrderSuccess,
}) => {
  const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'QR' | 'CASH'>('CARD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const handleToggleSample = (sampleId: string) => {
    setSelectedSampleIds((prev) =>
      prev.includes(sampleId)
        ? prev.filter((id) => id !== sampleId)
        : [...prev, sampleId]
    );
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cartItems.length === 0) {
      setErrorMessage('Tu carrito de compras está vacío.');
      return;
    }

    if (!customerName.trim() || !customerEmail.trim() || !shippingAddress.trim()) {
      setErrorMessage('Por favor completa todos los campos requeridos (Nombre, Email y Dirección).');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || 'Sin teléfono',
        shippingAddress: shippingAddress.trim(),
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        sampleIds: selectedSampleIds,
      };

      const response = await httpClient.post<{ success: boolean; data: Order; message?: string }>(
        '/orders',
        payload
      );

      if (response.success && response.data) {
        onOrderSuccess(response.data);
      } else {
        setErrorMessage(response.message || 'Error al procesar el pedido');
      }
    } catch (err: any) {
      console.error('Error al confirmar pedido:', err);
      setErrorMessage(err.message || 'No se pudo conectar con el servidor. Revisa tu conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#111119] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          {/* Título */}
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
              Perfumería Fabio
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              Finalizar Compra & Carrito
            </h2>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-500 rounded-xl text-xs text-red-200">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Columna Izquierda: Carrito + Muestras */}
            <div className="lg:col-span-7 space-y-6">
              {/* Lista de Productos en el Carrito */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Perfumes Seleccionados ({cartItems.length})
                </h3>

                {cartItems.length === 0 ? (
                  <div className="p-8 text-center bg-gray-900/40 rounded-2xl border border-gray-800 text-gray-400 text-sm">
                    No tienes fragancias en el carrito aún.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div
                        key={item.product.id}
                        className="p-3 bg-gray-900/60 border border-gray-800 rounded-2xl flex items-center gap-3"
                      >
                        <img
                          src={
                            item.product.imageUrl.startsWith('/uploads')
                              ? `${UPLOADS_BASE_URL}${item.product.imageUrl}`
                              : item.product.imageUrl
                          }
                          alt={item.product.name}
                          className="w-14 h-14 object-cover rounded-xl border border-gray-700 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-amber-400/90 uppercase font-semibold block">
                            {item.product.brand}
                          </span>
                          <h4 className="text-xs font-bold text-white truncate">
                            {item.product.name}
                          </h4>
                          <span className="text-xs font-mono font-bold text-gray-300">
                            {formatBs(item.product.price)} c/u
                          </span>
                        </div>

                        {/* Modificador de Cantidad */}
                        <div className="flex items-center gap-1.5 bg-black/50 border border-gray-800 rounded-xl p-1 shrink-0">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-800 rounded-lg text-gray-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-800 rounded-lg text-gray-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Eliminar */}
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Módulo Especial de Muestras Gratis (Cross-Selling) */}
              <SamplePicker
                samples={samples}
                selectedSampleIds={selectedSampleIds}
                onToggleSample={handleToggleSample}
                subtotal={subtotal}
                threshold={50.0}
              />
            </div>

            {/* Columna Derecha: Formulario de Envío y Resumen */}
            <div className="lg:col-span-5 bg-[#161622] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between space-y-6">
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider pb-2 border-b border-gray-800">
                  Datos de Envío y Facturación
                </h3>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+591 70000000"
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Método de Pago</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="CARD">💳 Tarjeta Crédito</option>
                      <option value="QR">📱 Pago QR Simple</option>
                      <option value="CASH">💵 Contraentrega</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Dirección de Entrega *</label>
                  <textarea
                    rows={2}
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Calle, Edificio, Número y Ciudad"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                {/* Resumen de Montos */}
                <div className="pt-3 border-t border-gray-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal Perfumes:</span>
                    <span className="font-mono text-gray-200">{formatBs(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Muestras de Cortesía (2ml):</span>
                    <span className="font-mono text-amber-400 font-semibold">
                      {selectedSampleIds.length > 0 ? `${selectedSampleIds.length}x Gratis` : 'Bs 0,00'}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Envío Asegurado:</span>
                    <span className="text-emerald-400 font-semibold">Gratis</span>
                  </div>
                  <div className="flex justify-between text-base font-serif font-bold text-white pt-2 border-t border-gray-800">
                    <span>Total a Pagar:</span>
                    <span className="text-amber-300 font-mono text-xl">{formatBs(subtotal)}</span>
                  </div>
                </div>

                {/* Botón de Confirmación */}
                <button
                  type="submit"
                  disabled={isSubmitting || cartItems.length === 0}
                  className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${
                    isSubmitting || cartItems.length === 0
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:opacity-95 shadow-amber-500/20'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Procesando Pago y Generando Ticket...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Confirmar Compra ({formatBs(subtotal)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Transacción cifrada y protegida por Perfumería Fabio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
