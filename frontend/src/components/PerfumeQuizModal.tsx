import React, { useState } from 'react';
import { X, Sparkles, Check, ShoppingBag, ArrowRight, ArrowLeft, RefreshCw, Star } from 'lucide-react';
import { httpClient, formatBs, UPLOADS_BASE_URL } from '../services/httpClient';
import { Product, QuizRecommendation } from '../types';

interface PerfumeQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

interface Question {
  id: string;
  title: string;
  subtitle: string;
  options: {
    label: string;
    description: string;
    value: string;
    icon: string;
  }[];
}

const quizQuestions: Question[] = [
  {
    id: 'occasion',
    title: '1. ¿En qué momento u ocasión planeas lucir tu fragancia?',
    subtitle: 'El contexto define la proyección y el impacto adecuado.',
    options: [
      { label: 'Citas / Vida Nocturna', description: 'Encuentros románticos y salidas exclusivas', value: 'Citas / Noche', icon: '🍷' },
      { label: 'Diario & Oficina', description: 'Versátil, pulcro y no invasivo para el trabajo', value: 'Diario', icon: '👔' },
      { label: 'Gala & Eventos Formales', description: 'Imponente, distinguido y sofisticado', value: 'Formal', icon: '💎' },
      { label: 'Fiesta & Diversión', description: 'Magnético, juvenil y con gran presencia', value: 'Fiesta', icon: '🎉' },
    ],
  },
  {
    id: 'intensity',
    title: '2. ¿Qué intensidad o estela prefieres dejar al pasar?',
    subtitle: 'La concentración define cuánto tiempo se sentirá tu presencia.',
    options: [
      { label: 'Sutil & Íntima', description: 'Aroma a flor de piel que solo quienes se acercan sienten', value: 'Sutil', icon: '🕊️' },
      { label: 'Moderada & Elegante', description: 'Equilibrio perfecto de 1 a 2 metros de proyección', value: 'Moderada', icon: '✨' },
      { label: 'Intensa & Inolvidable', description: 'Modo bestia, duración superior a 10 horas con gran estela', value: 'Intensa', icon: '🔥' },
    ],
  },
  {
    id: 'aromaType',
    title: '3. ¿Qué familia olfativa despierta mejor tus sentidos?',
    subtitle: 'El ADN de la fragancia que se fusionará con tu piel.',
    options: [
      { label: 'Amaderada & Noble', description: 'Cedro, sándalo cremoso, vetiver y cuero', value: 'Amaderado', icon: '🪵' },
      { label: 'Cítrica & Chispeante', description: 'Bergamota de Calabria, limón primofiore y pomelo', value: 'Cítrico', icon: '🍋' },
      { label: 'Floral & Sensual', description: 'Rosas francesas, jazmín blanco y peonías frescas', value: 'Floral', icon: '🌸' },
      { label: 'Oriental & Vainilla', description: 'Especias cálidas, ámbar dorado y tabaco dulce', value: 'Oriental', icon: '🏺' },
      { label: 'Fresco & Acuático', description: 'Brisa marina, minerales y lavanda revitalizante', value: 'Fresco', icon: '🌊' },
    ],
  },
  {
    id: 'gender',
    title: '4. ¿Para quién está pensada esta fragancia?',
    subtitle: 'Nos ayuda a afinar el perfil de formulación exacto.',
    options: [
      { label: 'Para Hombre', description: 'Líneas masculinas clásicas o contemporáneas', value: 'Hombre', icon: '🧔' },
      { label: 'Para Mujer', description: 'Matices femeninos seductores y luminosos', value: 'Mujer', icon: '💃' },
      { label: 'Unisex / Sin Género', description: 'Alta perfumería de autor para todos', value: 'Unisex', icon: '⭐' },
    ],
  },
];

