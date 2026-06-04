export interface AbandonedCart {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image?: string;
  producer_id: string;
  affiliate_id: string | null;
  created_at: string;
  status: 'pending' | 'recovered';
}

const STORAGE_KEY = 'angola_market_abandoned_carts';

export function getAbandonedCarts(): AbandonedCart[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    // Filtrar dados mockados/semeados para que apenas carrinhos reais capturados apareçam
    return Array.isArray(parsed) ? parsed.filter((c: any) => c && c.id && !c.id.startsWith('seed_cart_')) : [];
  } catch (e) {
    console.error('Error parsing abandoned carts', e);
    return [];
  }
}

export function saveAbandonedCarts(carts: AbandonedCart[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carts));
  } catch (e) {
    console.error('Error saving abandoned carts', e);
  }
}

export function addAbandonedCart(
  userId: string | null,
  customerName: string,
  customerEmail: string,
  product: { id: string; name: string; price: number; image_url?: string; producer_id: string },
  affiliateId: string | null
) {
  const carts = getAbandonedCarts();
  
  // To avoid duplicate spamming if the user opens and closes multiple times in a row,
  // let's only register a new one if there wasn't an identical pending one in the last 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const exists = carts.some(c => 
    c.product_id === product.id && 
    c.customer_email === customerEmail && 
    c.status === 'pending' && 
    c.created_at > tenMinutesAgo
  );

  if (exists) return;

  const newCart: AbandonedCart = {
    id: 'cart_' + Math.random().toString(36).substr(2, 9),
    user_id: userId,
    customer_name: customerName,
    customer_email: customerEmail,
    product_id: product.id,
    product_name: product.name,
    product_price: product.price,
    product_image: product.image_url,
    producer_id: product.producer_id,
    affiliate_id: affiliateId,
    created_at: new Date().toISOString(),
    status: 'pending'
  };

  carts.unshift(newCart);
  saveAbandonedCarts(carts);
}

export function recoverAbandonedCart(id: string): boolean {
  const carts = getAbandonedCarts();
  const idx = carts.findIndex(c => c.id === id);
  if (idx !== -1) {
    carts[idx].status = 'recovered';
    saveAbandonedCarts(carts);
    return true;
  }
  return false;
}

export function seedAbandonedCartsIfEmpty(products: any[]) {
  // Desativado para termos realismo total com capturas reais
}
