import React, { useState, useEffect } from 'react';
import { ShieldCheck, Edit2, Check } from 'lucide-react';

export const EvidenceBadge: React.FC = () => {
  const [studentName, setStudentName] = useState(() => localStorage.getItem('fabio_student_name') || 'Fabio');
  const [studentRu, setStudentRu] = useState(() => localStorage.getItem('fabio_student_ru') || 'RU-1002345 / CI-9876543');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    localStorage.setItem('fabio_student_name', studentName);
    localStorage.setItem('fabio_student_ru', studentRu);
  }, [studentName, studentRu]);

  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-black to-amber-950/80 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200/90 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-amber-400 uppercase tracking-wider">Perfumería Fabio:</span>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Nombre Completo"
                className="bg-black/60 border border-amber-500/50 px-2 py-0.5 rounded text-white text-xs focus:outline-none focus:border-amber-400"
              />
              <input
                type="text"
                value={studentRu}
                onChange={(e) => setStudentRu(e.target.value)}
                placeholder="RU / Cédula"
                className="bg-black/60 border border-amber-500/50 px-2 py-0.5 rounded text-white text-xs focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() => setIsEditing(false)}
                className="bg-amber-600 hover:bg-amber-500 text-black px-2 py-0.5 rounded font-medium flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Guardar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="bg-black/40 px-2 py-0.5 rounded border border-amber-500/20 text-white font-medium">
                {studentName}
              </span>
              <span className="text-amber-300/80">({studentRu})</span>
              <button
                onClick={() => setIsEditing(true)}
                title="Editar datos del proyecto para la captura"
                className="text-amber-400/70 hover:text-amber-300 p-0.5"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        <div className="text-gray-400 text-[11px] hidden sm:block">
          Proyecto: <span className="text-amber-300">Perfumería Fabio</span> | Red: <span className="text-amber-300">{typeof window !== 'undefined' ? window.location.host : 'localhost'}</span>
        </div>
      </div>
    </div>
  );
};
