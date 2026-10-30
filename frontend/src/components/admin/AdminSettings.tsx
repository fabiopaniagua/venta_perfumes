import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, CheckCircle2, Save, LogOut, Store, AlertTriangle } from 'lucide-react';
import { httpClient } from '../../services/httpClient';
import { User } from '../../types';

interface AdminSettingsProps {
  currentUser: User | null;
  onLogout: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ currentUser, onLogout }) => {
  const [storeName, setStoreName] = useState('Perfumería Fabio');
  const [currency, setCurrency] = useState('Bs');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [contactPhone, setContactPhone] = useState('+591 70000000');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await httpClient.get<{ success: boolean; data: Record<string, string> }>('/products/settings');
        if (response.success && response.data) {
          if (response.data.store_name) setStoreName(response.data.store_name);
          if (response.data.currency) setCurrency(response.data.currency);
          if (response.data.low_stock_threshold) setLowStockThreshold(response.data.low_stock_threshold);
          if (response.data.contact_phone) setContactPhone(response.data.contact_phone);
        }
      } catch (err) {
        console.warn('Cargando configuraciones predeterminadas...');
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      const response = await httpClient.put<{ success: boolean; message: string }>('/products/settings', {
        settings: {
          store_name: storeName,
          currency,
          low_stock_threshold: lowStockThreshold,
          contact_phone: contactPhone,
        },
      });

      if (response.success) {
        setSuccessMessage('Configuraciones de la tienda guardadas exitosamente.');
        setTimeout(() => setSuccessMessage(null), 3500);
      }
    } catch (err: any) {
      alert(err.message || 'Error al guardar configuraciones.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="pb-4 border-b border-gray-800">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
          Ajustes del Sistema
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-0.5">
          Configuración de mi tienda
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Ajusta los parámetros operativos de Perfumería Fabio y umbrales de existencias.
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-500 rounded-2xl text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario de Configuración de la Tienda */}
        <form onSubmit={handleSave} className="lg:col-span-8 bg-[#12121b] border border-gray-800 rounded-3xl p-6 space-y-5 text-xs">
          <div className="flex items-center gap-2 text-sm font-serif font-bold text-white pb-2 border-b border-gray-800">
            <Store className="w-4 h-4 text-amber-400" />
            <span>Parámetros Comerciales</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Nombre Comercial de la Tienda</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">Moneda Oficial de la Tienda</label>
              <input
                type="text"
                disabled
                value={`${currency} (Bolivianos)`}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-amber-300 font-bold font-mono cursor-not-allowed"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">Toda la tienda opera en bolivianos (Bs).</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">
                Umbral para "Quedan pocas unidades" (Stock bajo)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">
                Cuando un perfume tenga este número o menos de frascos, se activará la alerta amarilla.
              </span>
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">Teléfono / WhatsApp de Contacto</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+591 70000000"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:opacity-95 text-black font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Guardar cambios'}</span>
            </button>
          </div>
        </form>

        {/* Información del Administrador y Seguridad */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#12121b] border border-gray-800 rounded-3xl p-5 space-y-4 text-xs">
            <div className="flex items-center gap-2 font-serif font-bold text-white pb-2 border-b border-gray-800">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Sesión del Administrador</span>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">Nombre de Administrador:</span>
                <span className="text-white font-semibold">{currentUser?.name || 'Administrador Fabio'}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">Correo Electrónico:</span>
                <span className="text-gray-300 font-mono">{currentUser?.email || 'admin@perfumeriafabio.com'}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">Rol del Sistema:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {currentUser?.role || 'ADMIN'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-700/60 text-red-200 font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
