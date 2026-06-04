import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types/database';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Star, 
  MessageSquare,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  User
} from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import ProfileTab from '../../components/ProfileTab';

export default function CustomerDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) fetchOrders();
  }, [profile]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, products(name, image_url)')
      .eq('customer_id', profile?.id)
      .order('created_at', { ascending: false });
    
    setOrders(data || []);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/10 text-green-500';
      case 'out_for_delivery': return 'bg-blue-500/10 text-blue-500';
      case 'cancelled': return 'bg-red-500/10 text-red-500';
      default: return 'bg-yellow-500/10 text-yellow-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-display mb-2">Olá, {profile?.name}</h1>
        <p className="text-gray-500">Acompanhe as suas encomendas e o seu histórico de compras.</p>
      </div>

      {/* Navegação horizontal */}
      <div className="mb-10 border-b border-brand-border/40 pb-4 flex gap-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2 font-bold font-display text-xs tracking-widest uppercase transition-all border-b-2 cursor-pointer ${
            activeTab === 'orders' ? 'border-brand-blue text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Minhas Encomendas
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-2 font-bold font-display text-xs tracking-widest uppercase transition-all border-b-2 cursor-pointer ${
            activeTab === 'profile' ? 'border-brand-blue text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          O Meu Perfil
        </button>
      </div>

      {activeTab === 'profile' ? (
        <ProfileTab />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Orders Column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package className="text-brand-blue" />
              Minhas Encomendas
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="premium-card h-32 animate-pulse" />)}
              </div>
            ) : orders.length > 0 ? (
              orders.map((order: any) => (
                <div key={order.id} className="premium-card p-6 flex flex-col md:flex-row gap-6">
                  <img 
                    src={order.products?.image_url || ''} 
                    className="w-24 h-24 rounded-xl object-cover bg-brand-dark" 
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{order.products?.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock size={14} /> {new Date(order.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {order.neighborhood}</span>
                      <span className="flex items-center gap-1"><TrendingUp size={14} /> Total: Kz {Number(order.total).toLocaleString()}</span>
                    </div>
                    
                    {order.status === 'delivered' && !order.rating && (
                      <button className="mt-4 text-brand-blue text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer">
                        <Star size={14} /> Avaliar Produto
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="premium-card p-12 text-center">
                <ShoppingBag className="mx-auto text-gray-700 mb-4" size={48} />
                <p className="text-gray-500">Ainda não fez nenhuma encomenda.</p>
                <button className="text-brand-blue mt-4 font-bold cursor-pointer">Ver Marketplace</button>
              </div>
            )}
          </div>

          {/* Sidebar Mini-stats */}
          <div className="space-y-6">
            <div className="premium-card p-6">
              <h3 className="font-bold mb-4">Informação de Conta</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span className="text-gray-500">Função</span>
                  <span className="capitalize">Cliente</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span className="text-gray-500">Membro desde</span>
                  <span>{new Date(profile?.created_at || '').getFullYear()}</span>
                </div>
              </div>
            </div>

            <div className="premium-card p-6 bg-brand-blue/5 border-brand-blue/20">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-green-500" size={18} />
                AngolaMarkt Express
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                O seu bairro está elegível para entrega rápida via Cash on Delivery nas encomendas nacionais.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
