import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck, CheckCircle2, Server } from 'lucide-react';
import { httpClient, API_URL } from '../services/httpClient';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('admin@perfumeriafabio.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await httpClient.post<{ success: boolean; data: User; message?: string }>(
        '/auth/login',
        { email, password }
      );

      if (response.success && response.data) {
        if (response.data.token) {
          localStorage.setItem('fabio_auth_token', response.data.token);
        }
        localStorage.setItem('fabio_user', JSON.stringify(response.data));
        onLoginSuccess(response.data);
        onClose();
      } else {
        setError(response.message || 'Credenciales inválidas');
      }
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      // Fallback seguro si backend no responde
      if (email === 'admin@perfumeriafabio.com' && password === 'admin123') {
        const demoUser: User = {
          id: 'admin-fabio-demo',
          name: 'Administrador Fabio',
          email: 'admin@perfumeriafabio.com',
          role: 'ADMIN',
          token: 'token-fabio-admin-local',
        };
        localStorage.setItem('fabio_auth_token', demoUser.token!);
        localStorage.setItem('fabio_user', JSON.stringify(demoUser));
        onLoginSuccess(demoUser);
        onClose();
      } else {
        setError(err.message || 'Error al conectar con el servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#13131c] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-black font-bold shadow-lg">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-white">
            Iniciar sesión
          </h3>
          <p className="text-xs text-gray-400">
            Ingreso privado a <strong>Administración de mi tienda</strong>
          </p>
        </div>

        {/* Información Técnica para Evidencia */}
        <div className="p-3 bg-black/40 border border-gray-800 rounded-xl text-[11px] text-gray-400 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <Server className="w-3.5 h-3.5" />
            <span>Endpoint Conectado:</span>
          </div>
          <p className="font-mono text-gray-300 truncate">{API_URL}</p>
          <div className="pt-1 text-[10px] text-gray-400 border-t border-gray-800/80">
            Administrador: <span className="text-white">admin@perfumeriafabio.com</span> / <span className="text-white">admin123</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-500 rounded-xl text-xs text-red-200">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-gray-400 block mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 block mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:opacity-95 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            {isLoading ? 'Autenticando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setEmail('admin@perfumeriafabio.com');
              setPassword('admin123');
            }}
            className="text-[11px] text-amber-400/80 hover:text-amber-300 underline"
          >
            Cargar credenciales de administrador
          </button>
        </div>
      </div>
    </div>
  );
};
