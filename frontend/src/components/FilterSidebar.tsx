import React from 'react';
import { SlidersHorizontal, RotateCcw, Sparkles, Filter } from 'lucide-react';
import { formatBs } from '../services/httpClient';

interface FilterSidebarProps {
  selectedAroma: string;
  onSelectAroma: (aroma: string) => void;
  selectedGender: string;
  onSelectGender: (gender: string) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  selectedAvailability: string;
  onSelectAvailability: (availability: string) => void;
  availableBrands: string[];
  maxPrice: number;
  onChangeMaxPrice: (price: number) => void;
  sortBy: string;
  onChangeSortBy: (sort: string) => void;
  onResetFilters: () => void;
}

const aromaTypes = [
  { label: 'Todos', value: 'Todos', icon: '✨' },
  { label: 'Dulce', value: 'Dulce', icon: '🍯', desc: 'Vainilla, cacao y caramelo' },
  { label: 'Floral', value: 'Floral', icon: '🌸', desc: 'Rosas, jazmín y nardos' },
  { label: 'Amaderado', value: 'Amaderado', icon: '🪵', desc: 'Oud, cedro y sándalo' },
  { label: 'Cítrico', value: 'Cítrico', icon: '🍋', desc: 'Bergamota, lima y limón' },
  { label: 'Fresco', value: 'Fresco', icon: '🌊', desc: 'Acuático y lavanda limpia' },
  { label: 'Ámbar', value: 'Ámbar', icon: '🏺', desc: 'Ámbar gris y resinas' },
  { label: 'Especiado', value: 'Especiado', icon: '🌶️', desc: 'Canela, azafrán y pimienta' },
  { label: 'Oriental', value: 'Oriental', icon: '👑', desc: 'Incienso noble y benjuí' },
];

const genders = [
  { label: 'Todos', value: 'Todos' },
  { label: 'Hombre', value: 'Hombre' },
  { label: 'Mujer', value: 'Mujer' },
  { label: 'Unisex', value: 'Unisex' },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedAroma,
  onSelectAroma,
  selectedGender,
  onSelectGender,
  selectedBrand,
  onSelectBrand,
  selectedAvailability,
  onSelectAvailability,
  availableBrands = [],
  maxPrice,
  onChangeMaxPrice,
  sortBy,
  onChangeSortBy,
  onResetFilters,
}) => {
  return (
    <aside className="w-full lg:w-72 bg-[#12121b] border border-gray-800/90 rounded-2xl p-5 shadow-xl space-y-5 shrink-0 h-fit sticky top-28">
      {/* Header del Filtro con Terminología Boliviana */}
      <div className="flex items-center justify-between pb-3.5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-400" />
          <h2 className="font-semibold text-gray-100 text-xs tracking-wider uppercase">
            Buscar y seleccionar
          </h2>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-gray-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
          title="Reiniciar todos los filtros"
        >
          <RotateCcw className="w-3 h-3" /> Limpiar
        </button>
      </div>

      {/* Ordenar por */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
          Ordenar Por
        </label>
        <select
          value={sortBy}
          onChange={(e) => onChangeSortBy(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-400"
        >
          <option value="featured">✨ Más Destacados</option>
          <option value="price_asc">💵 Precio: Menor a Mayor</option>
          <option value="price_desc">💎 Precio: Mayor a Menor</option>
          <option value="rating">⭐ Mayor Calificación</option>
          <option value="newest">🆕 Novedades</option>
        </select>
      </div>

      {/* Disponibilidad */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
          Disponibilidad
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onSelectAvailability('all')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border text-center transition-all ${
              selectedAvailability === 'all'
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                : 'bg-gray-900/40 border-gray-800 text-gray-300 hover:bg-gray-800'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => onSelectAvailability('available')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border text-center transition-all ${
              selectedAvailability === 'available'
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold'
                : 'bg-gray-900/40 border-gray-800 text-gray-300 hover:bg-gray-800'
            }`}
          >
            Disponibles
          </button>
        </div>
      </div>

      {/* Filtro por Marca */}
      {availableBrands.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Marca
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => onSelectBrand(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-400"
          >
            <option value="Todos">Todas las marcas</option>
            {availableBrands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      )}

      {/* Familia Olfativa (Las 8 familias requeridas) */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block flex items-center justify-between">
          <span>Familia Olfativa</span>
          <Sparkles className="w-3 h-3 text-amber-400" />
        </label>
        <div className="grid grid-cols-1 gap-1 max-h-56 overflow-y-auto pr-1">
          {aromaTypes.map((aroma) => {
            const isSelected = selectedAroma === aroma.value;
            return (
              <button
                key={aroma.value}
                onClick={() => onSelectAroma(aroma.value)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all text-left border ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm font-semibold'
                    : 'bg-gray-900/40 border-gray-800/80 text-gray-300 hover:bg-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{aroma.icon}</span>
                  <span>{aroma.label}</span>
                </div>
                {aroma.desc && (
                  <span className="text-[9px] text-gray-400 truncate max-w-[100px]">
                    {aroma.desc}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Público / Género */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
          Público Recomendado
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {genders.map((g) => {
            const isSelected = selectedGender === g.value;
            return (
              <button
                key={g.value}
                onClick={() => onSelectGender(g.value)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-center border ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                    : 'bg-gray-900/40 border-gray-800 text-gray-300 hover:bg-gray-800'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rango de Precios en Bolivianos */}
      <div className="space-y-2 pt-2 border-t border-gray-800">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-400 uppercase tracking-wider">Precio Máximo</span>
          <span className="text-amber-400 font-bold font-mono text-xs">{formatBs(maxPrice)}</span>
        </div>
        <input
          type="range"
          min="100"
          max="3000"
          step="50"
          value={maxPrice}
          onChange={(e) => onChangeMaxPrice(Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer bg-gray-700 h-1.5 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
          <span>Bs 100</span>
          <span>Bs 1.500</span>
          <span>Bs 3.000</span>
        </div>
      </div>
    </aside>
  );
};
