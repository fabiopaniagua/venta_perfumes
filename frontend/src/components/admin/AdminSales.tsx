import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  RefreshCw,
  Printer,
  Calendar,
  User as UserIcon,
  ShoppingBag,
  Gift,
  ExternalLink,
} from 'lucide-react';
import { httpClient, formatBs } from '../../services/httpClient';
import { Order } from '../../types';
import { DigitalReceipt } from '../DigitalReceipt';

export const AdminSales: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await httpClient.get<{ success: boolean; data: Order[] }>('/orders');
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (err: any) {
      console.error('Error al cargar ventas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.shippingAddress.toLowerCase().includes(q)
    );
  });

  const totalSalesBs = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Registro Contable
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-0.5">
            Mis ventas
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Historial de transacciones y pedidos completados en Perfumería Fabio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            title="Actualizar ventas"
            className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <div className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 rounded-xl text-right">
            <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Recaudado</span>
            <span className="text-base font-bold font-mono text-amber-300">{formatBs(totalSalesBs)}</span>
          </div>
        </div>
      </div>

      {/* Buscador de pedidos */}
      <div className="bg-[#14141f] border border-gray-800 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Nº de orden, cliente, correo o dirección..."
            className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <span className="text-xs text-gray-400">
          {orders.length} venta{orders.length !== 1 ? 's' : ''} registrada{orders.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Listado de Pedidos */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#12121b] border border-gray-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-900 flex items-center justify-center text-gray-500">
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-serif font-bold text-white">
            Todavía no existen ventas registradas
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Cuando los clientes realicen una compra desde el catálogo o finalicen su carrito, los pedidos aparecerán aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-[#13131c] border border-gray-800/80 hover:border-amber-500/30 rounded-2xl p-5 shadow-lg space-y-4 transition-all"
            >
              {/* Cabecera del Pedido */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-300 text-sm">
                        {order.orderNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {order.status || 'COMPLETADO'}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Monto Total</span>
                    <span className="text-lg font-serif font-bold font-mono text-amber-300">
                      {formatBs(order.total)}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedOrderForReceipt(order)}
                    className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-amber-300 border border-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Ver ticket oficial"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ver Ticket</span>
                  </button>
                </div>
              </div>

              {/* Datos del Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-black/30 p-3 rounded-xl border border-gray-800/60">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">Cliente:</span>
                  <span className="font-semibold text-gray-200">{order.customerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">Contacto:</span>
                  <span className="text-gray-300">{order.customerEmail} • {order.customerPhone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">Dirección de Entrega:</span>
                  <span className="text-gray-300 truncate block">{order.shippingAddress}</span>
                </div>
              </div>

              {/* Productos Vendidos */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  Fragancias Compradas:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-semibold text-white truncate">{item.product.name}</span>
                        <span className="text-[11px] text-gray-400 shrink-0">× {item.quantity}</span>
                      </div>
                      <span className="font-mono text-gray-200 font-bold shrink-0 ml-2">
                        {formatBs(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Muestras de Cortesía Incluidas */}
              {order.samples && order.samples.length > 0 && (
                <div className="pt-1 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 block mb-1">
                    🎁 Muestras de Cortesía Entregadas:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {order.samples.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200"
                      >
                        <Gift className="w-3 h-3 text-amber-400" />
                        <span>{s.sample.name} (2ml)</span>
                        <span className="text-emerald-400 font-bold font-mono">Bs 0,00</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Ticket Digital */}
      {selectedOrderForReceipt && (
        <DigitalReceipt
          order={selectedOrderForReceipt}
          onClose={() => setSelectedOrderForReceipt(null)}
          onOpenEmailPreview={() => {}}
        />
      )}
    </div>
  );
};
