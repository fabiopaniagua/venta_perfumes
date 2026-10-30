import React, { useEffect, useState } from 'react';
import {
  Boxes,
  CheckCircle,
  PackageX,
  AlertTriangle,
  Receipt,
  DollarSign,
  PlusCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { httpClient, formatBs } from '../../services/httpClient';
import { AdminStats } from '../../types';
import { AdminView } from './AdminLayout';

interface AdminDashboardProps {
  onNavigate: (view: AdminView) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await httpClient.get<{ success: boolean; data: AdminStats }>('/products/stats');
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err: any) {
      console.error('Error al cargar métricas del panel:', err);
      setError(err.message || 'No se pudieron cargar las estadísticas reales de la base de datos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Resumen General
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-0.5">
            Inicio - Administración de mi tienda
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Métricas obtenidas en tiempo real de tu base de datos PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            title="Actualizar datos"
            className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => onNavigate('create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:opacity-95 text-black font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Agregar perfume</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/70 border border-red-500/80 rounded-2xl text-xs text-red-200">
          {error}
        </div>
      )}

      {/* Grid con las 6 Métricas Obligatorias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* 1. Perfumes registrados */}
        <div
          onClick={() => onNavigate('inventory')}
          className="p-5 bg-[#14141f] border border-gray-800/80 hover:border-amber-500/40 rounded-2xl shadow-xl transition-all hover:shadow-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              1. Perfumes Registrados
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-serif font-bold text-white">
              {isLoading ? '...' : stats?.totalPerfumes ?? 0}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {stats?.activePerfumes ?? 0} activos • {stats?.draftPerfumes ?? 0} en borrador
            </p>
          </div>
        </div>

        {/* 2. Unidades disponibles para vender */}
        <div
          onClick={() => onNavigate('inventory')}
          className="p-5 bg-[#14141f] border border-gray-800/80 hover:border-emerald-500/40 rounded-2xl shadow-xl transition-all hover:shadow-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              2. Cantidad Disponible
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-serif font-bold text-emerald-300">
              {isLoading ? '...' : stats?.totalUnitsAvailable ?? 0}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Unidades físicas totales listas para entregar
            </p>
          </div>
        </div>

        {/* 3. Perfumes agotados */}
        <div
          onClick={() => onNavigate('out_of_stock')}
          className="p-5 bg-[#14141f] border border-gray-800/80 hover:border-red-500/40 rounded-2xl shadow-xl transition-all hover:shadow-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              3. Perfumes Agotados
            </span>
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
              <PackageX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-serif font-bold text-red-400">
              {isLoading ? '...' : stats?.outOfStockPerfumes ?? 0}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {stats?.outOfStockPerfumes && stats.outOfStockPerfumes > 0
                ? 'Requieren reposición de existencias'
                : 'No tienes perfumes agotados en este momento'}
            </p>
          </div>
        </div>

        {/* 4. Quedan pocas unidades (Stock bajo) */}
        <div
          onClick={() => onNavigate('low_stock')}
          className="p-5 bg-[#14141f] border border-gray-800/80 hover:border-amber-500/40 rounded-2xl shadow-xl transition-all hover:shadow-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              4. Quedan Pocas Unidades
            </span>
            <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-serif font-bold text-yellow-300">
              {isLoading ? '...' : stats?.lowStockPerfumes ?? 0}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Perfumes con 5 o menos frascos disponibles
            </p>
          </div>
        </div>

        {/* 5. Ventas realizadas */}
        <div
          onClick={() => onNavigate('sales')}
          className="p-5 bg-[#14141f] border border-gray-800/80 hover:border-cyan-500/40 rounded-2xl shadow-xl transition-all hover:shadow-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              5. Mis Ventas Realizadas
            </span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-serif font-bold text-cyan-300">
              {isLoading ? '...' : stats?.totalOrders ?? 0}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {stats?.totalOrders && stats.totalOrders > 0
                ? 'Pedidos confirmados y procesados'
                : 'Todavía no se han registrado ventas'}
            </p>
          </div>
        </div>

        {/* 6. Dinero vendido (Total en Bs) */}
        <div
          onClick={() => onNavigate('sales')}
          className="p-5 bg-[#14141f] border border-gray-800/80 hover:border-amber-400/40 rounded-2xl shadow-xl transition-all hover:shadow-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              6. Total Recaudado (Ventas)
            </span>
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-600/20 to-yellow-400/20 text-amber-300 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-serif font-bold font-mono text-amber-300 truncate">
              {isLoading ? '...' : formatBs(stats?.totalRevenueBs ?? 0)}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {stats?.totalRevenueBs && stats.totalRevenueBs > 0
                ? 'Ingresos totales por pedidos en bolivianos'
                : 'Todavía no existen ingresos por ventas'}
            </p>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos y Ayuda */}
      <div className="p-6 bg-gradient-to-br from-[#161622] to-[#12121b] border border-gray-800 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-base">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Acciones Rápidas para el Administrador</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Desde aquí puedes agregar nuevos perfumes al catálogo de <strong>Perfumería Fabio</strong>, actualizar la cantidad disponible físicamente en la tienda o revisar los pedidos generados.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={() => onNavigate('create')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Agregar perfume</span>
          </button>

          <button
            onClick={() => onNavigate('inventory')}
            className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-200 text-xs font-semibold border border-gray-700 flex items-center gap-2 transition-colors"
          >
            <Boxes className="w-4 h-4 text-amber-400" />
            <span>Inventario de perfumes</span>
          </button>

          <button
            onClick={() => onNavigate('sales')}
            className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-200 text-xs font-semibold border border-gray-700 flex items-center gap-2 transition-colors"
          >
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>Ver mis ventas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
