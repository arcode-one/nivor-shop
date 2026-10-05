export const CART_STORAGE_KEY = 'nivor-cart';
const LEGACY_CART_STORAGE_KEY = 'sovra-cart';

export type ProductModelId = 'one' | 'air' | 'studio';
export type ProductColorId = 'graphite' | 'sand' | 'coral' | 'silver' | 'blue';

export type ProductColor = {
  id: ProductColorId;
  name: string;
  className: string;
  hex: string;
};

export type ProductModel = {
  id: ProductModelId;
  name: string;
  shortName: string;
  category: string;
  headline: string;
  accent: string;
  description: string;
  price: number;
  installment: string;
  rating: string;
  specs: string[];
  images: Record<ProductColorId, string>;
};

export const PRODUCT_COLORS: ProductColor[] = [
  { id: 'graphite', name: 'Графит', className: 'tone-graphite', hex: '#242528' },
  { id: 'sand', name: 'Тёплый песок', className: 'tone-sand', hex: '#C8AE88' },
  { id: 'coral', name: 'Сигнальный коралл', className: 'tone-coral', hex: '#FF5A3D' },
  { id: 'silver', name: 'Арктическое серебро', className: 'tone-silver', hex: '#D9DDE1' },
  { id: 'blue', name: 'Ночной синий', className: 'tone-blue', hex: '#203650' },
];

export const PRODUCT_MODELS: ProductModel[] = [
  {
    id: 'one', name: 'NIVØR ONE', shortName: 'ONE', category: 'Флагманские ANC-наушники',
    headline: 'Слышать больше.', accent: 'Уставать меньше.',
    description: 'Полноразмерный флагман с адаптивным шумоподавлением, пространственным звуком и точной персональной настройкой.',
    price: 29_990, installment: '4 × 7 498 ₽', rating: '4,9 · 184 отзыва',
    specs: ['CarbonCore 42 мм', 'Adaptive ANC до 42 дБ', 'До 50 часов музыки', 'Bluetooth 5.4 · Low Latency'],
    images: { graphite: 'nivor-one-graphite-centered.png', sand: 'nivor-one-sand.png', coral: 'nivor-one-coral.png', silver: 'nivor-one-silver.png', blue: 'nivor-one-blue.png' },
  },
  {
    id: 'air', name: 'NIVØR AIR', shortName: 'AIR', category: 'Лёгкие travel-наушники',
    headline: 'Легче воздуха.', accent: 'Ближе к музыке.',
    description: 'Компактная складная модель для города и путешествий: весит 218 граммов, мягко садится и не просит розетку до 38 часов.',
    price: 21_990, installment: '4 × 5 498 ₽', rating: '4,8 · 126 отзывов',
    specs: ['AirFlow 36 мм', 'Travel ANC до 36 дБ', 'Вес 218 граммов', 'До 38 часов музыки'],
    images: { graphite: 'nivor-air-graphite.png', sand: 'nivor-air-sand.png', coral: 'nivor-air-coral.png', silver: 'nivor-air-silver.png', blue: 'nivor-air-blue.png' },
  },
  {
    id: 'studio', name: 'NIVØR STUDIO', shortName: 'STUDIO', category: 'Профессиональные мониторы',
    headline: 'Честно до детали.', accent: 'Создано для работы.',
    description: 'Референсные мониторные наушники с глубокими амбушюрами, металлическими вилками и проводным режимом без задержки.',
    price: 39_990, installment: '4 × 9 998 ₽', rating: '4,9 · 92 отзыва',
    specs: ['ReferenceCore 45 мм', '8 Гц — 48 кГц', 'USB-C и 3,5 мм', 'До 60 часов музыки'],
    images: { graphite: 'nivor-studio-graphite.png', sand: 'nivor-studio-sand.png', coral: 'nivor-studio-coral.png', silver: 'nivor-studio-silver.png', blue: 'nivor-studio-blue.png' },
  },
];

export type CartItem = { modelId: ProductModelId; colorId: ProductColorId; qty: number };
export type CartState = { items: CartItem[] };
export const EMPTY_CART: CartState = { items: [] };

export function formatPrice(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

export function findProduct(modelId: ProductModelId) {
  return PRODUCT_MODELS.find((product) => product.id === modelId) ?? PRODUCT_MODELS[0];
}

export function findColor(colorId: ProductColorId) {
  return PRODUCT_COLORS.find((color) => color.id === colorId) ?? PRODUCT_COLORS[0];
}

export function cartCount(cart: CartState) {
  return cart.items.reduce((sum, item) => sum + item.qty, 0);
}

export function cartTotal(cart: CartState) {
  return cart.items.reduce((sum, item) => sum + findProduct(item.modelId).price * item.qty, 0);
}

export function addCartItem(cart: CartState, modelId: ProductModelId, colorId: ProductColorId, qty = 1): CartState {
  const index = cart.items.findIndex((item) => item.modelId === modelId && item.colorId === colorId);
  if (index === -1) return { items: [...cart.items, { modelId, colorId, qty: Math.max(1, qty) }] };
  return { items: cart.items.map((item, itemIndex) => itemIndex === index ? { ...item, qty: item.qty + Math.max(1, qty) } : item) };
}

export function readCart(): CartState {
  try {
    const saved = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? 'null') as Partial<CartState> | null;
    if (Array.isArray(saved?.items)) {
      const items = saved.items.flatMap((raw) => {
        const model = PRODUCT_MODELS.find((item) => item.id === raw?.modelId);
        const color = PRODUCT_COLORS.find((item) => item.id === raw?.colorId);
        const qty = Math.max(0, Math.floor(Number(raw?.qty) || 0));
        return model && color && qty > 0 ? [{ modelId: model.id, colorId: color.id, qty }] : [];
      });
      return { items };
    }
    const legacy = JSON.parse(window.localStorage.getItem(LEGACY_CART_STORAGE_KEY) ?? 'null') as { qty?: number; color?: string } | null;
    const legacyQty = Math.max(0, Math.floor(Number(legacy?.qty) || 0));
    const legacyColor = PRODUCT_COLORS.find((color) => color.name === legacy?.color) ?? PRODUCT_COLORS[0];
    return legacyQty > 0 ? { items: [{ modelId: 'one', colorId: legacyColor.id, qty: legacyQty }] } : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
}

export function saveCart(cart: CartState) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('nivor-cart-updated', { detail: cart }));
}
