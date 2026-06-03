export type UserRole = 'admin' | 'producer' | 'affiliate' | 'customer';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  affiliate_commission: number;
  producer_id: string;
  status: 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  image_url: string | null;
  images?: string[];
  quantity?: number;
  color?: string;
  size?: string;
  weight?: string;
  condition?: 'novo' | 'usado';
  brand?: string;
  category?: string;
  subcategory?: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  product_id: string;
  affiliate_id: string | null;
  status: 'pending' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  neighborhood: string;
  delivery_fee: number;
  total: number;
  rating?: number;
  review_comment?: string;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  updated_at: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface DeliveryFee {
  id: number;
  neighborhood: string;
  amount: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  discount_type: 'fixed' | 'percentage';
  expiration_date: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
