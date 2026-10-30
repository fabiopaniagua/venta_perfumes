import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  PackageX,
  Eye,
  EyeOff,
  Plus,
  Minus,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { httpClient, formatBs, UPLOADS_BASE_URL } from '../../services/httpClient';
import { Product } from '../../types';

interface AdminInventoryProps {
  onOpenCreateModal: () => void;
  onOpenEditModal: (product: Product) => void;
  initialAvailabilityFilter?: string; // e.g. 'low_stock' o 'out_of_stock'
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({
  onOpenCreateModal,
  onOpenEditModal,
  initialAvailabilityFilter = 'all',
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAroma, setSelectedAroma] = useState('Todos');
  const [selectedGender, setSelectedGender] = useState('Todos');
  const [selectedAvailability, setSelectedAvailability] = useState(initialAvailabilityFilter);
  const [sortBy, setSortBy] = useState('newest');

  // Modal de confirmación para eliminar
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      // Solicitamos con includeAll=true para que el admin vea activos, borradores e inactivos
      const response = await httpClient.get<{ success: boolean; data: Product[] }>(
        '/products?includeAll=true'
      );
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (err: any) {
      console.error('Error al cargar inventario:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (initialAvailabilityFilter) {
      setSelectedAvailability(initialAvailabilityFilter);
    }
  }, [initialAvailabilityFilter]);

