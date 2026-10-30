import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Sparkles, User as UserIcon, X, Loader2, ShieldCheck } from 'lucide-react';
import { httpClient, formatBs, UPLOADS_BASE_URL } from '../services/httpClient';
import { Product, User } from '../types';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenQuiz: () => void;
  onOpenLogin: () => void;
  onOpenAdmin?: () => void;
  currentUser: User | null;
  onSelectProduct: (product: Product) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenQuiz,
  onOpenLogin,
  onOpenAdmin,
  currentUser,
  onSelectProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounce para búsqueda predictiva
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await httpClient.get<{ success: boolean; data: Product[] }>(
          `/products/search?q=${encodeURIComponent(searchTerm)}`
        );
        if (response.success) {
          setSearchResults(response.data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Error en búsqueda predictiva:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getProductImg = (url: string) => {
    if (!url) return '';
    return url.startsWith('/uploads') ? `${UPLOADS_BASE_URL}${url}` : url;
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-[#0f0f15]/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Marca / Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center text-black font-serif font-bold text-xl shadow-lg shadow-amber-500/20">
              F
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-serif font-bold tracking-widest bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent">
                FABIO
              </span>
              <span className="block text-[10px] tracking-[0.25em] text-amber-500/80 uppercase font-medium">
                Perfumería & Fragancias
              </span>
            </div>
          </div>

          {/* Barra de Búsqueda Predictiva en Tiempo Real */}
          <div ref={searchContainerRef} className="flex-1 max-w-md relative hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                placeholder="Buscar perfume, marca, notas olfativas..."
                className="w-full pl-10 pr-10 py-2.5 bg-gray-900/80 border border-gray-700/80 rounded-full text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/40 transition-all shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {isSearching && (
                <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 animate-spin" />
              )}
            </div>

            {/* Dropdown Predictivo Flotante */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#15151e] border border-gray-700/90 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in divide-y divide-gray-800">
                <div className="px-3 py-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider bg-gray-900/60">
                  Resultados sugeridos ({searchResults.length})
                </div>
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectProduct(item);
                      setShowDropdown(false);
                      setSearchTerm('');
                    }}
                    className="w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-amber-500/10 transition-colors group"
                  >
                    <img
                      src={getProductImg(item.imageUrl)}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-md border border-gray-700 group-hover:border-amber-500/50"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-amber-400/90 font-medium uppercase tracking-wider truncate">
                        {item.brand}
                      </div>
                      <div className="text-sm font-semibold text-white truncate group-hover:text-amber-200">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Familia: <span className="text-gray-300">{item.aromaType}</span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-amber-300 shrink-0 font-mono">
                      {formatBs(item.price)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Acciones del Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botón Administración de mi tienda (si es Admin) */}
            {isAdmin && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-xs sm:text-sm hover:opacity-95 shadow-md shadow-amber-500/20 transition-all animate-pulse"
                title="Ir a Administración de mi tienda"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Administración de mi tienda</span>
                <span className="sm:hidden">Admin</span>
              </button>
            )}

            {/* Botón Quiz "Encuentra tu Perfume" */}
            <button
              onClick={onOpenQuiz}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 hover:to-yellow-500/20 text-amber-300 border border-amber-500/40 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all shadow-sm shadow-amber-500/10 group"
            >
              <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Perfume Ideal</span>
            </button>

            {/* Carrito con Contador */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 text-gray-300 hover:text-white bg-gray-900/60 hover:bg-gray-800 rounded-full border border-gray-700 transition-colors"
              title="Finalizar compra / Ver Carrito"
            >
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Iniciar sesión / Perfil */}
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-700 bg-gray-900/60 hover:bg-gray-800 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors"
            >
              <UserIcon className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">
                {currentUser ? currentUser.name.split(' ')[0] : 'Iniciar sesión'}
              </span>
            </button>
          </div>
        </div>

        {/* Buscador en pantalla móvil */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar perfume, marca, notas..."
              className="w-full pl-9 pr-8 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
