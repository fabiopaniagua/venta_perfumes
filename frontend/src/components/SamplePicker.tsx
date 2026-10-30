import React, { useState } from 'react';
import { Gift, Check, AlertTriangle, Sparkles, Lock } from 'lucide-react';
import { Sample } from '../types';

interface SamplePickerProps {
  samples: Sample[];
  selectedSampleIds: string[];
  onToggleSample: (sampleId: string) => void;
  subtotal: number;
  threshold?: number;
}

export const SamplePicker: React.FC<SamplePickerProps> = ({
  samples,
  selectedSampleIds,
  onToggleSample,
  subtotal,
  threshold = 50.0,
}) => {
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const isUnlocked = subtotal >= threshold;
  const remainingAmount = Math.max(0, threshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / threshold) * 100));

  const handleSelect = (sampleId: string) => {
    if (!isUnlocked) return;

    const alreadySelected = selectedSampleIds.includes(sampleId);

    // Si ya está seleccionada, permitir desmarcar
    if (alreadySelected) {
      onToggleSample(sampleId);
      setAlertMessage(null);
      return;
    }

    // Validación estricta: Máximo 2 muestras permitidas
    if (selectedSampleIds.length >= 2) {
      setAlertMessage('⚠️ Límite alcanzado: Solo puedes seleccionar un máximo de 2 muestras de cortesía por orden. Desmarca una para elegir otra.');
      setTimeout(() => setAlertMessage(null), 4000);
      return;
    }

    onToggleSample(sampleId);
    setAlertMessage(null);
  };

  return (
    <div className="bg-[#151522] border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
      {/* Header del Módulo de Muestras */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-black shadow-md">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <span>Elige tus muestras aquí</span>
              <span className="text-[10px] uppercase font-sans font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                Gratis (Máx 2)
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Decants exclusivos de 2ml para degustar en casa sin costo adicional.
            </p>
          </div>
        </div>

        {/* Contador de Muestras */}
        {isUnlocked && (
          <div className="text-right shrink-0">
            <span className="text-xs text-gray-400 block">Seleccionadas:</span>
            <span className={`text-sm font-bold font-mono ${selectedSampleIds.length === 2 ? 'text-amber-400' : 'text-gray-200'}`}>
              {selectedSampleIds.length} / 2
            </span>
          </div>
        )}
      </div>

      {/* Alerta Visual de Límite Estricto */}
      {alertMessage && (
        <div className="p-3 bg-red-950/80 border border-red-500/70 rounded-xl text-xs text-red-200 flex items-center gap-2.5 animate-bounce shadow-md">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{alertMessage}</span>
        </div>
      )}

      {/* Barra de Umbral si aún no ha alcanzado el mínimo */}
      {!isUnlocked ? (
        <div className="p-4 bg-black/40 border border-gray-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gray-300">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>
                Agrega <strong className="text-amber-400 font-mono">Bs {remainingAmount.toFixed(2)}</strong> más a tu carrito para desbloquear 2 muestras de lujo de 2ml.
              </span>
            </div>
            <span className="font-bold text-amber-300 font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : (
        /* Sección Desbloqueada de Selección de Muestras */
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>¡Felicidades! Has desbloqueado tus 2 muestras de cortesía de 2ml.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {samples.map((sample) => {
              const isSelected = selectedSampleIds.includes(sample.id);
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelect(sample.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 relative group ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <img
                    src={sample.imageUrl}
                    alt={sample.name}
                    className="w-12 h-12 object-cover rounded-lg shrink-0 border border-gray-700"
                  />
                  <div className="flex-1 min-w-0 pr-5">
                    <div className="text-[10px] text-amber-400/90 uppercase font-semibold truncate">
                      {sample.brand}
                    </div>
                    <div className="text-xs font-bold text-white truncate">
                      {sample.name.replace('Decant 2ml - ', '')}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">
                      {sample.aromaType} • 2ml (Bs 0.00)
                    </div>
                  </div>

                  {/* Indicador Check */}
                  <div className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-amber-500 text-black font-bold' : 'border border-gray-700 group-hover:border-gray-500'
                  }`}>
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
