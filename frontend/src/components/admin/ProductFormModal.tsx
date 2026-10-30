import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { httpClient, UPLOADS_BASE_URL } from '../../services/httpClient';
import { Product, ProductFormData } from '../../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (product: Product) => void;
  productToEdit?: Product | null;
}

const aromaFamilies = [
  'Dulce',
  'Floral',
  'Amaderado',
  'Cítrico',
  'Fresco',
  'Ámbar',
  'Especiado',
  'Oriental',
];

const audiences = ['Hombre', 'Mujer', 'Unisex'];

const occasions = ['Diario', 'Citas / Noche', 'Formal', 'Fiesta', 'Deporte'];

const concentrations = [
  'Eau de Parfum',
  'Eau de Toilette',
  'Extrait de Parfum',
  'Parfum',
  'Eau de Cologne',
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  productToEdit,
}) => {
  const isEditing = Boolean(productToEdit);

  const initialFormData: ProductFormData = {
    name: '',
    brand: '',
    description: '',
    price: 350.0,
    stock: 10,
    imageUrl: '',
    aromaType: 'Dulce',
    gender: 'Unisex',
    occasion: 'Diario',
    intensity: 'Moderada',
    topNotes: '',
    heartNotes: '',
    baseNotes: '',
    volumeMl: 100,
    status: 'ACTIVE',
    category: 'Perfume Árabe',
    concentration: 'Eau de Parfum',
    lowStockThreshold: 5,
    isFeatured: false,
  };

  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        brand: productToEdit.brand,
        description: productToEdit.description,
        price: productToEdit.price,
        stock: productToEdit.stock,
        imageUrl: productToEdit.imageUrl,
        aromaType: productToEdit.aromaType,
        gender: productToEdit.gender,
        occasion: productToEdit.occasion || 'Diario',
        intensity: productToEdit.intensity || 'Moderada',
        topNotes: productToEdit.topNotes || '',
        heartNotes: productToEdit.heartNotes || '',
        baseNotes: productToEdit.baseNotes || '',
        volumeMl: productToEdit.volumeMl || 100,
        status: (productToEdit.status as any) || 'ACTIVE',
        category: productToEdit.category || 'Perfume Árabe',
        concentration: productToEdit.concentration || 'Eau de Parfum',
        lowStockThreshold: productToEdit.lowStockThreshold || 5,
        isFeatured: Boolean(productToEdit.isFeatured),
      });

      const fullImageUrl = productToEdit.imageUrl.startsWith('/uploads')
        ? `${UPLOADS_BASE_URL}${productToEdit.imageUrl}`
        : productToEdit.imageUrl;
      setImagePreview(fullImageUrl);
    } else {
      setFormData(initialFormData);
      setImagePreview('');
    }
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // Manejo de subida de archivo desde la computadora
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecciona un archivo de imagen válido (JPEG, PNG o WEBP).');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const data = new FormData();
      data.append('image', file);

      const response = await httpClient.uploadFile<{
        success: boolean;
        message: string;
        data: { url: string };
      }>('/upload', data);

      if (response.success && response.data?.url) {
        setFormData((prev) => ({ ...prev, imageUrl: response.data.url }));
        setImagePreview(`${UPLOADS_BASE_URL}${response.data.url}`);
        setSuccessMessage('Fotografía cargada correctamente.');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error al subir imagen:', err);
      setErrorMessage(err.message || 'No se pudo subir la fotografía.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validaciones estrictas
    if (!formData.name.trim()) {
      setErrorMessage('El nombre del perfume es obligatorio.');
      return;
    }
    if (!formData.brand.trim()) {
      setErrorMessage('La marca es obligatoria.');
      return;
    }
    if (formData.price < 0) {
      setErrorMessage('El precio de venta en Bs no puede ser negativo.');
      return;
    }
    if (formData.stock < 0) {
      setErrorMessage('La cantidad disponible no puede ser negativa.');
      return;
    }
    if (formData.status === 'ACTIVE' && (!formData.price || formData.price <= 0)) {
      setErrorMessage('Para publicar un perfume como Activo, debes asignarle un precio de venta mayor a Bs 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && productToEdit) {
        // Modificar perfume
        const response = await httpClient.put<{ success: boolean; data: Product; message: string }>(
          `/products/${productToEdit.id}`,
          formData
        );
        if (response.success && response.data) {
          setSuccessMessage('¡Perfume modificado exitosamente!');
          setTimeout(() => {
            onSaved(response.data);
            onClose();
          }, 800);
        }
      } else {
        // Crear perfume nuevo
        const response = await httpClient.post<{ success: boolean; data: Product; message: string }>(
          '/products',
          formData
        );
        if (response.success && response.data) {
          setSuccessMessage('¡Perfume registrado exitosamente en el inventario!');
          setTimeout(() => {
            onSaved(response.data);
            onClose();
          }, 800);
        }
      }
    } catch (err: any) {
      console.error('Error al guardar perfume:', err);
      setErrorMessage(err.message || 'Ocurrió un error al guardar el perfume en la base de datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#12121b] border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl my-6 max-h-[92vh] overflow-y-auto text-gray-100">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="pb-4 border-b border-gray-800">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
            {isEditing ? 'Gestión de Producto' : 'Nuevo Registro'}
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-0.5">
            {isEditing ? 'Modificar perfume' : 'Agregar perfume'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {isEditing
              ? 'Edita los datos comerciales, fotografías y existencias del perfume.'
              : 'Registra una nueva fragancia. Puedes guardarla como borrador o publicarla de inmediato.'}
          </p>
        </div>

        {/* Alertas */}
        {errorMessage && (
          <div className="my-3 p-3 bg-red-950/80 border border-red-500 rounded-xl text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="my-3 p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs pt-4">
          {/* Fila 1: Nombre y Marca */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">
                Nombre del perfume *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Khamrah, Asad, Yara..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">
                Marca *
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Ej. Lattafa, Al Haramain, Armaf, Dior..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Fila 2: Precio en Bs y Cantidad Disponible (Stock) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">
                Precio de venta (Bs) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-bold font-mono">
                  Bs
                </span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-3 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">
                Cantidad disponible (Stock) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">
                Tamaño del frasco (ml)
              </label>
              <input
                type="number"
                min="1"
                value={formData.volumeMl}
                onChange={(e) => setFormData({ ...formData, volumeMl: parseInt(e.target.value, 10) || 100 })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Fila 3: Estado, Categoría y Concentración */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">
                Estado del producto
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ACTIVE">🟢 Activo (Publicado en catálogo)</option>
                <option value="DRAFT">🟡 Borrador (Pendiente de completar)</option>
                <option value="INACTIVE">⚪ Inactivo (Oculto)</option>
              </select>
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">
                Tipo de perfume (Categoría)
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ej. Perfume Árabe, Diseñador, Nicho"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">
                Concentración
              </label>
              <select
                value={formData.concentration}
                onChange={(e) => setFormData({ ...formData, concentration: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
              >
                {concentrations.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 4: Familia Olfativa y Público */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">
                Familia olfativa (Aroma)
              </label>
              <select
                value={formData.aromaType}
                onChange={(e) => setFormData({ ...formData, aromaType: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
              >
                {aromaFamilies.map((aroma) => (
                  <option key={aroma} value={aroma}>{aroma}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">
                Público recomendado
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
              >
                {audiences.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">
                Ocasión sugerida
              </label>
              <select
                value={formData.occasion}
                onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
              >
                {occasions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 5: Fotografía (Subida de archivo desde la computadora o URL) */}
          <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-2xl space-y-3">
            <label className="text-gray-200 font-semibold block text-xs">
              Fotografía del perfume *
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Previsualización */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-black/60 border border-gray-700 flex items-center justify-center shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                    onError={() => setImagePreview('')}
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-500" />
                )}
              </div>

              {/* Controles de Subida */}
              <div className="flex-1 w-full space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-amber-300 font-semibold text-xs flex items-center gap-2 border border-gray-700 transition-colors"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir fotografía desde mi equipo</span>
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-gray-400">o ingresa una URL:</span>
                </div>

                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://ejemplo.com/foto-perfume.jpg"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Fila 6: Descripción Comercial */}
          <div>
            <label className="text-gray-300 font-semibold block mb-1">
              Descripción breve y notas olfativas
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe las sensaciones de la fragancia, estela y duración..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Pirámide Olfativa (Opcional pero recomendado para Perfumería Fabio) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-gray-800">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Notas de Salida</label>
              <input
                type="text"
                value={formData.topNotes}
                onChange={(e) => setFormData({ ...formData, topNotes: e.target.value })}
                placeholder="Canela, cítricos..."
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Notas de Corazón</label>
              <input
                type="text"
                value={formData.heartNotes}
                onChange={(e) => setFormData({ ...formData, heartNotes: e.target.value })}
                placeholder="Vainilla, cacao, praliné..."
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Notas de Fondo</label>
              <input
                type="text"
                value={formData.baseNotes}
                onChange={(e) => setFormData({ ...formData, baseNotes: e.target.value })}
                placeholder="Oud, ámbar, sándalo..."
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:opacity-95 text-black font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando en inventario...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isEditing ? 'Guardar cambios' : '+ Agregar perfume'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
