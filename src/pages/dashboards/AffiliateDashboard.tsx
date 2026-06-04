import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Product, Wallet } from '../../types/database';
import { 
  Users, 
  Share2, 
  DollarSign, 
  TrendingUp, 
  List, 
  ExternalLink,
  Copy,
  Trophy,
  Wallet as WalletIcon,
  User
} from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import ProfileTab from '../../components/ProfileTab';

export default function AffiliateDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'wallet' | 'ranking' | 'profile'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchWallet();
  }, [profile]);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').eq('status', 'approved');
    setProducts(data || []);
  };

  const fetchWallet = async () => {
    if (!profile) return;
    try {
      const { data: completedOrders } = await supabase
        .from('orders')
        .select('*, products!inner(*)')
        .eq('status', 'delivered')
        .eq('affiliate_id', profile.id);

      const { data: withdrawals } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', profile.id);

      let totalEarnings = 0;
      if (completedOrders) {
        completedOrders.forEach((order: any) => {
          const priceNum = Number(order.products.price);
          const affiliateCommPercent = Number(order.products.affiliate_commission) || 0;
          const affiliateReward = affiliateCommPercent > 0 ? priceNum * (affiliateCommPercent / 100) : 0;
          totalEarnings += affiliateReward;
        });
      }

      let totalWithdrawn = 0;
      if (withdrawals) {
        withdrawals.forEach((wd: any) => {
          totalWithdrawn += Number(wd.amount);
        });
      }

      const balance = Math.max(0, totalEarnings - totalWithdrawn);
      setWallet({
        id: profile.id,
        user_id: profile.id,
        balance,
        updated_at: new Date().toISOString()
      } as any);
    } catch (err) {
      console.error("Failed to compute dynamic affiliate wallet balance:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-black">
      <aside className="w-64 border-r border-brand-border p-6 flex flex-col gap-8 hidden md:flex">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Affiliate Area</h2>
        <nav className="flex flex-col gap-1">
          {[
            { id: 'overview', label: 'Estatísticas', icon: <TrendingUp size={20} /> },
            { id: 'marketplace', label: 'Produtos', icon: <List size={20} /> },
            { id: 'wallet', label: 'Minha Carteira', icon: <WalletIcon size={20} /> },
            { id: 'ranking', label: 'Ranking', icon: <Trophy size={20} /> },
            { id: 'profile', label: 'O Meu Perfil', icon: <User size={20} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                  : 'text-gray-400 hover:bg-brand-surface hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
        >
          {activeTab === 'overview' && <OverviewTab wallet={wallet} />}
          {activeTab === 'marketplace' && <ProductsTab products={products} />}
          {activeTab === 'wallet' && <WalletTab wallet={wallet} />}
          {activeTab === 'ranking' && <RankingTab />}
          {activeTab === 'profile' && <ProfileTab />}
        </motion.div>
      </main>
    </div>
  );
}

function OverviewTab({ wallet }: any) {
  const stats = [
    { label: 'Cliques totais', value: '1,248', icon: <ExternalLink /> },
    { label: 'Conversão', value: '4.2%', icon: <TrendingUp /> },
    { label: 'Vendas Afiliadas', value: '52', icon: <Share2 /> },
    { label: 'Saldo Acumulado', value: `Kz ${Number(wallet?.balance || 0).toLocaleString()}`, icon: <DollarSign /> },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold font-display mb-2">Painel do Afiliado</h1>
        <p className="text-gray-500">Promova os melhores produtos de Angola e ganhe comissões.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="premium-card p-6">
            <div className="w-12 h-12 bg-brand-dark rounded-xl flex items-center justify-center text-brand-blue border border-brand-border mb-4">
              {stat.icon}
            </div>
            <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold font-display">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductsTab({ products }: { products: Product[] }) {
  const { profile } = useAuth();

  const generateLink = (productId: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/product/${productId}?ref=${profile?.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link de afiliado copiado!');
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold font-display">Produtos Disponíveis</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {products.map((p) => (
          <div key={p.id} className="premium-card p-6 flex gap-6 items-center">
            <img src={p.image_url || ''} className="w-24 h-24 rounded-xl object-cover bg-brand-dark" />
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">{p.name}</h3>
              <p className="text-brand-blue font-bold text-sm mb-4">Kz {Number(p.price).toLocaleString()}</p>
              <div className="flex items-center justify-between">
                <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded">
                  Comissão: {p.affiliate_commission}%
                </span>
                <button 
                  onClick={() => generateLink(p.id)}
                  className="premium-button-primary py-2 px-6 text-sm flex items-center gap-2"
                >
                  <Copy size={14} /> Link
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WalletTab({ wallet }: any) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('IBAN');

  const requestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    const fee = 200; // Fixed fee for affiliates
    
    if (val + fee > (wallet?.balance || 0)) {
      toast.error('Saldo insuficiente (Taxa de 200 Kz inclusa)');
      return;
    }

    const { error } = await supabase.from('withdrawals').insert([{
      user_id: wallet.user_id,
      amount: val,
      method,
      status: 'pending'
    }]);

    if (error) toast.error('Erro ao processar pedido');
    else toast.success('Pedido enviado! Taxa de 200 Kz descontada.');
  };

  return (
    <div className="space-y-12">
      <h2 className="text-3xl font-bold font-display">Minha Carteira</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="premium-card p-8 flex flex-col justify-center items-center text-center">
           <WalletIcon size={48} className="text-brand-blue mb-4" />
           <p className="text-gray-500 mb-2">Saldo Afiliado</p>
           <p className="text-5xl font-bold font-display tracking-tighter">Kz {Number(wallet?.balance || 0).toLocaleString()}</p>
           <p className="mt-4 text-xs text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-lg">
             Atenção: Taxa fixa de 200 Kz por levantamento aplicada.
           </p>
        </div>

        <div className="premium-card p-8">
          <h3 className="text-xl font-bold mb-6">Solicitar Levantamento</h3>
          <form onSubmit={requestWithdrawal} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Valor (Kz)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="premium-input w-full" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Método</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="premium-input w-full">
                <option value="IBAN">IBAN</option>
                <option value="Unitel Money">Unitel Money</option>
                <option value="Afrimoney">Afrimoney</option>
              </select>
            </div>
            <button type="submit" className="premium-button-primary w-full">Confirmar Levantamento</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function RankingTab() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold font-display">Affiliate Rankings</h2>
      <div className="premium-card p-12 text-center text-gray-500">
         Mostra os melhores afiliados da semana. Disponível em breve...
      </div>
    </div>
  );
}
