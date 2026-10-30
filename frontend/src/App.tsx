import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { FilterSidebar } from './components/FilterSidebar';
import { ProductCard } from './components/ProductCard';
import { PerfumeQuizModal } from './components/PerfumeQuizModal';
import { CheckoutModal } from './components/CheckoutModal';
import { DigitalReceipt } from './components/DigitalReceipt';
import { EmailPreview } from './components/EmailPreview';
import { EvidenceBadge } from './components/EvidenceBadge';
import { LoginModal } from './components/LoginModal';
import { AdminLayout, AdminView } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminInventory } from './components/admin/AdminInventory';
import { ProductFormModal } from './components/admin/ProductFormModal';
import { AdminSales } from './components/admin/AdminSales';
import { AdminCategories } from './components/admin/AdminCategories';
import { AdminSettings } from './components/admin/AdminSettings';
import { httpClient, formatBs, UPLOADS_BASE_URL } from './services/httpClient';
import { Product, Sample, CartItem, Order, User } from './types';
import { Sparkles, Gift, ArrowRight, X, Info, ShoppingBag } from 'lucide-react';

export const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modo Administración
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Filtros del Catálogo Público
  const [selectedAroma, setSelectedAroma] = useState('Todos');
  const [selectedGender, setSelectedGender] = useState('Todos');
  const [selectedBrand, setSelectedBrand] = useState('Todos');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [maxPrice, setMaxPrice] = useState(3000);
  const [sortBy, setSortBy] = useState('featured');

  // Modales
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Cargar sesión persistente al iniciar
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('fabio_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
      }
    } catch (e) {
      console.warn('No se pudo restaurar la sesión:', e);
    }
  }, []);

  // Cargar productos del Backend
  const fetchCatalog = useCallback(async () => {
    try {
      const prodRes = await httpClient.get<{ success: boolean; data: Product[] }>('/products');
      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data);
      }
    } catch (e) {
      console.warn('Conectando en modo catálogo local...');
    }

    try {
      const sampleRes = await httpClient.get<{ success: boolean; data: Sample[] }>('/samples');
      if (sampleRes.success && sampleRes.data) {
        setSamples(sampleRes.data);
      }
    } catch (e) {
      console.warn('Cargando muestras locales...');
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Lista de marcas únicas disponibles en la tienda
  const availableBrands = useMemo(() => {
    const brandsSet = new Set(products.map((p) => p.brand).filter(Boolean));
    return Array.from(brandsSet).sort();
  }, [products]);

  // Manejo de Carrito
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleResetFilters = () => {
    setSelectedAroma('Todos');
    setSelectedGender('Todos');
    setSelectedBrand('Todos');
    setSelectedAvailability('all');
    setMaxPrice(3000);
    setSortBy('featured');
  };

  const handleOrderSuccess = (order: Order) => {
    setCartItems([]);
    setIsCheckoutOpen(false);
    setReceiptOrder(order);
    // Sincronizar existencias tras la venta
    fetchCatalog();
  };

  const handleLogout = () => {
    localStorage.removeItem('fabio_auth_token');
    localStorage.removeItem('fabio_user');
    setCurrentUser(null);
    setIsAdminMode(false);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'ADMIN') {
      setIsAdminMode(true);
      setAdminView('dashboard');
    }
  };

  // Filtrado y ordenamiento de productos en memoria para el catálogo público
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // En catálogo público solo perfumes activos
        if (p.status && p.status !== 'ACTIVE') return false;

        // Filtro por Aroma
        if (selectedAroma !== 'Todos' && !p.aromaType.toLowerCase().includes(selectedAroma.toLowerCase())) {
          return false;
        }

        // Filtro por Género
        if (selectedGender !== 'Todos' && p.gender !== selectedGender) return false;

        // Filtro por Marca
        if (selectedBrand !== 'Todos' && p.brand !== selectedBrand) return false;

        // Filtro por Disponibilidad
        if (selectedAvailability === 'available' && p.stock <= 0) return false;

        // Filtro por Precio Máximo
        if (p.price > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // featured
      });
  }, [products, selectedAroma, selectedGender, selectedBrand, selectedAvailability, maxPrice, sortBy]);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Si estamos en modo Administración y el usuario tiene rol ADMIN:
  if (isAdminMode && currentUser?.role === 'ADMIN') {
    return (
      <AdminLayout
        currentView={adminView}
        onSelectView={(view) => {
          if (view === 'create') {
            setProductToEdit(null);
            setIsProductFormOpen(true);
          } else {
            setAdminView(view);
          }
        }}
        onBackToStore={() => {
          setIsAdminMode(false);
          fetchCatalog();
        }}
        onLogout={handleLogout}
        currentUser={currentUser}
      >
        {/* Vista: Inicio (Dashboard) */}
        {adminView === 'dashboard' && (
          <AdminDashboard
            onNavigate={(view) => {
              if (view === 'create') {
                setProductToEdit(null);
                setIsProductFormOpen(true);
              } else {
                setAdminView(view);
              }
            }}
          />
        )}

        {/* Vista: Inventario de perfumes */}
        {adminView === 'inventory' && (
          <AdminInventory
            onOpenCreateModal={() => {
              setProductToEdit(null);
              setIsProductFormOpen(true);
            }}
            onOpenEditModal={(p) => {
              setProductToEdit(p);
              setIsProductFormOpen(true);
            }}
            initialAvailabilityFilter="all"
          />
        )}

        {/* Vista: Quedan pocas unidades (Stock bajo) */}
        {adminView === 'low_stock' && (
          <AdminInventory
            onOpenCreateModal={() => {
              setProductToEdit(null);
              setIsProductFormOpen(true);
            }}
            onOpenEditModal={(p) => {
              setProductToEdit(p);
              setIsProductFormOpen(true);
            }}
            initialAvailabilityFilter="low_stock"
          />
        )}

        {/* Vista: Perfumes agotados */}
        {adminView === 'out_of_stock' && (
          <AdminInventory
            onOpenCreateModal={() => {
              setProductToEdit(null);
              setIsProductFormOpen(true);
            }}
            onOpenEditModal={(p) => {
              setProductToEdit(p);
              setIsProductFormOpen(true);
            }}
            initialAvailabilityFilter="out_of_stock"
          />
        )}

        {/* Vista: Mis ventas */}
        {adminView === 'sales' && <AdminSales />}

        {/* Vista: Tipos de perfumes y aromas */}
        {adminView === 'categories' && (
          <AdminCategories
            onSelectCategoryFilter={(aroma) => {
              setSelectedAroma(aroma);
              setAdminView('inventory');
            }}
          />
        )}

        {/* Vista: Configuración de mi tienda */}
        {adminView === 'settings' && (
          <AdminSettings currentUser={currentUser} onLogout={handleLogout} />
        )}

        {/* Modal de Crear / Modificar perfume */}
        <ProductFormModal
          isOpen={isProductFormOpen}
          productToEdit={productToEdit}
          onClose={() => {
            setIsProductFormOpen(false);
            setProductToEdit(null);
          }}
          onSaved={() => {
            fetchCatalog();
          }}
        />
      </AdminLayout>
    );
  }

  // Vista Pública: Catálogo de Perfumería Fabio
  return (
    <div className="min-h-screen bg-[#0b0b10] text-gray-100 flex flex-col">
      {/* Marca de Agua e Identificación del Proyecto Perfumería Fabio */}
      <EvidenceBadge />

      {/* Barra de Navegación Principal */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCheckoutOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenAdmin={
          currentUser?.role === 'ADMIN'
            ? () => {
                setIsAdminMode(true);
                setAdminView('dashboard');
              }
            : undefined
        }
        currentUser={currentUser}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Banner Principal / Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#12121b] via-[#0b0b10] to-[#0b0b10] border-b border-gray-800/80 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Colección Exclusiva 2026 • Fragancias Árabes & Diseñador
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight">
                El Arte de la <br />
                <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                  Alta Perfumería
                </span>
              </h1>
              <p className="text-gray-300 text-sm sm:text-base max-w-xl leading-relaxed">
                Descubre fragancias árabes virales (Lattafa, Al Haramain, Armaf) y clásicos de diseñador. Realiza nuestro cuestionario inteligente y recibe <strong>2 muestras de cortesía de 2ml</strong> en compras superiores a Bs 50.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setIsQuizOpen(true)}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-xs sm:text-sm hover:opacity-95 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Perfume Ideal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('catalogo-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-full border border-gray-700 bg-gray-900/60 hover:bg-gray-800 text-gray-200 text-xs sm:text-sm font-semibold transition-colors"
                >
                  Explorar Catálogo ({filteredProducts.length})
                </button>
              </div>
            </div>

            {/* Tarjeta Promocional de Fidelización (Muestras Gratis) */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-[#181826] to-[#12121b] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-300">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                      Promoción Especial Checkout
                    </span>
                    <h3 className="text-lg font-serif font-bold text-white">
                      Muestras Gratis de Lujo
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  En compras de Bs 50 o más, desbloquea nuestro módulo exclusivo: <strong>Elige tus muestras aquí</strong> con 2 decants de 2ml a costo Bs 0,00 incluidos en tu ticket y correo.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {samples.slice(0, 3).map((s) => (
                    <div key={s.id} className="bg-black/40 border border-gray-800 rounded-xl p-2 text-center">
                      <img src={s.imageUrl} alt={s.name} className="w-8 h-8 mx-auto rounded-md object-cover mb-1" />
                      <span className="text-[9px] text-gray-400 block truncate">{s.brand}</span>
                      <span className="text-[10px] font-bold text-amber-300">2ml Gratis</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Principal de Catálogo y Filtros */}
      <main id="catalogo-section" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Panel Lateral de Filtros ("Buscar y seleccionar") */}
          <FilterSidebar
            selectedAroma={selectedAroma}
            onSelectAroma={setSelectedAroma}
            selectedGender={selectedGender}
            onSelectGender={setSelectedGender}
            selectedBrand={selectedBrand}
            onSelectBrand={setSelectedBrand}
            selectedAvailability={selectedAvailability}
            onSelectAvailability={setSelectedAvailability}
            availableBrands={availableBrands}
            maxPrice={maxPrice}
            onChangeMaxPrice={setMaxPrice}
            sortBy={sortBy}
            onChangeSortBy={setSortBy}
            onResetFilters={handleResetFilters}
          />

          {/* Grid de Perfumes */}
          <div className="flex-1 w-full space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Mostrando {filteredProducts.length} perfume{filteredProducts.length !== 1 ? 's' : ''} disponibles
              </span>
              <div className="flex items-center gap-2">
                {selectedAroma !== 'Todos' && (
                  <span className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                    Aroma: <strong>{selectedAroma}</strong>
                  </span>
                )}
                {selectedBrand !== 'Todos' && (
                  <span className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                    Marca: <strong>{selectedBrand}</strong>
                  </span>
                )}
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-[#12121b] border border-gray-800 rounded-3xl p-12 text-center space-y-3">
                <span className="text-3xl">🔍</span>
                <h3 className="text-lg font-serif font-bold text-white">
                  No se encontraron perfumes con estos filtros
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Prueba restableciendo los filtros de familia olfativa, marca o ampliando el rango de precio.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-amber-500 text-black px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onViewDetails={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Detalle de Perfume al hacer clic */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#12121b] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-gray-100 my-6">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-black/50 border border-gray-800">
                <img
                  src={
                    selectedProduct.imageUrl.startsWith('/uploads')
                      ? `${UPLOADS_BASE_URL}${selectedProduct.imageUrl}`
                      : selectedProduct.imageUrl
                  }
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3">
                <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                  {selectedProduct.brand} • {selectedProduct.category || 'Perfume'}
                </div>
                <h3 className="text-2xl font-serif font-bold text-white">
                  {selectedProduct.name}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {selectedProduct.description}
                </p>

                <div className="p-3 bg-black/40 border border-gray-800 rounded-xl space-y-1.5 text-xs text-gray-300">
                  <div>
                    <span className="text-[10px] text-amber-300 font-bold uppercase block">Notas de Salida:</span>
                    <span>{selectedProduct.topNotes}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-300 font-bold uppercase block">Notas de Corazón:</span>
                    <span>{selectedProduct.heartNotes}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-300 font-bold uppercase block">Notas de Fondo:</span>
                    <span>{selectedProduct.baseNotes}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block">Precio Oficial</span>
                    <span className="text-2xl font-bold font-mono text-amber-300">
                      {formatBs(selectedProduct.price)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    disabled={selectedProduct.stock <= 0}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      selectedProduct.stock <= 0
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{selectedProduct.stock <= 0 ? 'Agotado' : 'Comprar ahora'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pie de Página */}
      <footer className="bg-[#0e0e16] border-t border-gray-800 py-8 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-black font-serif font-bold flex items-center justify-center text-xs">
              F
            </div>
            <span className="text-gray-200 font-semibold">Perfumería Fabio • Boutique de Fragancias</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <span>Precios expresados en Bolivianos (Bs)</span>
            <span className="text-amber-400">• Puerto 5174 / 5001</span>
          </div>
        </div>
      </footer>

      {/* Modales de la Aplicación */}
      <PerfumeQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onAddToCart={handleAddToCart}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        samples={samples}
        onOrderSuccess={handleOrderSuccess}
      />

      {receiptOrder && (
        <DigitalReceipt
          order={receiptOrder}
          onClose={() => setReceiptOrder(null)}
          onOpenEmailPreview={() => setIsEmailPreviewOpen(true)}
        />
      )}

      {receiptOrder && (
        <EmailPreview
          order={receiptOrder}
          isOpen={isEmailPreviewOpen}
          onClose={() => setIsEmailPreviewOpen(false)}
          onBackToReceipt={() => setIsEmailPreviewOpen(false)}
        />
      )}

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};