export const PerfumeQuizModal: React.FC<PerfumeQuizModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<QuizRecommendation[]>([]);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const currentQuestion = quizQuestions[currentStep];

  const handleSelectOption = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = async () => {
    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finalizar y solicitar recomendaciones
      setIsLoading(true);
      try {
        const response = await httpClient.post<{ success: boolean; data: QuizRecommendation[] }>(
          '/quiz/recommend',
          {
            occasion: answers.occasion,
            intensity: answers.intensity,
            aromaType: answers.aromaType,
            gender: answers.gender,
          }
        );

        if (response.success && response.data) {
          setRecommendations(response.data);
          setHasCompleted(true);
        }
      } catch (err) {
        console.error('Error al procesar el quiz:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
    setHasCompleted(false);
    setRecommendations([]);
  };

  const handleAddRecommended = (product: Product) => {
    onAddToCart(product);
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#13131c] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-gray-900/60 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Estado: Procesando con Algoritmo */}
        {isLoading && (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
            <h3 className="text-xl font-serif font-bold text-amber-200">
              Analizando tu Perfil Olfativo...
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Nuestro motor de afinidad está evaluando la concentración de aceites esenciales y compatibilidad de notas aromáticas.
            </p>
          </div>
        )}

        {/* Estado: Resultados Recomendados (Mínimo 3 perfumes) */}
        {!isLoading && hasCompleted && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-500/40">
                <Sparkles className="w-3.5 h-3.5" /> Recomendaciones Personalizadas
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Tus 3 Fragancias Ideales
              </h2>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Seleccionadas matemáticamente con base en tus preferencias de notas {answers.aromaType?.toLowerCase()}, intensidad {answers.intensity?.toLowerCase()} y ocasión.
              </p>
            </div>

            {/* Grid de 3 Recomendaciones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec, index) => {
                const isAdded = addedIds.includes(rec.product.id);
                return (
                  <div
                    key={rec.product.id}
                    className="relative bg-gradient-to-b from-[#1c1c28] to-[#12121a] border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-xl group hover:border-amber-400 transition-all"
                  >
                    {/* Badge de Afinidad */}
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-extrabold text-[11px] px-2 py-0.5 rounded-full shadow-md">
                      {rec.matchPercentage}% Match
                    </div>

                    <div>
                      {/* Imagen */}
                      <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-black/40">
                        <img
                          src={
                            rec.product.imageUrl.startsWith('/uploads')
                              ? `${UPLOADS_BASE_URL}${rec.product.imageUrl}`
                              : rec.product.imageUrl
                          }
                          alt={rec.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      </div>

                      <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">
                        #{index + 1} Recomendación • {rec.product.brand}
                      </div>
                      <h4 className="font-serif font-bold text-base text-white mt-0.5">
                        {rec.product.name}
                      </h4>

                      {/* Motivos de Coincidencia */}
                      <div className="mt-2.5 p-2 bg-black/40 rounded-lg border border-gray-800 space-y-1">
                        <span className="text-[9px] uppercase tracking-wider text-amber-300 font-bold block">
                          ¿Por qué es para ti?
                        </span>
                        {rec.matchReasons.map((reason, idx) => (
                          <div key={idx} className="text-[11px] text-gray-300 flex items-start gap-1">
                            <span className="text-amber-400 text-xs">✔</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
                      <div className="text-base font-bold font-mono text-amber-300">
                        {formatBs(rec.product.price)}
                      </div>

                      {/* Botón directo de Agregar al Carrito */}
                      <button
                        onClick={() => handleAddRecommended(rec.product)}
                        disabled={rec.product.stock <= 0}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                          rec.product.stock <= 0
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20'
                        }`}
                      >
                        {rec.product.stock <= 0 ? (
                          <span>Agotado</span>
                        ) : isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>¡Listo!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Al Carrito</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Acciones de Resultados */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-gray-800">
              <button
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Repetir Test Olfativo
              </button>
              <button
                onClick={onClose}
                className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2 rounded-xl text-xs font-semibold transition-colors"
              >
                Continuar Explorando la Tienda
              </button>
            </div>
          </div>
        )}

        {/* Estado: Preguntas del Quiz (Paso a Paso) */}
        {!isLoading && !hasCompleted && (
          <div className="space-y-6">
            {/* Header del Progreso */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400 font-medium">
                <span className="text-amber-400">Paso {currentStep + 1} de {quizQuestions.length}</span>
                <span>{Math.round(((currentStep + 1) / quizQuestions.length) * 100)}% Completado</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStep + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Título de la Pregunta */}
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                {currentQuestion.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                {currentQuestion.subtitle}
              </p>
            </div>

            {/* Opciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelectOption(option.value)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-[#181824] border-gray-800 text-gray-300 hover:bg-[#202030] hover:border-gray-700'
                    }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-100 flex items-center justify-between">
                        <span>{option.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Botones de Navegación */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-800">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${
                  currentStep === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'
                }`}
              >
                <ArrowLeft className="w-4 h-4" /> Anterior
              </button>

              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
                className={`flex items-center gap-2 text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md ${
                  answers[currentQuestion.id]
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:opacity-95 shadow-amber-500/20'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>{currentStep === quizQuestions.length - 1 ? 'Descubrir Perfumes' : 'Siguiente'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
