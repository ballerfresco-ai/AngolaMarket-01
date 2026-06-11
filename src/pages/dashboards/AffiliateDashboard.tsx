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
  User,
  ShoppingCart,
  ListOrdered,
  CheckCircle,
  XCircle,
  Mail,
  Check,
  ShoppingBag,
  CreditCard,
  Calculator,
  X,
  Menu,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import ProfileTab from '../../components/ProfileTab';
import { getAbandonedCarts, recoverAbandonedCart, AbandonedCart } from '../../lib/abandonedCarts';
import { parseOrderDetails } from '../../lib/orderDetails';

export default function AffiliateDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'wallet' | 'ranking' | 'profile'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsMobileMenuOpen(prev => !prev);
    window.addEventListener('toggle-dashboard-drawer', handleToggle);
    return () => window.removeEventListener('toggle-dashboard-drawer', handleToggle);
  }, []);

  const [products, setProducts] = useState<Product[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchProducts();
      fetchWallet();
      fetchOrders();
    }
  }, [profile]);

  useEffect(() => {
    if (profile && activeTab === 'marketplace') {
      fetchProducts();
    }
  }, [profile, activeTab]);

  const fetchOrders = async () => {
    if (!profile) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, products!inner(*)')
        .eq('affiliate_id', profile.id);
      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error("Error fetching affiliate orders:", err);
    }
  };

  const fetchProducts = async () => {
    if (!profile) return;
    try {
      setLoadingProducts(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      setProducts(data || []);
    } catch (err: any) {
      console.error("Error fetching affiliate products:", err);
      toast.error('Erro ao carregar produtos: ' + err.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchWallet = async () => {
    if (!profile) return;
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setWallet(data);
      } else {
        // Se a carteira não existir, criá-la fisicamente com saldo inicial de 0
        const newWallet = {
          id: profile.id,
          user_id: profile.id,
          balance: 0,
          updated_at: new Date().toISOString()
        };
        const { data: upsertData } = await supabase
          .from('wallets')
          .upsert(newWallet, { onConflict: 'user_id' })
          .select()
          .maybeSingle();

        setWallet(upsertData || (newWallet as any));
      }
    } catch (err) {
      console.error("Failed to fetch physical affiliate wallet balance:", err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-brand-black text-white">
      {/* Mobile Sidebar (Drawer) sliding from the left */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            
            {/* Sidebar drawer panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-brand-surface border-r border-brand-border z-50 md:hidden flex flex-col p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white font-bold text-base shadow-md shadow-brand-blue/20">
                    AF
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white font-display">Navegação</h2>
                    <p className="text-[10px] text-gray-400 font-mono">Affiliate Area</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 border border-brand-border rounded-xl text-gray-400 hover:text-white bg-brand-dark/50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col gap-1 overflow-y-auto pr-1">
                {[
                  { id: 'overview', label: 'Estatísticas', icon: <TrendingUp size={20} /> },
                  { id: 'marketplace', label: 'Produtos', icon: <List size={20} /> },
                  { id: 'wallet', label: 'Minha Carteira', icon: <WalletIcon size={20} /> },
                  { id: 'ranking', label: 'Ranking', icon: <Trophy size={20} /> },
                  { id: 'profile', label: 'O Meu Perfil', icon: <User size={20} /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id 
                        ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                        : 'text-gray-400 hover:bg-brand-dark hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium text-sm">{item.label}</span>
                    {activeTab === item.id && <ChevronRight className="ml-auto text-white" size={16} />}
                  </button>
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t border-brand-border text-center">
                <p className="text-xs text-gray-500 font-mono">© 2026 AI Studio Build</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar for Desktop */}
      <aside className="w-64 border-r border-brand-border p-6 flex flex-col gap-8 hidden md:flex shrink-0">
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

      <main className="flex-1 p-4 md:p-12 overflow-y-auto">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
        >
          {activeTab === 'overview' && <OverviewTab wallet={wallet} orders={orders} />}
          {activeTab === 'marketplace' && <ProductsTab products={products} loading={loadingProducts} />}
          {activeTab === 'wallet' && <WalletTab wallet={wallet} onRefresh={fetchWallet} />}
          {activeTab === 'ranking' && <RankingTab />}
          {activeTab === 'profile' && <ProfileTab />}
        </motion.div>
      </main>
    </div>
  );
}

function OverviewTab({ wallet, orders }: any) {
  const { profile } = useAuth();
  const [localAbandonedCarts, setLocalAbandonedCarts] = useState<AbandonedCart[]>([]);

  useEffect(() => {
    if (profile) {
      // Filter abandoned carts for this referrer
      const carts = getAbandonedCarts().filter(c => c.affiliate_id === profile.id);
      setLocalAbandonedCarts(carts);
    }
  }, [profile]);

  const handleRecoverCart = (cartId: string, email: string) => {
    const success = recoverAbandonedCart(cartId);
    if (success) {
      toast.success(`E-mail de recuperação enviado para: ${email}`);
      if (profile) {
        setLocalAbandonedCarts(getAbandonedCarts().filter(c => c.affiliate_id === profile.id));
      }
    }
  };

  // Calculations for Affiliate's referred orders
  const totalSalesCount = orders.length;
  const completedOrders = orders.filter((o: any) => o.status === 'delivered');
  const pendingOrders = orders.filter((o: any) => o.status === 'pending' || o.status === 'processing' || o.status === 'out_for_delivery');
  const cancelledOrders = orders.filter((o: any) => o.status === 'cancelled');

  // Revenue (Faturamento total correspondente)
  const totalFaturamento = completedOrders.reduce((sum: number, o: any) => sum + Number(o.products?.price || 0), 0);

  // Splits of Referred Orders
  let sellerNetTotal = 0;
  let affiliateNetTotal = 0;
  let adminNetTotal = 0;

  completedOrders.forEach((o: any) => {
    const priceNum = Number(o.products?.price || 0);
    const affiliateCommPercent = Number(o.products?.affiliate_commission) || 0;
    const platformFee = priceNum * 0.10; // 10%
    const affiliateReward = affiliateCommPercent > 0 ? priceNum * (affiliateCommPercent / 100) : 0;
    const sellerNet = Math.max(0, priceNum - platformFee - affiliateReward);

    sellerNetTotal += sellerNet;
    affiliateNetTotal += affiliateReward;
    adminNetTotal += platformFee;
  });

  // Abandoned Carts totals
  const abandonedCount = localAbandonedCarts.length;
  const abandonedValue = localAbandonedCarts.reduce((sum, c) => sum + (c.status === 'pending' ? Number(c.product_price) : 0), 0);

  // Payment methods breakdown for referred orders
  const paymentDistribution: { [key: string]: { count: number; value: number } } = {
    'Pagamento no Ato de Entrega': { count: 0, value: 0 },
    'Multicaixa Express': { count: 0, value: 0 },
    'Transferência Bancária': { count: 0, value: 0 }
  };

  orders.forEach((o: any) => {
    const details = parseOrderDetails(o.neighborhood);
    const method = details.paymentMethod || 'Pagamento no Ato de Entrega';
    if (paymentDistribution[method]) {
      paymentDistribution[method].count += 1;
      paymentDistribution[method].value += Number(o.products?.price || 0);
    } else {
      paymentDistribution[method] = { count: 1, value: Number(o.products?.price || 0) };
    }
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold font-display text-white tracking-tight">Painel de Métricas do Afiliado</h1>
        <p className="text-sm text-gray-400 font-sans mt-1">Monitorize os cliques, taxas de conversão, divisão líquida e canais de despacho indicados.</p>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Wallet Balance */}
        <div className="premium-card p-6 bg-gradient-to-br from-brand-surface/80 to-brand-blue/5 border-brand-blue/20">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-xl">
              <DollarSign size={20} />
            </span>
            <span className="text-[10px] font-mono py-0.5 px-2 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full font-bold uppercase tracking-wider">
              Disponível
            </span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 font-sans">A Minha Carteira</p>
          <p className="text-2xl font-bold text-white font-display">Kz {Number(wallet?.balance || 0).toLocaleString()}</p>
          <span className="text-[10px] text-gray-500 block mt-1 font-mono">Ganhos de comissão líquida de indicação</span>
        </div>

        {/* Faturamento e Distribuição */}
        <div className="premium-card p-6 border-brand-border/40">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <TrendingUp size={20} />
            </span>
            <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider">
              Comissões
            </span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-sans">Divisão das Suas Indicações</p>
          <div className="space-y-1.5 text-xs text-gray-300 font-mono">
            <div className="flex justify-between">
              <span className="text-gray-500">Volume Indicado:</span>
              <span className="text-white font-semibold">Kz {totalFaturamento.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Suas Comissões:</span>
              <span className="text-green-500 font-semibold">Kz {affiliateNetTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-brand-border/50 pt-1.5">
              <span className="text-gray-500">Sellers (Produtores):</span>
              <span className="text-pink-400 font-semibold">Kz {sellerNetTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Encomendas Indicadas */}
        <div className="premium-card p-6 border-brand-border/40">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl">
              <ListOrdered size={20} />
            </span>
            <span className="text-[10px] font-mono py-0.5 px-2 bg-brand-surface border border-brand-border text-gray-400 rounded-full font-bold uppercase tracking-wider">
              Vendas: {totalSalesCount}
            </span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-sans">Conversões em Angolanas</p>
          <div className="space-y-1.5 text-xs text-gray-300 font-mono">
            <div className="flex justify-between">
              <span className="text-gray-500">Concluídos:</span>
              <span className="text-green-500 font-semibold">{completedOrders.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pendentes:</span>
              <span className="text-yellow-500 font-semibold">{pendingOrders.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cancelados:</span>
              <span className="text-red-500 font-semibold">{cancelledOrders.length}</span>
            </div>
          </div>
        </div>

        {/* Carrinhos Abandonados do Link */}
        <div className="premium-card p-6 bg-gradient-to-br from-brand-surface/80 to-pink-500/[0.03] border-pink-500/15">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-xl">
              <ShoppingCart size={20} />
            </span>
            <span className="text-[10px] font-mono py-0.5 px-2 bg-pink-500/10 text-pink-500 rounded-full font-bold uppercase tracking-wider">
              Seus Links
            </span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 font-sans">Cliques Abandonados</p>
          <p className="text-2xl font-bold text-white font-display">{abandonedCount} perdidos</p>
          <span className="text-[10px] text-pink-400/90 block mt-1 font-mono">Volume retido: Kz {abandonedValue.toLocaleString()}</span>
        </div>
      </div>

      {/* Methods and tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="premium-card p-6 lg:col-span-2 border-brand-border/40 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2 mb-1">
              <CreditCard size={18} className="text-brand-blue" /> Canais Preferidos de Compra (Seus Links)
            </h3>
            <p className="text-xs text-gray-500 font-sans mb-6">Volume acumulado de pagamentos de cliques convertidos por você.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(paymentDistribution).map(([method, data]) => {
                const percentage = totalFaturamento > 0 ? Math.round((data.value / totalFaturamento) * 100) : 0;
                return (
                  <div key={method} className="p-4 rounded-xl bg-brand-dark/50 border border-brand-border/40 space-y-3">
                    <span className="text-xs font-bold text-gray-400 block truncate">{method}</span>
                    <div>
                      <span className="text-2xl font-bold text-white block">{data.count}</span>
                      <span className="text-[10px] text-brand-blue font-mono block">Valor: Kz {data.value.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-brand-dark h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-brand-blue h-full rounded-full" 
                        style={{ width: `${Math.max(5, percentage)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono block text-right">{percentage}% das indicações</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-4 border-t border-brand-border/40 mt-6 text-[10px] text-gray-500 font-sans">
            * Dados calculados apenas com referência ao seu parâmetro único de indicação (?ref=ID)
          </div>
        </div>

        {/* Small educational card */}
        <div className="premium-card p-6 border-brand-border/40 bg-gradient-to-br from-brand-surface to-brand-blue/[0.02]">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
            <Share2 size={20} />
          </div>
          <h3 className="text-lg font-bold text-white font-display mb-2">Aumente os Seus Ganhos</h3>
          <p className="text-xs text-gray-400 font-sans leading-relaxed">
            Partilhe os seus links de afiliado nas redes sociais como WhatsApp, Facebook e Instagram para atrair potenciais compradores angolanos.
          </p>
          <div className="h-px bg-brand-border/50 my-4" />
          <p className="text-xs text-gray-400 font-sans leading-relaxed">
            Quando um utilizador inicia o preenchimento dos dados no checkout mas não conclui, o sistema captura como <strong>Carrinho Abandonado</strong> do seu link. Pode tentar recapturá-los contactando o utilizador abaixo!
          </p>
        </div>
      </div>

      {/* Abandoned Carts specific to this Affiliate */}
      <div className="premium-card p-6 border-brand-border/40">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold font-display text-white">Carrinhos Abandonados dos Seus Links</h2>
            <p className="text-xs text-gray-400 font-sans mt-0.5">Potenciais clientes que acederam ao checkout com o seu código de afiliado mas deixaram a compra pela metade.</p>
          </div>
          <span className="font-mono text-xs font-bold text-pink-400 py-1 px-3 rounded-full bg-pink-500/10 border border-pink-500/20">
            {localAbandonedCarts.filter(c => c.status === 'pending').length} Carrinhos Pendentes
          </span>
        </div>

        {localAbandonedCarts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-brand-border/40 rounded-2xl bg-brand-dark/20">
            <ShoppingBag className="mx-auto text-gray-600 mb-3" size={32} />
            <p className="text-sm font-sans text-gray-400">Nenhum carrinho abandonado atribuído aos seus links de afiliado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-brand-border/60 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <th className="pb-2 text-left">Utilizador</th>
                  <th className="pb-2 text-left">Produto Tentado</th>
                  <th className="pb-2 text-left">Comissão Esperada</th>
                  <th className="pb-2 text-left">Abandono em</th>
                  <th className="pb-2 text-center">Estado</th>
                  <th className="pb-2 text-right">Ação recomendada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {localAbandonedCarts.map((cart) => (
                  <tr key={cart.id} className="hover:bg-brand-surface/20 transition-colors">
                    <td className="py-4">
                      <span className="font-bold text-white block">{cart.customer_name}</span>
                      <span className="text-xs text-gray-500 block font-mono">{cart.customer_email}</span>
                    </td>
                    <td className="py-4 font-medium text-gray-300 max-w-[180px] truncate">
                      {cart.product_name}
                    </td>
                    <td className="py-4 font-mono font-semibold text-green-500">
                      Kz {Number(cart.product_price * 0.1).toLocaleString()} <span className="text-[10px] text-gray-400 font-sans font-normal">(Est. 10%)</span>
                    </td>
                    <td className="py-4 text-xs text-gray-400 font-mono">
                      {new Date(cart.created_at).toLocaleDateString('pt-AO')}
                    </td>
                    <td className="py-4 text-center">
                      <span className={`inline-block py-0.5 px-2 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                        cart.status === 'recovered' 
                          ? 'bg-green-500/10 border border-green-500/20 text-green-500' 
                          : 'bg-red-500/10 border border-red-500/20 text-red-500 animate-pulse'
                      }`}>
                        {cart.status === 'recovered' ? 'Recuperado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {cart.status === 'recovered' ? (
                        <div className="text-xs text-green-500 font-bold font-mono">
                          ✓ Email Enviado!
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRecoverCart(cart.id, cart.customer_email)}
                          className="premium-button py-1.5 px-3.5 text-xs font-bold text-brand-blue bg-brand-blue/5 border border-brand-blue/20 hover:bg-brand-blue hover:text-white cursor-pointer rounded-xl font-mono flex items-center gap-1 ml-auto uppercase tracking-wide"
                        >
                          <Mail size={12} /> Contactar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductsTab({ products, loading }: { products: Product[]; loading: boolean }) {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const generateLink = (productId: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/product/${productId}?ref=${profile?.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link de afiliado copiado!');
  };

  const filteredProducts = products.filter((p) =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display text-white">Produtos Disponíveis</h2>
          <p className="text-sm text-gray-400 font-sans mt-1">Gere links de afiliado comissíveis e partilhe para faturar Kz.</p>
        </div>
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Pesquisar por nome do produto..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2.5 bg-brand-surface border border-brand-border/60 rounded-xl text-sm focus:outline-none focus:border-brand-blue font-sans text-white placeholder-gray-500 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400 font-sans">A carregar produtos disponíveis...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {paginatedProducts.map((p) => (
            <div key={p.id} className="premium-card p-6 flex gap-6 items-center">
              <img src={p.image_url || ''} className="w-24 h-24 rounded-xl object-cover bg-brand-dark" />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                <p className="text-brand-blue font-bold text-sm mb-4">Kz {Number(p.price).toLocaleString()}</p>
                <div className="flex items-center justify-between">
                  <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded">
                    Comissão: {p.affiliate_commission || 0}%
                  </span>
                  <button 
                    onClick={() => generateLink(p.id)}
                    className="premium-button-primary py-2.5 px-4 text-xs flex items-center gap-2"
                  >
                    <Copy size={13} /> Afiliar-se & Obter Link
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 text-sm font-sans">
              Nenhum produto encontrado.
            </div>
          )}
        </div>
      )}

      {/* Controles de Paginação */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-brand-border/20">
          <p className="text-xs text-gray-400 font-sans">
            A mostrar <span className="font-semibold text-white">{startIndex + 1}</span> a <span className="font-semibold text-white">{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</span> de <span className="font-semibold text-white">{filteredProducts.length}</span> produtos
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-brand-surface border border-brand-border rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-brand-surface/85 transition-colors"
            >
              Anterior
            </button>
            <span className="text-xs text-gray-400 font-mono">
              Pág. <span className="text-white font-semibold">{currentPage}</span> de <span className="text-white font-semibold">{totalPages}</span>
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-brand-surface border border-brand-border rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-brand-surface/85 transition-colors"
            >
              Seguinte
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function WalletTab({ wallet, onRefresh }: { wallet: any; onRefresh: () => void }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('IBAN');

  const requestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    const fee = 200; // Fixed fee for affiliates
    
    if (isNaN(val) || val <= 0) {
      toast.error('Por favor, insira um valor válido maior que zero.');
      return;
    }

    if (val + fee > (wallet?.balance || 0)) {
      toast.error('Saldo insuficiente (Taxa de 200 Kz inclusa)');
      return;
    }

    try {
      // 1. Inserir pedido de levantamento
      const { error: wdErr } = await supabase.from('withdrawals').insert([{
        user_id: wallet.user_id,
        amount: val,
        method,
        status: 'pending'
      }]);

      if (wdErr) throw wdErr;

      // 2. Deduzir saldo da carteira física
      const newBalance = Number(wallet.balance) - val;
      const { error: walletErr } = await supabase
        .from('wallets')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', wallet.user_id);

      if (walletErr) throw walletErr;

      toast.success('Pedido enviado e saldo atualizado com êxito! Taxa de 200 Kz descontada.');
      setAmount('');
      onRefresh();
    } catch (err: any) {
      console.error("Error submitting affiliate withdrawal:", err);
      toast.error('Erro ao submeter pedido: ' + err.message);
    }
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
