export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  aromaType: 'Dulce' | 'Floral' | 'Amaderado' | 'Cítrico' | 'Fresco' | 'Ámbar' | 'Especiado' | 'Oriental' | string;
  gender: 'Hombre' | 'Mujer' | 'Unisex' | string;
  occasion: string;
  intensity: string;
  topNotes: string;
  heartNotes: string;
  baseNotes: string;
  volumeMl: number;
  imageUrl: string;
  stock: number;
  rating: number;
  isFeatured: boolean;
  status?: 'ACTIVE' | 'DRAFT' | 'INACTIVE';
  category?: string;
  concentration?: string;
  lowStockThreshold?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFormData {
  name: string;
  brand: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  aromaType: string;
  gender: string;
  occasion: string;
  intensity: string;
  topNotes: string;
  heartNotes: string;
  baseNotes: string;
  volumeMl: number;
  status: 'ACTIVE' | 'DRAFT' | 'INACTIVE';
  category: string;
  concentration: string;
  lowStockThreshold: number;
  isFeatured: boolean;
}

export interface AdminStats {
  totalPerfumes: number;
  activePerfumes: number;
  draftPerfumes: number;
  inactivePerfumes: number;
  outOfStockPerfumes: number;
  lowStockPerfumes: number;
  totalUnitsAvailable: number;
  totalOrders: number;
  totalRevenueBs: number;
  currency: string;
}

export interface Sample {
  id: string;
  name: string;
  brand: string;
  aromaType: string;
  description: string;
  volumeMl: number;
  imageUrl: string;
  stock: number;
  isAvailable: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface QuizAnswers {
  occasion: string;
  intensity: string;
  aromaType: string;
  gender: string;
}

export interface QuizRecommendation {
  product: Product;
  matchPercentage: number;
  matchReasons: string[];
}

export interface OrderItemResponse {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface OrderSampleResponse {
  id: string;
  sampleId: string;
  sample: Sample;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  subtotal: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItemResponse[];
  samples: OrderSampleResponse[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
}
