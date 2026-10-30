import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, Boxes, ArrowRight, RefreshCw } from 'lucide-react';
import { httpClient } from '../../services/httpClient';
import { Product } from '../../types';

interface AdminCategoriesProps {
  onSelectCategoryFilter: (aroma: string) => void;
}

interface FamilyMeta {
  name: string;
  icon: string;
  desc: string;
  color: string;
}

const aromaFamilies: FamilyMeta[] = [
  { name: 'Dulce', icon: '🍯', desc: 'Vainilla, praliné, caramelo y frutas caramelizadas', color: 'from-amber-600/30 to-yellow-600/20' },
  { name: 'Floral', icon: '🌸', desc: 'Rosas, jazmín, peonías, flores blancas y azucenas', color: 'from-pink-600/30 to-rose-600/20' },
  { name: 'Amaderado', icon: '🪵', desc: 'Oud majestuoso, cedro, sándalo y vetiver', color: 'from-amber-900/40 to-stone-800/30' },
  { name: 'Cítrico', icon: '🍋', desc: 'Bergamota italiana, limón primofiore y mandarina', color: 'from-yellow-600/30 to-amber-500/20' },
  { name: 'Fresco', icon: '🌊', desc: 'Brisa marina, notas acuáticas y lavanda limpia', color: 'from-cyan-600/30 to-blue-600/20' },
  { name: 'Ámbar', icon: '🏺', desc: 'Ámbar gris cálido, resinas orientales y bálsamos', color: 'from-orange-600/30 to-amber-700/20' },
  { name: 'Especiado', icon: '🌶️', desc: 'Canela, pimienta negra, cardamomo y azafrán', color: 'from-red-600/30 to-orange-700/20' },
  { name: 'Oriental', icon: '✨', desc: 'Tabaco dulce, especias intensas y benjuí noble', color: 'from-purple-600/30 to-amber-700/20' },
];

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  onSelectCategoryFilter,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await httpClient.get<{ success: boolean; data: Product[] }>(
        '/products?includeAll=true'
      );
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (err: any) {
      console.error('Error al cargar perfumes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Agrupación por aroma
  const getFamilyCount = (aromaName: string) => {
    return products.filter((p) =>
      p.aromaType.toLowerCase().includes(aromaName.toLowerCase())
    ).length;
  };

  // Agrupación por categoría
  const categoryGroups = products.reduce((acc, p) => {
    const cat = p.category || 'Sin categoría';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Clasificación Olfativa
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-0.5">
            Tipos de perfumes y aromas
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Organización del catálogo de Perfumería Fabio según sus notas aromáticas y familias de diseñador.
          </p>
        </div>

        <button
          onClick={fetchProducts}
          title="Actualizar catálogo"
          className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Grid de Familias Olfativas */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Familias Olfativas ({aromaFamilies.length})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {aromaFamilies.map((family) => {
            const count = getFamilyCount(family.name);
            return (
              <div
                key={family.name}
                onClick={() => onSelectCategoryFilter(family.name)}
                className={`p-5 rounded-2xl bg-gradient-to-br ${family.color} border border-gray-800 hover:border-amber-500/50 shadow-xl transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between space-y-3 group`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{family.icon}</span>
                    <span className="px-2.5 py-1 rounded-full bg-black/60 text-xs font-bold font-mono text-amber-300 border border-gray-700">
                      {count} perfume{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-white mt-2 group-hover:text-amber-200">
                    {family.name}
                  </h4>
                  <p className="text-[11px] text-gray-300 mt-1 leading-snug">
                    {family.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-amber-300 font-semibold">
                  <span>Ver perfumes</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen por Tipo de Categoría Comercial */}
      <div className="p-6 bg-[#13131c] border border-gray-800 rounded-3xl space-y-4">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Tag className="w-4 h-4 text-amber-400" />
          <span>Líneas y Categorías Comerciales</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(categoryGroups).map(([cat, total]) => (
            <div key={cat} className="p-4 bg-black/40 rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">{cat}</span>
                <span className="text-[11px] text-gray-400">Perfumes en catálogo</span>
              </div>
              <span className="text-lg font-mono font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                {total}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
