import React, { useState } from 'react';
import { ShoppingBag, Star, Info, Check, PackageX, AlertTriangle } from 'lucide-react';
import { Product } from '../types';
import { formatBs, UPLOADS_BASE_URL } from '../services/httpClient';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const getAromaBadgeColor = (type: string) => {
    switch (type) {
      case 'Dulce': return 'bg-amber-950/70 text-amber-300 border-amber-800/60';
      case 'Floral': return 'bg-pink-950/70 text-pink-300 border-pink-800/60';
      case 'Amaderado': return 'bg-stone-900/80 text-amber-200 border-amber-900/60';
      case 'Cítrico': return 'bg-yellow-950/70 text-yellow-300 border-yellow-800/60';
      case 'Fresco': return 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60';
      case 'Ámbar': return 'bg-orange-950/70 text-orange-300 border-orange-800/60';
      case 'Especiado': return 'bg-red-950/70 text-red-300 border-red-800/60';
      case 'Oriental': return 'bg-purple-950/70 text-purple-300 border-purple-800/60';
      default: return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  const imageUrl = product.imageUrl.startsWith('/uploads')
    ? `${UPLOADS_BASE_URL}${product.imageUrl}`
    : product.imageUrl;

  return (
    <div
      onClick={() => onViewDetails && onViewDetails(product)}
      className="group relative bg-[#13131c] border border-gray-800/80 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/5 flex flex-col cursor-pointer"
    >
      {/* Contenedor de Imagen */}
      <div className="relative aspect-[4/5] overflow-hidden bg-black/40">
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
            isOutOfStock ? 'grayscale opacity-60' : ''
          }`}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13131c] via-transparent to-black/20" />

        {/* Badges superiores */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className={`text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full border backdrop-blur-md ${getAromaBadgeColor(product.aromaType)}`}>
            {product.aromaType}
          </span>
          <span className="text-[10px] font-medium text-gray-300 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-gray-700">
            {product.gender}
          </span>
        </div>

        {/* Indicador de Agotado o Stock Bajo */}
        {isOutOfStock ? (
          <div className="absolute top-3 right-11 px-2.5 py-1 rounded-full bg-red-950/90 border border-red-500 text-red-300 text-[10px] font-bold z-10 flex items-center gap-1 shadow-lg">
            <PackageX className="w-3 h-3" />
            <span>Perfumes agotados</span>
          </div>
        ) : isLowStock ? (
          <div className="absolute top-3 right-11 px-2 py-1 rounded-full bg-yellow-950/90 border border-yellow-500 text-yellow-300 text-[10px] font-bold z-10 flex items-center gap-1 shadow-lg">
            <AlertTriangle className="w-3 h-3" />
            <span>Quedan {product.stock}</span>
          </div>
        ) : null}

        {/* Botón de Pirámide Olfativa Rápida */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowNotes(!showNotes);
          }}
          title="Ver pirámide olfativa"
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-amber-500 hover:text-black text-gray-300 border border-gray-700 backdrop-blur-md transition-colors z-10"
        >
          <Info className="w-4 h-4" />
        </button>

        {/* Overlay de Pirámide Olfativa */}
        {showNotes && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 bg-black/90 backdrop-blur-md p-4 text-xs flex flex-col justify-center space-y-2.5 z-20 animate-fade-in text-gray-300"
          >
            <div className="flex justify-between items-center border-b border-gray-800 pb-1.5">
              <span className="font-serif font-bold text-amber-400">Pirámide Olfativa</span>
              <button onClick={() => setShowNotes(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300/80 block">Notas de Salida:</span>
              <p className="text-[11px] leading-snug">{product.topNotes}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300/80 block">Notas de Corazón:</span>
              <p className="text-[11px] leading-snug">{product.heartNotes}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300/80 block">Notas de Fondo:</span>
              <p className="text-[11px] leading-snug">{product.baseNotes}</p>
            </div>
            <div className="pt-1 text-[10px] text-gray-400">
              Concentración: <span className="text-white font-medium">{product.concentration || 'Eau de Parfum'}</span>
            </div>
          </div>
        )}

        {/* Volumen en ml */}
        <div className="absolute bottom-2 right-3 text-[11px] font-mono text-gray-400 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
          {product.volumeMl} ml
        </div>
      </div>

      {/* Contenido / Información */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-400/80 font-medium">
            {product.brand}
          </div>
          <h3 className="font-serif font-bold text-base text-gray-100 group-hover:text-amber-200 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Rating y Ocasión */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-800/60">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="font-semibold text-gray-200">{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-[11px] text-gray-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
            {product.occasion}
          </span>
        </div>

        {/* Precio en Bolivianos (Bs) y Botón de Compra */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Precio</span>
            <span className="text-base sm:text-lg font-bold font-mono text-amber-300">
              {formatBs(product.price)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
              isOutOfStock
                ? 'bg-gray-800/80 text-gray-500 cursor-not-allowed border border-gray-700'
                : isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-black hover:shadow-amber-500/20'
            }`}
          >
            {isOutOfStock ? (
              <span>Agotado</span>
            ) : isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Agregado!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Comprar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