  // Actualización rápida de stock (+1 / -1)
  const handleQuickStockChange = async (productId: string, delta: number) => {
    try {
      const response = await httpClient.patch<{ success: boolean; data: Product; message: string }>(
        `/products/${productId}/stock`,
        { delta }
      );
      if (response.success && response.data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: response.data.stock } : p))
        );
        setActionMessage(response.message);
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Error al actualizar existencias.');
    }
  };

  // Alternar publicación (Activo / Inactivo)
  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const response = await httpClient.put<{ success: boolean; data: Product; message: string }>(
        `/products/${product.id}`,
        { status: newStatus }
      );
      if (response.success && response.data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
        );
        setActionMessage(
          newStatus === 'ACTIVE'
            ? `Perfume "${product.name}" ahora está publicado en la tienda.`
            : `Perfume "${product.name}" ha sido desactivado de la publicación.`
        );
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado.');
    }
  };

  // Confirmar eliminación o desactivación lógica
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const response = await httpClient.delete<{
        success: boolean;
        isLogicalDeactivation?: boolean;
        message: string;
      }>(`/products/${productToDelete.id}`);

      if (response.success) {
        if (response.isLogicalDeactivation) {
          // Desactivado lógicamente para proteger el historial de ventas
          setProducts((prev) =>
            prev.map((p) =>
              p.id === productToDelete.id ? { ...p, status: 'INACTIVE' } : p
            )
          );
        } else {
          // Eliminado físicamente de PostgreSQL
          setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        }
        setActionMessage(response.message);
        setTimeout(() => setActionMessage(null), 4000);
        setProductToDelete(null);
      }
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el producto.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrado y ordenamiento en cliente
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Búsqueda
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesAroma = p.aromaType.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesAroma) return false;
      }

      // Filtro por Aroma
      if (selectedAroma !== 'Todos' && !p.aromaType.toLowerCase().includes(selectedAroma.toLowerCase())) {
        return false;
      }

      // Filtro por Género
      if (selectedGender !== 'Todos' && p.gender !== selectedGender) {
        return false;
      }

      // Filtro por Disponibilidad
      if (selectedAvailability === 'available' && p.stock <= 0) return false;
      if (selectedAvailability === 'out_of_stock' && p.stock > 0) return false;
      if (selectedAvailability === 'low_stock' && (p.stock <= 0 || p.stock > (p.lowStockThreshold || 5))) return false;
      if (selectedAvailability === 'draft' && p.status !== 'DRAFT') return false;
      if (selectedAvailability === 'inactive' && p.status !== 'INACTIVE') return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'stock_desc') return b.stock - a.stock;
      if (sortBy === 'stock_asc') return a.stock - b.stock;
      return 0; // newest
    });
  }, [products, searchTerm, selectedAroma, selectedGender, selectedAvailability, sortBy]);

  const getStatusBadge = (p: Product) => {
    if (p.status === 'DRAFT') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
          Borrador
        </span>
      );
    }
    if (p.status === 'INACTIVE') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-700 text-gray-300 border border-gray-600">
          Inactivo
        </span>
      );
    }
    if (p.stock <= 0) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
          Perfumes agotados
        </span>
      );
    }
    if (p.stock <= (p.lowStockThreshold || 5)) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          Quedan pocas unidades
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
        Disponible
      </span>
    );
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/uploads') ? `${UPLOADS_BASE_URL}${url}` : url;
  };

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Control de Existencias
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-0.5">
            Inventario de perfumes
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Visualiza, edita y ajusta la cantidad disponible de cada fragancia en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchInventory}
            title="Recargar inventario"
            className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:opacity-95 text-black font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Agregar perfume</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-xs text-emerald-200 animate-fade-in flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-[#14141f] border border-gray-800/80 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Búsqueda */}
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar perfume por nombre o marca..."
              className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Filtro Disponibilidad */}
          <div className="sm:col-span-3">
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-2.5 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todas las existencias</option>
              <option value="available">🟢 Disponibles</option>
              <option value="low_stock">🟡 Quedan pocas unidades</option>
              <option value="out_of_stock">🔴 Perfumes agotados</option>
              <option value="draft">🔵 En Borrador</option>
              <option value="inactive">⚪ Inactivos</option>
            </select>
          </div>

          {/* Filtro Familia Olfativa */}
          <div className="sm:col-span-2">
            <select
              value={selectedAroma}
              onChange={(e) => setSelectedAroma(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-2.5 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-400"
            >
              <option value="Todos">Todos los aromas</option>
              <option value="Dulce">Dulce</option>
              <option value="Floral">Floral</option>
              <option value="Amaderado">Amaderado</option>
              <option value="Cítrico">Cítrico</option>
              <option value="Fresco">Fresco</option>
              <option value="Ámbar">Ámbar</option>
              <option value="Especiado">Especiado</option>
              <option value="Oriental">Oriental</option>
            </select>
          </div>

          {/* Ordenamiento */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-2.5 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-400"
            >
              <option value="newest">Más recientes</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
              <option value="stock_desc">Mayor cantidad disponible</option>
              <option value="stock_asc">Menor cantidad disponible</option>
            </select>
          </div>
        </div>

        {/* Resumen de conteo */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-800">
          <span>Mostrando {filteredProducts.length} de {products.length} perfumes registrados</span>
          {(searchTerm || selectedAroma !== 'Todos' || selectedAvailability !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedAroma('Todos');
                setSelectedGender('Todos');
                setSelectedAvailability('all');
              }}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Inventario Responsiva */}
      <div className="bg-[#12121b] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300 divide-y divide-gray-800">
            <thead className="bg-[#181824] text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Perfume</th>
                <th className="py-3 px-3">Familia / Tipo</th>
                <th className="py-3 px-3">Precio</th>
                <th className="py-3 px-3 text-center">Cantidad Disponible</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/70">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 space-y-2">
                    <PackageX className="w-8 h-8 mx-auto text-gray-600" />
                    <p className="text-sm font-medium">No se encontraron perfumes con los filtros seleccionados.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-900/40 transition-colors">
                    {/* Perfume (Foto + Nombre + Marca) */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(p.imageUrl)}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-xl border border-gray-700 bg-black/40 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider block truncate">
                            {p.brand}
                          </span>
                          <span className="font-serif font-bold text-white text-sm block truncate">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {p.volumeMl} ml • {p.gender}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Familia / Categoría */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <span className="text-gray-200 font-semibold block">{p.aromaType}</span>
                        <span className="text-[10px] text-gray-400 block">{p.category || 'Perfume'}</span>
                      </div>
                    </td>

                    {/* Precio en Bolivianos */}
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-amber-300 text-sm">
                        {formatBs(p.price)}
                      </span>
                    </td>

                    {/* Cantidad Disponible (Ajuste rápido +/-) */}
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleQuickStockChange(p.id, -1)}
                          disabled={p.stock <= 0}
                          title="Descontar 1 frasco"
                          className="p-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className={`w-8 text-center font-mono font-bold text-sm ${p.stock <= 0 ? 'text-red-400' : p.stock <= 5 ? 'text-yellow-300' : 'text-emerald-300'}`}>
                          {p.stock}
                        </span>

                        <button
                          onClick={() => handleQuickStockChange(p.id, 1)}
                          title="Añadir 1 frasco"
                          className="p-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-3">
                      {getStatusBadge(p)}
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Activar / Desactivar */}
                        <button
                          onClick={() => handleToggleStatus(p)}
                          title={p.status === 'ACTIVE' ? 'Desactivar publicación' : 'Activar publicación'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            p.status === 'ACTIVE'
                              ? 'bg-gray-900 border-gray-700 text-emerald-400 hover:bg-gray-800'
                              : 'bg-gray-900 border-gray-700 text-gray-500 hover:text-emerald-400'
                          }`}
                        >
                          {p.status === 'ACTIVE' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        {/* Modificar perfume */}
                        <button
                          onClick={() => onOpenEditModal(p)}
                          title="Modificar perfume"
                          className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 text-amber-300 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Eliminar perfume */}
                        <button
                          onClick={() => setProductToDelete(p)}
                          title="Eliminar perfume"
                          className="p-1.5 rounded-lg bg-gray-900 hover:bg-red-950/50 border border-gray-700 hover:border-red-600 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmación para Eliminar / Desactivar */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#13131c] border border-red-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/80 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-serif font-bold text-white">
                ¿Eliminar perfume del catálogo?
              </h3>
              <p className="text-xs text-gray-300">
                Estás a punto de eliminar <strong>"{productToDelete.name}"</strong> ({productToDelete.brand}).
              </p>
              <div className="mt-2 p-3 bg-black/40 rounded-xl border border-gray-800 text-[11px] text-gray-400 text-left">
                ℹ️ <strong>Nota de Seguridad:</strong> Si este perfume tiene pedidos asociados en el historial de ventas, el sistema lo <strong>desactivará lógicamente</strong> en lugar de borrarlo para conservar intacto el registro contable de las ventas anteriores.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/30"
              >
                {isDeleting ? 'Procesando...' : 'Eliminar perfume'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
