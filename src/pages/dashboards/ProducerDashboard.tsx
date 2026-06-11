import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Product, Wallet, Order } from '../../types/database';
import { 
  Package, 
  Plus, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Wallet as WalletIcon,
  Star,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Upload,
  X,
  Menu,
  Calculator,
  AlertCircle,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import ProfileTab from '../../components/ProfileTab';
import { getAbandonedCarts, AbandonedCart, recoverAbandonedCart } from '../../lib/abandonedCarts';
import { parseOrderDetails } from '../../lib/orderDetails';
import { ListOrdered, CheckCircle, XCircle, TrendingDown, CreditCard, ShoppingBag, Mail, Check, Users } from 'lucide-react';

export default function ProducerDashboard() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'wallet' | 'profile'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsMobileMenuOpen(prev => !prev);
    window.addEventListener('toggle-dashboard-drawer', handleToggle);
    return () => window.removeEventListener('toggle-dashboard-drawer', handleToggle);
  }, []);

  useEffect(() => {
    if (profile) {
      fetchProducts();
      fetchWallet();
      fetchOrders();
    }
  }, [profile]);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').eq('producer_id', profile?.id).order('created_at', { ascending: false });
    setProducts(data || []);
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
      console.error("Failed to fetch physical producer wallet balance:", err);
    }
  };

  const fetchOrders = async () => {
    // This would ideally join with product table to only see your products
    const { data } = await supabase.from('orders').select('*, products!inner(*)').eq('products.producer_id', profile?.id);
    setOrders(data || []);
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
                    P
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white font-display">Navegação</h2>
                    <p className="text-[10px] text-gray-400 font-mono">Producer Hub</p>
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
                  { id: 'products', label: 'Meus Produtos', icon: <Package size={20} /> },
                  { id: 'orders', label: 'Encomendas', icon: <ShoppingCart size={20} /> },
                  { id: 'wallet', label: 'Minha Carteira', icon: <WalletIcon size={20} /> },
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
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Producer Hub</h2>
        <nav className="flex flex-col gap-1">
          {[
            { id: 'overview', label: 'Estatísticas', icon: <TrendingUp size={20} /> },
            { id: 'products', label: 'Meus Produtos', icon: <Package size={20} /> },
            { id: 'orders', label: 'Encomendas', icon: <ShoppingCart size={20} /> },
            { id: 'wallet', label: 'Minha Carteira', icon: <WalletIcon size={20} /> },
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
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {activeTab === 'overview' && <OverviewTab products={products} orders={orders} wallet={wallet} />}
            {activeTab === 'products' && (
              <ProductsTab 
                products={products} 
                isAdding={isAddingProduct} 
                setIsAdding={setIsAddingProduct} 
                refresh={fetchProducts} 
              />
            )}
            {activeTab === 'wallet' && <WalletTab wallet={wallet} refresh={fetchWallet} />}
            {activeTab === 'profile' && <ProfileTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function OverviewTab({ products, orders, wallet }: any) {
  const { profile } = useAuth();
  const [localAbandonedCarts, setLocalAbandonedCarts] = useState<AbandonedCart[]>([]);

  useEffect(() => {
    if (profile) {
      // Filter abandoned carts for this producer's products
      const carts = getAbandonedCarts().filter(c => c.producer_id === profile.id);
      setLocalAbandonedCarts(carts);
    }
  }, [profile]);

  const handleRecoverCart = (cartId: string, email: string) => {
    const success = recoverAbandonedCart(cartId);
    if (success) {
      toast.success(`E-mail de recuperação enviado para: ${email}`);
      if (profile) {
        setLocalAbandonedCarts(getAbandonedCarts().filter(c => c.producer_id === profile.id));
      }
    }
  };

  // Calculations for Producer's orders
  const totalSalesCount = orders.length;
  const completedOrders = orders.filter((o: any) => o.status === 'delivered');
  const pendingOrders = orders.filter((o: any) => o.status === 'pending' || o.status === 'processing' || o.status === 'out_for_delivery');
  const cancelledOrders = orders.filter((o: any) => o.status === 'cancelled');

  // Revenue (Faturamento total de produtos)
  const totalFaturamento = completedOrders.reduce((sum: number, o: any) => sum + Number(o.products?.price || 0), 0);

  // Split calculation
  let sellerNetTotal = 0;
  let affiliateNetTotal = 0;
  let adminNetTotal = 0;

  completedOrders.forEach((o: any) => {
    const priceNum = Number(o.products?.price || 0);
    const affiliateCommPercent = Number(o.products?.affiliate_commission) || 0;
    const platformFee = priceNum * 0.10; // 10%
    const affiliateReward = affiliateCommPercent > 0 && o.affiliate_id ? priceNum * (affiliateCommPercent / 100) : 0;
    const sellerNet = Math.max(0, priceNum - platformFee - affiliateReward);

    sellerNetTotal += sellerNet;
    affiliateNetTotal += affiliateReward;
    adminNetTotal += platformFee;
  });

  // Abandoned Carts totals
  const abandonedCount = localAbandonedCarts.length;
  const abandonedValue = localAbandonedCarts.reduce((sum, c) => sum + (c.status === 'pending' ? Number(c.product_price) : 0), 0);

  // Payment methods distribution for Producer's sales
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
        <h1 className="text-3xl font-bold font-display text-white tracking-tight">Painel de Métricas do Produtor</h1>
        <p className="text-sm text-gray-400 font-sans mt-1">Acompanhe relatórios de faturamento líquido, comissões compartilhadas e canais de checkout.</p>
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 font-sans">O Meu Saldo Líquido</p>
          <p className="text-2xl font-bold text-white font-display">Kz {Number(wallet?.balance || 0).toLocaleString()}</p>
          <span className="text-[10px] text-gray-500 block mt-1 font-mono">Taxas de 10% deduzidas do saldo</span>
        </div>

        {/* Faturamento e Líquidos */}
        <div className="premium-card p-6 border-brand-border/40">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <TrendingUp size={20} />
            </span>
            <span className="text-[10px] text-brand-blue font-mono font-bold uppercase tracking-wider">
              Receitas
            </span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-sans">Divisão Financeira (Seus Itens)</p>
          <div className="space-y-1.5 text-xs text-gray-300 font-mono">
            <div className="flex justify-between">
              <span className="text-gray-500">Faturamento Bruto:</span>
              <span className="text-white font-semibold">Kz {totalFaturamento.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Líquido Seller (Você):</span>
              <span className="text-green-500 font-semibold">Kz {sellerNetTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-brand-border/50 pt-1.5">
              <span className="text-gray-500">Afiliados / Admin:</span>
              <span className="text-pink-400 font-semibold">Kz {(affiliateNetTotal + adminNetTotal).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Status de Pedidos */}
        <div className="premium-card p-6 border-brand-border/40">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl">
              <ListOrdered size={20} />
            </span>
            <span className="text-[10px] font-mono py-0.5 px-2 bg-brand-surface border border-brand-border text-gray-400 rounded-full font-bold uppercase tracking-wider">
              Pedidos: {totalSalesCount}
            </span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-sans">Filas de Despacho</p>
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

        {/* Carrinhos Abandonados do Produtor */}
        <div className="premium-card p-6 bg-gradient-to-br from-brand-surface/80 to-pink-500/[0.03] border-pink-500/15">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-xl">
              <ShoppingCart size={20} />
            </span>
            <span className="text-[10px] font-mono py-0.5 px-2 bg-pink-500/10 text-pink-500 rounded-full font-bold uppercase tracking-wider">
              Seus Artigos
            </span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 font-sans">Carrinhos Abandonados</p>
          <p className="text-2xl font-bold text-white font-display">{abandonedCount} pendentes</p>
          <span className="text-[10px] text-pink-400/90 block mt-1 font-mono">Volume retido: Kz {abandonedValue.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment methods and statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="premium-card p-6 lg:col-span-2 border-brand-border/40 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2 mb-1">
              <CreditCard size={18} className="text-brand-blue" /> Métodos de Pagamento (Suas Vendas)
            </h3>
            <p className="text-xs text-gray-500 font-sans mb-6">Volume financeiro de fecho por canal preferível de pagamento.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(paymentDistribution).map(([method, data]) => {
                const percentage = totalFaturamento > 0 ? Math.round((data.value / totalFaturamento) * 100) : 0;
                return (
                  <div key={method} className="p-4 rounded-xl bg-brand-dark/50 border border-brand-border/40 space-y-3">
                    <span className="text-xs font-bold text-gray-400 block truncate">{method}</span>
                    <div>
                      <span className="text-2xl font-bold text-white block">{data.count}</span>
                      <span className="text-[10px] text-brand-blue font-mono block">Volume: Kz {data.value.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-brand-dark h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-brand-blue h-full rounded-full" 
                        style={{ width: `${Math.max(5, percentage)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono block text-right">{percentage}% do total</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-4 border-t border-brand-border/40 mt-6 text-[10px] text-gray-500 font-sans">
            * Estatísticas computadas unicamente sobre os seus produtos ativos e vendidos.
          </div>
        </div>

        {/* Small tips card */}
        <div className="premium-card p-6 border-brand-border/40 bg-gradient-to-br from-brand-surface to-brand-blue/[0.02]">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/15 flex items-center justify-center text-brand-blue border border-brand-blue/25 mb-4">
            <Calculator size={20} />
          </div>
          <h3 className="text-lg font-bold text-white font-display mb-2">Comissões & Campanhas</h3>
          <p className="text-xs text-gray-400 font-sans leading-relaxed">
            Aumente as suas vendas permitindo comissões maiores para afiliados. Produtos com comissão acima de 20% tendem a atrair mais promotores e canais de tração em Angola.
          </p>
          <div className="h-px bg-brand-border/50 my-4" />
          <p className="text-xs text-gray-400 font-sans leading-relaxed">
            Consulte a secção de <strong>"Meus Produtos"</strong> para alterar valores de comissão e status de listagem instantaneamente.
          </p>
        </div>
      </div>

      {/* Abandoned Carts specific to this Producer */}
      <div className="premium-card p-6 border-brand-border/40">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold font-display text-white">Carrinhos Abandonados dos Seus Artigos</h2>
            <p className="text-xs text-gray-400 font-sans mt-0.5">Potenciais compradores que abandonaram os seus produtos no checkout.</p>
          </div>
          <span className="font-mono text-xs font-bold text-pink-400 py-1 px-3 rounded-full bg-pink-500/10 border border-pink-500/20">
            {localAbandonedCarts.filter(c => c.status === 'pending').length} Abandono(s) Ativo(s)
          </span>
        </div>

        {localAbandonedCarts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-brand-border/40 rounded-2xl bg-brand-dark/20">
            <ShoppingBag className="mx-auto text-gray-600 mb-3" size={32} />
            <p className="text-sm font-sans text-gray-400">Nenhum carrinho abandonado detetado para os seus produtos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-brand-border/60 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <th className="pb-2 text-left">Contacto do Interessado</th>
                  <th className="pb-2 text-left">Produto</th>
                  <th className="pb-2 text-left">Preço</th>
                  <th className="pb-2 text-left">Data</th>
                  <th className="pb-2 text-center">Estado</th>
                  <th className="pb-2 text-right">Acção</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {localAbandonedCarts.map((cart) => (
                  <tr key={cart.id} className="hover:bg-brand-surface/20 transition-colors">
                    <td className="py-4 font-mono">
                      <span className="font-bold text-white block font-sans">{cart.customer_name}</span>
                      <span className="text-xs text-gray-500 block">{cart.customer_email}</span>
                    </td>
                    <td className="py-4">
                      <span className="font-medium text-gray-300 block truncate max-w-[170px]">{cart.product_name}</span>
                    </td>
                    <td className="py-4 font-mono font-semibold text-white">
                      Kz {Number(cart.product_price).toLocaleString()}
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
                          ✓ Recuperado!
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

function parseProductMeta(product: any) {
  let description = product.description || '';
  let images = product.image_url ? [product.image_url] : [];
  let quantity = 1;
  let color = '';
  let size = '';
  let weight = '';
  let condition = 'novo' as 'novo' | 'usado';
  let brand = '';
  let category = 'Outros';
  let subcategory = 'Diversos';

  try {
    if (description && description.trim().startsWith('{') && description.trim().endsWith('}')) {
      const meta = JSON.parse(description);
      description = meta.realDescription || '';
      images = Array.isArray(meta.images) && meta.images.length > 0 ? meta.images : images;
      quantity = meta.quantity || 1;
      color = meta.color || '';
      size = meta.size || '';
      weight = meta.weight || '';
      condition = meta.condition || 'novo';
      brand = meta.brand || '';
      category = meta.category || 'Outros';
      subcategory = meta.subcategory || 'Diversos';
    }
  } catch (e) {
    // ignore parsing errors and proceed with defaults
  }

  return {
    description,
    images: images.filter(Boolean),
    quantity,
    color,
    size,
    weight,
    condition,
    brand,
    category,
    subcategory
  };
}

const categoriesMap: Record<string, string[]> = {
  'Mobiliário & Decoração': ['Sofás', 'Mesas & Cadeiras', 'Armários', 'Camas', 'Decoração/Tapetes', 'Outros'],
  'Eletrónicos & Tecnologia': ['Telemóveis', 'Computadores & Portáteis', 'Frigoríficos', 'Televisores & Som', 'Acessórios', 'Outros'],
  'Moda & Calçado': ['Roupa Masculina', 'Roupa Feminina', 'Calçado Desportivo', 'Calçado Casual', 'Acessórios & Malas', 'Outros'],
  'Beleza & Saúde': ['Perfumes', 'Maquilhagem', 'Cuidado da Pele', 'Suplementos', 'Outros'],
  'Automóvel & Ferramentas': ['Peças de Carro', 'Acessórios Auto', 'Ferramentas de Oficina', 'Outros'],
  'Outros': ['Brinquedos', 'Livraria', 'Artigos de Desporto', 'Alimentação', 'Diversos']
};

function ProductsTab({ products, isAdding, setIsAdding, refresh }: any) {
  const { profile } = useAuth();
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    affiliate_commission: '15',
    quantity: '10',
    color: '',
    size: '',
    weight: '',
    condition: 'novo' as 'novo' | 'usado',
    brand: '',
    category: 'Eletrónicos & Tecnologia',
    subcategory: 'Telemóveis',
    phone1: '',
    phone2: ''
  });

  const handleCategoryChange = (cat: string) => {
    const subcats = categoriesMap[cat] || [];
    setFormData({
      ...formData,
      category: cat,
      subcategory: subcats[0] || ''
    });
  };

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_DIM = 800;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        } else {
          resolve(event.target?.result as string || '');
        }
      };
      img.onerror = () => {
        reject(new Error('Imagem inválida.'));
      };
      img.src = event.target?.result as string || '';
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

  const addFiles = (files: File[]) => {
    if (imageFiles.length + files.length > 10) {
      toast.error('O limite máximo é de 10 imagens.');
      return;
    }

    files.forEach(async (file) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, carregue apenas imagens.');
        return;
      }

      try {
        const compressedBase64 = await compressImage(file);
        setImageFiles((prev) => {
          if (prev.length >= 10) return prev;
          return [...prev, compressedBase64];
        });
      } catch (err: any) {
        toast.error('Erro ao operar imagem: ' + err.message);
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Live commission calculations
  const priceNum = parseFloat(formData.price) || 0;
  const affiliateCommPercent = parseFloat(formData.affiliate_commission) || 0;
  const platformCommPercent = 10; // Fixed 10% platform fee
  
  const platformFee = priceNum * (platformCommPercent / 100);
  const affiliateReward = priceNum * (affiliateCommPercent / 100);
  const producerNetEarnings = Math.max(0, priceNum - platformFee - affiliateReward);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      toast.error('Por favor, faça upload de pelo menos uma imagem.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const meta = {
        realDescription: formData.description,
        images: imageFiles,
        quantity: parseInt(formData.quantity) || 1,
        color: formData.color || null,
        size: formData.size || null,
        weight: formData.weight || null,
        condition: formData.condition,
        brand: formData.brand || null,
        category: formData.category,
        subcategory: formData.subcategory,
        phone1: formData.phone1.trim(),
        phone2: formData.phone2.trim()
      };

      const payload = {
        name: formData.name,
        description: JSON.stringify(meta), // Serialize rich metadata into standard description
        price: parseFloat(formData.price),
        affiliate_commission: parseFloat(formData.affiliate_commission),
        producer_id: profile?.id,
        status: 'pending',
        image_url: imageFiles[0] // primary visual cover
      };

      const { error } = await supabase.from('products').insert([payload]);

      if (error) throw error;

      toast.success('Produto submetido para aprovação!');
      setImageFiles([]);
      setFormData({
        name: '',
        description: '',
        price: '',
        affiliate_commission: '15',
        quantity: '10',
        color: '',
        size: '',
        weight: '',
        condition: 'novo',
        brand: '',
        category: 'Eletrónicos & Tecnologia',
        subcategory: 'Telemóveis',
        phone1: '',
        phone2: ''
      });
      setIsAdding(false);
      refresh();
    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao adicionar produto: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja apagar este produto permanentemente?')) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        toast.success('Produto apagado com sucesso!');
        refresh();
      } catch (err: any) {
        console.error(err);
        toast.error('Erro ao apagar produto: ' + err.message);
      }
    }
  };

  const filteredProducts = products.filter((p: any) => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-display text-white">Meus Produtos</h2>
          <p className="text-sm text-gray-500 font-sans mt-1">Gerencie itens, configure comissões e acompanhe o estado de aprovação.</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            if (!isAdding) {
              setImageFiles([]); // Reset uploads
            }
          }}
          className="premium-button-primary flex items-center gap-2 cursor-pointer"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
          {isAdding ? 'Sair do Cadastro' : 'Novo Produto'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="premium-card p-8 border border-brand-blue/30 bg-brand-dark/40 rounded-2xl shadow-xl space-y-8">
              
              {/* Secção 1: Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-brand-blue uppercase tracking-wider border-b border-brand-border/40 pb-2">1. Detalhes Básicos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nome do Produto</label>
                    <input 
                      type="text"
                      className="premium-input w-full" 
                      placeholder="Ex: iPhone 14 Pro Max"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Marca</label>
                    <input 
                      type="text"
                      className="premium-input w-full" 
                      placeholder="Ex: Apple, Samsung, Zara"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Condição do Produto</label>
                    <div className="flex gap-4">
                      <label className="flex-1 flex items-center justify-center p-3 rounded-xl border border-brand-border bg-brand-black/40 cursor-pointer hover:border-brand-blue/50 transition-all">
                        <input 
                          type="radio" 
                          name="condition" 
                          value="novo"
                          checked={formData.condition === 'novo'}
                          onChange={() => setFormData({...formData, condition: 'novo'})}
                          className="mr-2 text-brand-blue"
                        />
                        <span className="text-sm text-gray-300 font-medium">Novo</span>
                      </label>
                      <label className="flex-1 flex items-center justify-center p-3 rounded-xl border border-brand-border bg-brand-black/40 cursor-pointer hover:border-brand-blue/50 transition-all">
                        <input 
                          type="radio" 
                          name="condition" 
                          value="usado"
                          checked={formData.condition === 'usado'}
                          onChange={() => setFormData({...formData, condition: 'usado'})}
                          className="mr-2 text-brand-blue"
                        />
                        <span className="text-sm text-gray-300 font-medium">Usado</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descrição Curta</label>
                    <textarea 
                      className="premium-input w-full h-12 min-h-[48px] py-3 text-sm" 
                      placeholder="Indique os benefícios chave do produto..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Secção 2: Categoria & Subcategoria Automáticas */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-brand-blue uppercase tracking-wider border-b border-brand-border/40 pb-2">2. Categorias Coordenadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categoria Principal</label>
                    <select
                      className="premium-input w-full bg-brand-black cursor-pointer"
                      value={formData.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                    >
                      {Object.keys(categoriesMap).map((cat) => (
                        <option key={cat} value={cat} className="text-gray-200">{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subcategoria (Automática)</label>
                    <select
                      className="premium-input w-full bg-brand-black cursor-pointer text-brand-blue font-semibold"
                      value={formData.subcategory}
                      onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                    >
                      {(categoriesMap[formData.category] || []).map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Secção 3: Especificações */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-brand-blue uppercase tracking-wider border-b border-brand-border/40 pb-2">3. Especificações & Inventário</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stock (Qtd)</label>
                    <input 
                      type="number" 
                      min="1"
                      className="premium-input w-full" 
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cor</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Preto, Azul"
                      className="premium-input w-full" 
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tamanho/Dimensão</label>
                    <input 
                      type="text" 
                      placeholder="Ex: M, XL, 6.7''"
                      className="premium-input w-full" 
                      value={formData.size}
                      onChange={(e) => setFormData({...formData, size: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Peso (Kg)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 0.2, 1.5"
                      className="premium-input w-full" 
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Secção: Contactos do Produtor */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-brand-blue uppercase tracking-wider border-b border-brand-border/40 pb-2">4. Contactos do Produtor (Obrigatório 2 Números)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contacto de Telefone 1</label>
                    <input 
                      type="tel" 
                      placeholder="Ex: 923 456 789"
                      className="premium-input w-full" 
                      value={formData.phone1}
                      onChange={(e) => setFormData({...formData, phone1: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contacto de Telefone 2</label>
                    <input 
                      type="tel" 
                      placeholder="Ex: 912 345 678"
                      className="premium-input w-full" 
                      value={formData.phone2}
                      onChange={(e) => setFormData({...formData, phone2: e.target.value})}
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Secção 5: Upload e remoção de até 10 imagens */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-brand-border/40 pb-2">
                  <h3 className="text-sm font-bold text-brand-blue uppercase tracking-wider">5. Fotos do Produto</h3>
                  <span className={`text-xs font-bold ${imageFiles.length === 10 ? 'text-yellow-500' : 'text-gray-400'}`}>
                    {imageFiles.length} / 10 carregadas
                  </span>
                </div>

                <div 
                  className="border-2 border-dashed border-brand-border/60 rounded-xl p-8 text-center bg-brand-black/20 hover:border-brand-blue/50 transition-all cursor-pointer relative"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('image-uploader-input')?.click()}
                >
                  <input 
                    id="image-uploader-input"
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-brand-blue/5 text-brand-blue rounded-full">
                      <Upload size={32} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-200 font-semibold font-sans">
                        Arraste as fotos para aqui ou <span className="text-brand-blue hover:underline">pesquise no dispositivo</span>
                      </p>
                      <p className="text-xs text-gray-500 font-sans mt-1">Carregue até 10 fotos no máximo. O primeiro upload será a capa do produto.</p>
                    </div>
                  </div>
                </div>

                {imageFiles.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-4">
                    {imageFiles.map((src, index) => (
                      <div key={index} className="aspect-square relative group rounded-xl overflow-hidden border border-brand-border/60 bg-brand-black/40 shadow-md">
                        <img src={src} alt="Upload preview" className="w-full h-full object-cover" />
                        
                        <div className="absolute top-2 left-2 bg-brand-black/70 px-1.5 py-0.5 rounded text-[9px] font-bold text-white font-mono uppercase">
                          {index === 0 ? 'Capa' : `#${index + 1}`}
                        </div>

                        {/* Botão de eliminar foto individual */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-lg cursor-pointer"
                          title="Eliminar Foto"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Secção 5: Preço e Calculadora Automática */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-brand-blue uppercase tracking-wider border-b border-brand-border/40 pb-2">5. Precificação & Calculadora de Ganhos</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  
                  {/* Inputs */}
                  <div className="space-y-4 md:col-span-1">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preço de Venda (Kz)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">Kz</span>
                        <input 
                          type="number" 
                          step="0.01"
                          placeholder="Ex: 15000"
                          className="premium-input w-full pl-11" 
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          required 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                        <span>Comissão do Afiliado (%)</span>
                        <span className="text-brand-blue font-bold font-mono">{affiliateCommPercent}%</span>
                      </label>
                      <input 
                        type="range" 
                        min="1" 
                        max="80"
                        step="1"
                        className="w-full accent-brand-blue bg-brand-black/40" 
                        value={formData.affiliate_commission}
                        onChange={(e) => setFormData({...formData, affiliate_commission: e.target.value})}
                      />
                      <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase">
                        <span>Min (1%)</span>
                        <span>Sugerido (15%)</span>
                        <span>Max (80%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Tela da calculadora */}
                  <div className="md:col-span-2 bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-brand-blue mb-1">
                      <Calculator size={18} />
                      <h4 className="text-sm font-bold uppercase tracking-wider">Simulador da Comissão (Real-Time)</h4>
                    </div>

                    <div className="divide-y divide-brand-blue/10 space-y-3 pt-1">
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Preço Escolhido</span>
                        <span className="font-mono text-white font-bold">Kz {priceNum.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-400 pt-3">
                        <span>(-) Comissão da Plataforma ({platformCommPercent}%)</span>
                        <span className="font-mono text-red-400 font-semibold">- Kz {platformFee.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>

                      <div className="flex justify-between text-sm text-gray-400 pt-3">
                        <span>(-) Comissão do Afiliado ({affiliateCommPercent}%)</span>
                        <span className="font-mono text-pink-400 font-semibold">- Kz {affiliateReward.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>

                      <div className="flex justify-between text-base text-gray-300 font-bold pt-4">
                        <span className="text-brand-blue font-display">(=) Margem Líquida do Produtor</span>
                        <span className="font-mono text-green-400 text-lg bg-green-500/10 px-3 py-1 rounded-lg">
                          Kz {producerNetEarnings.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-500 leading-relaxed font-sans mt-2">
                      Nota: O afiliado recebe a comissão ao promover e concluir a venda deste produto. A taxa da plataforma garante a infraestrutura e processamento dos pagamentos de forma segura.
                    </p>
                  </div>

                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4 pt-4 border-t border-brand-border/40">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="premium-button-primary flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    'Publicar Produto Para Aprovação'
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="premium-button-secondary px-8 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controles de Filtros e Pesquisa */}
      {!isAdding && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-surface/40 p-4 rounded-2xl border border-brand-border/40">
          <div className="flex flex-wrap gap-2">
            {([
              { id: 'all', label: 'Todos' },
              { id: 'approved', label: 'Aprovados' },
              { id: 'pending', label: 'Pendentes' },
              { id: 'rejected', label: 'Rejeitados' }
            ] as const).map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  setStatusFilter(btn.id);
                  setCurrentPage(1);
                }}
                className={`py-1.5 px-3.5 rounded-full text-xs font-bold transition-all uppercase tracking-wider cursor-pointer border ${
                  statusFilter === btn.id 
                    ? 'bg-brand-blue border-brand-blue text-white shadow-lg' 
                    : 'bg-brand-dark/50 border-brand-border/50 text-gray-400 hover:text-white'
                }`}
              >
                {btn.label} ({products.filter((p: any) => btn.id === 'all' ? true : p.status === btn.id).length})
              </button>
            ))}
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Pesquisar meus produtos..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-brand-dark border border-brand-border/60 rounded-xl text-xs focus:outline-none focus:border-brand-blue font-sans text-white placeholder-gray-500 transition-colors"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedProducts.map((p: Product) => (
          <ProductCardItem key={p.id} p={p} handleDeleteProduct={handleDeleteProduct} />
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 text-sm font-sans">
            Nenhum produto encontrado.
          </div>
        )}
      </div>

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

function ProductCardItem({ p, handleDeleteProduct }: { p: any, handleDeleteProduct: (id: string) => any, key?: string }) {
  const meta = parseProductMeta(p);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const images = meta.images.length > 0 ? meta.images : [p.image_url || ''];

  return (
    <div className="premium-card flex flex-col justify-between border border-brand-border/40 bg-brand-dark/20 rounded-2xl overflow-hidden shadow-lg hover:border-brand-blue/30 transition-all duration-300 group">
      
      {/* Imagem Cover e Badges */}
      <div className="aspect-video relative overflow-hidden bg-brand-black/60">
        <img 
          src={images[currentImgIndex] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'} 
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-102" 
        />
        
        {/* Carousel overlay controls */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
              }}
              className="p-1.5 rounded-full bg-brand-black/80 hover:bg-brand-blue border border-brand-border text-white transition-all pointer-events-auto cursor-pointer text-xs font-bold font-mono h-6 w-6 flex items-center justify-center"
            >
              &lsaquo;
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentImgIndex((prev) => (prev + 1) % images.length);
              }}
              className="p-1.5 rounded-full bg-brand-black/80 hover:bg-brand-blue border border-brand-border text-white transition-all pointer-events-auto cursor-pointer text-xs font-bold font-mono h-6 w-6 flex items-center justify-center"
            >
              &rsaquo;
            </button>
          </div>
        )}

        {/* Dots indicators inside image cover */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-brand-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs">
            {images.map((_: any, idx: number) => (
              <span 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImgIndex ? 'bg-brand-blue w-2.5' : 'bg-gray-500'}`} 
              />
            ))}
          </div>
        )}

        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-shadow-sm ${
          p.status === 'approved' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' :
          p.status === 'pending' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10 animate-pulse' :
          'bg-red-500 text-white shadow-lg shadow-red-500/20'
        }`}>
          {p.status === 'approved' ? 'Aprovado' :
           p.status === 'pending' ? 'Pendente' : 'Rejeitado'}
        </div>

        {meta.condition && (
          <div className="absolute top-4 left-4 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase bg-brand-black/80 border border-brand-border/60 text-gray-300 tracking-wider">
            {meta.condition}
          </div>
        )}

        {meta.brand && (
          <div className="absolute bottom-4 left-4 bg-brand-black/70 px-2 py-1 rounded text-xs text-brand-blue font-bold uppercase tracking-wider backdrop-blur-sm border border-brand-blue/20">
            {meta.brand}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 font-sans block mb-1">
            {meta.category} &rsaquo; {meta.subcategory}
          </span>
          <h3 className="text-xl font-bold font-display text-white tracking-tight group-hover:text-brand-blue transition-colors leading-snug line-clamp-1">{p.name}</h3>
          <p className="text-sm text-gray-400 font-sans line-clamp-2 mt-1.5 leading-relaxed">{meta.description}</p>
          
          {/* Meta de Especificações Extras */}
          <div className="grid grid-cols-2 gap-y-2 mt-4 pt-4 border-t border-brand-border/40 text-xs font-sans">
            <div className="flex items-center gap-1.5 text-gray-400">
              <span className="font-bold text-gray-500">Stock:</span>
              <span className="font-mono text-white font-medium">{meta.quantity || 1} unid</span>
            </div>
            {meta.color && (
              <div className="flex items-center gap-1.5 text-gray-400">
                <span className="font-bold text-gray-500">Cor:</span>
                <span className="font-mono text-white font-medium">{meta.color}</span>
              </div>
            )}
            {meta.size && (
              <div className="flex items-center gap-1.5 text-gray-400">
                <span className="font-bold text-gray-500">Tamanho:</span>
                <span className="font-mono text-white font-medium">{meta.size}</span>
              </div>
            )}
            {meta.weight && (
              <div className="flex items-center gap-1.5 text-gray-400">
                <span className="font-bold text-gray-500">Peso:</span>
                <span className="font-mono text-white font-medium">{meta.weight} kg</span>
              </div>
            )}
          </div>
        </div>

        {/* Detalhes Financeiros */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between border-t border-brand-border/40 pt-3">
            <span className="text-xs text-gray-500 font-medium">Preço de Venda</span>
            <span className="text-brand-blue font-display font-bold text-lg">Kz {Number(p.price).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Comissão Filiado</span>
            <span className="font-mono text-pink-400 font-bold">{p.affiliate_commission}%</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button className="premium-button-secondary py-2 flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer">
            <Edit size={14} /> Editar
          </button>
          <button 
            onClick={() => handleDeleteProduct(p.id)}
            className="premium-button-secondary py-2 flex items-center justify-center gap-2 text-xs font-semibold hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 size={13} /> Apagar
          </button>
        </div>
      </div>
    </div>
  );
}

function WalletTab({ wallet, refresh }: any) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('IBAN');

  const requestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    
    if (isNaN(val) || val <= 0) {
      toast.error('Por favor, insira um valor válido maior que zero.');
      return;
    }

    if (val > (wallet?.balance || 0)) {
      toast.error('Saldo insuficiente');
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

      // 2. Deduzir saldo da carteira física do produtor
      const newBalance = Number(wallet.balance) - val;
      const { error: walletErr } = await supabase
        .from('wallets')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', wallet.user_id);

      if (walletErr) throw walletErr;

      toast.success('Pedido de levantamento enviado com sucesso!');
      setIsRequesting(false);
      setAmount('');
      refresh();
    } catch (err: any) {
      console.error("Error submitting producer withdrawal:", err);
      toast.error('Erro ao processar levantamento: ' + err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-display">Minha Carteira</h2>
        <button 
          onClick={() => setIsRequesting(!isRequesting)}
          className="premium-button-primary"
        >
          Solicitar Levantamento
        </button>
      </div>

      <div className="premium-card p-12 bg-gradient-to-br from-brand-blue/10 to-transparent flex flex-col items-center">
        <WalletIcon size={48} className="text-brand-blue mb-4" />
        <p className="text-gray-500 mb-2">Saldo Total para Levantamento</p>
        <p className="text-6xl font-bold font-display tracking-tighter">
          Kz {Number(wallet?.balance || 0).toLocaleString()}
        </p>
      </div>

      <AnimatePresence>
        {isRequesting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="premium-card p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold mb-6">Solicitar Levantamento</h3>
              <form onSubmit={requestWithdrawal} className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Valor a levantar (Kz)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="premium-input w-full"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Método de Levantamento</label>
                  <select 
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="premium-input w-full"
                  >
                    <option value="IBAN">IBAN (Qualquer banco)</option>
                    <option value="Unitel Money">Unitel Money</option>
                    <option value="Afrimoney">Afrimoney</option>
                    <option value="PayPay">PayPay</option>
                    <option value="Multicaixa Express">Multicaixa Express</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="premium-button-primary flex-1">Solicitar</button>
                  <button 
                    type="button" 
                    onClick={() => setIsRequesting(false)}
                    className="premium-button-secondary px-6"
                  >
                    Fechar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
