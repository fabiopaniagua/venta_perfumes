import React, { useState } from 'react';
import {
  LayoutDashboard,
  Boxes,
  PlusCircle,
  Tag,
  Receipt,
  AlertTriangle,
  PackageX,
  Settings,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { User } from '../../types';

export type AdminView =
  | 'dashboard'
  | 'inventory'
  | 'create'
  | 'categories'
  | 'sales'
  | 'low_stock'
  | 'out_of_stock'
  | 'settings';

interface AdminLayoutProps {
  currentView: AdminView;
  onSelectView: (view: AdminView) => void;
  onBackToStore: () => void;
  onLogout: () => void;
  currentUser: User | null;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentView,
  onSelectView,
  onBackToStore,
  onLogout,
  currentUser,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard' as AdminView, label: 'Inicio', icon: LayoutDashboard },
    { id: 'inventory' as AdminView, label: 'Inventario de perfumes', icon: Boxes },
    { id: 'create' as AdminView, label: 'Agregar perfume', icon: PlusCircle, highlight: true },
    { id: 'categories' as AdminView, label: 'Tipos de perfumes', icon: Tag },
    { id: 'sales' as AdminView, label: 'Mis ventas', icon: Receipt },
    { id: 'low_stock' as AdminView, label: 'Quedan pocas unidades', icon: AlertTriangle },
    { id: 'out_of_stock' as AdminView, label: 'Perfumes agotados', icon: PackageX },
    { id: 'settings' as AdminView, label: 'Configuración de mi tienda', icon: Settings },
  ];

  const handleSelect = (view: AdminView) => {
    onSelectView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex flex-col md:flex-row">
      {/* Barra Superior Móvil */}
      <div className="md:hidden bg-[#12121b] border-b border-gray-800 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 text-black font-serif font-bold flex items-center justify-center text-sm shadow">
            F
          </div>
          <div>
            <h1 className="text-xs font-serif font-bold text-amber-200 tracking-wider">
              ADMINISTRACIÓN - PERFUMERÍA FABIO
            </h1>
            <span className="text-[10px] text-gray-400">Control de mi tienda</span>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-300"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Menú Lateral (Desktop & Móvil desplegable) */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-72 bg-[#101018] border-r border-gray-800 flex flex-col justify-between transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Encabezado del Menú Lateral */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 text-black font-serif font-bold text-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                F
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Panel Privado
                </span>
                <h2 className="text-sm font-serif font-bold text-white tracking-wide leading-tight">
                  ADMINISTRACIÓN
                </h2>
                <span className="text-[11px] text-gray-400 block font-serif">
                  Perfumería Fabio
                </span>
              </div>
            </div>
            <div className="pt-2">
              <span className="text-[11px] text-gray-400 bg-gray-900/80 px-2.5 py-1 rounded-full border border-gray-800 flex items-center gap-1.5 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{currentUser ? currentUser.name : 'Administrador'}</span>
              </span>
            </div>
          </div>

          {/* Lista de Navegación (8 Secciones en Terminología Boliviana) */}
          <nav className="space-y-1 text-xs">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/10 font-bold'
                      : item.highlight
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-gray-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Acciones del Fondo del Menú */}
        <div className="p-4 border-t border-gray-800 space-y-2 bg-[#0c0c13]">
          <button
            onClick={onBackToStore}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-200 text-xs font-semibold border border-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Volver a la tienda</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-medium border border-red-800/50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal de Administración */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};
