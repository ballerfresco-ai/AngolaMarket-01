import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  BarChart3,
  ListOrdered,
  Settings as SettingsIcon,
  ChevronRight,
  TrendingDown,
  Trophy,
  Wallet as WalletIcon,
  Eye,
  X,
  Calendar,
  User,
  ShoppingCart,
  Menu
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Product, Withdrawal, Profile, DeliveryFee, Wallet } from '../../types/database';
import ProfileTab from '../../components/ProfileTab';
import { getAbandonedCarts, recoverAbandonedCart, AbandonedCart } from '../../lib/abandonedCarts';
import { ShoppingBag, RefreshCw, Star, Trash2, Mail, Check, CreditCard, ChevronDown, Ban, ShieldAlert } from 'lucide-react';
import { parseOrderDetails } from '../../lib/orderDetails';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'withdrawals' | 'users' | 'delivery' | 'rankings' | 'wallet' | 'orders' | 'profile'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsMobileMenuOpen(prev => !prev);
    window.addEventListener('toggle-dashboard-drawer', handleToggle);
    return () => window.removeEventListener('toggle-dashboard-drawer', handleToggle);
  }, []);

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: <BarChart3 size={20} /> },
    { id: 'products', label: 'Produtos', icon: <Package size={20} /> },
    { id: 'orders', label: 'Encomendas', icon: <ShoppingCart size={20} /> },
    { id: 'withdrawals', label: 'Levantamentos', icon: <DollarSign size={20} /> },
    { id: 'users', label: 'Utilizadores', icon: <Users size={20} /> },
    { id: 'delivery', label: 'Taxas de Entrega', icon: <MapPin size={20} /> },
    { id: 'rankings', label: 'Rankings', icon: <Trophy size={20} /> },
    { id: 'wallet', label: 'Minha Carteira', icon: <WalletIcon size={20} /> },
    { id: 'profile', label: 'O Meu Perfil', icon: <User size={20} /> },
  ];

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
                    A
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white font-display">Navegação</h2>
                    <p className="text-[10px] text-gray-400 font-mono">Admin Control</p>
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
                {menuItems.map((item) => (
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
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Admin Control</h2>
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => (
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
              {activeTab === item.id && <ChevronRight className="ml-auto" size={16} />}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-4 md:p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'products' && <ProductsTab />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'withdrawals' && <WithdrawalsTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'delivery' && <DeliveryTab />}
            {activeTab === 'rankings' && <RankingsTab />}
            {activeTab === 'wallet' && <AdminWalletTab />}
            {activeTab === 'profile' && <ProfileTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function UsersTab() {
  const { profile: currentAdmin } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(false);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
  };

  const toggleBlockStatus = async (userToModify: Profile) => {
    if (userToModify.id === currentAdmin?.id) {
      toast.error('Você não pode bloquear a sua própria conta!');
      return;
    }

    const newBlockedState = !userToModify.is_blocked;
    const { error } = await supabase
      .from('profiles')
      .update({ is_blocked: newBlockedState })
      .eq('id', userToModify.id);

    if (error) {
      toast.error(`Erro ao atualizar utilizador: ${error.message}`);
    } else {
      toast.success(newBlockedState ? 'Utilizador bloqueado com sucesso' : 'Utilizador desbloqueado com sucesso');
      setUsers(prev => prev.map(u => u.id === userToModify.id ? { ...u, is_blocked: newBlockedState } : u));
    }
  };

  // Filter based on search query
  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginated users
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display">Utilizadores Registados</h2>
          <p className="text-sm text-gray-400 font-sans mt-1">Gerencie as permissões e estado de bloqueio de contas.</p>
        </div>
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Pesquisar por nome, email ou papel..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2.5 bg-brand-surface border border-brand-border/60 rounded-xl text-sm focus:outline-none focus:border-brand-blue font-sans text-white placeholder-gray-500 transition-colors"
          />
        </div>
      </div>

      <div className="premium-card overflow-x-auto">
        <table className="w-full text-left col-span-1 border-collapse">
          <thead className="bg-brand-dark border-b border-brand-border">
            <tr>
              <th className="p-6 text-sm font-bold text-gray-400">Nome</th>
              <th className="p-6 text-sm font-bold text-gray-400">Email</th>
              <th className="p-6 text-sm font-bold text-gray-400">Papel</th>
              <th className="p-6 text-sm font-bold text-gray-400">Estado</th>
              <th className="p-6 text-sm font-bold text-gray-400">Data de Registo</th>
              <th className="p-6 text-sm font-bold text-gray-400 text-right font-display">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {paginatedUsers.map((u) => {
              const belongsToSelf = u.id === currentAdmin?.id;
              
              return (
                <tr key={u.id} className={u.is_blocked ? 'bg-red-500/5' : ''}>
                  <td className="p-6 font-medium">
                    <div className="flex items-center gap-2">
                      {u.name}
                      {belongsToSelf && (
                        <span className="text-[10px] bg-brand-blue/20 text-brand-blue px-2 py-0.5 rounded-full font-mono">Eu</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-gray-400">{u.email}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      u.role === 'admin' ? 'bg-red-500/10 text-red-500' :
                      u.role === 'producer' ? 'bg-blue-500/10 text-blue-500' :
                      u.role === 'affiliate' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-gray-500/10 text-gray-500'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-6">
                    {u.is_blocked ? (
                      <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium bg-red-500/10 px-2 py-1 rounded-lg w-fit">
                        <Ban size={14} /> Bloqueado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium bg-green-500/10 px-2 py-1 rounded-lg w-fit">
                        <Check size={14} /> Ativo
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-6 text-right">
                    {belongsToSelf ? (
                      <span className="text-xs text-gray-500 italic">N/A</span>
                    ) : (
                      <button
                        onClick={() => toggleBlockStatus(u)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                          u.is_blocked
                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                            : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        }`}
                      >
                        {u.is_blocked ? (
                          <>
                            <Check size={12} /> Desbloquear
                          </>
                        ) : (
                          <>
                            <Ban size={12} /> Bloquear
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-500 font-sans">
                  Nenhum utilizador encontrado com esta pesquisa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginação */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-gray-400 font-sans">
            A mostrar <span className="font-semibold text-white">{startIndex + 1}</span> a <span className="font-semibold text-white">{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</span> de <span className="font-semibold text-white">{filteredUsers.length}</span> utilizadores
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

function OverviewTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.from('orders').select('*, products(*)');

      if (error) throw error;

      setOrders(data || []);

      const carts = getAbandonedCarts();
      setAbandonedCarts(carts);
    } catch (e: any) {
      console.error('Error fetching admin statistics:', e);
      toast.error('Erro ao recolher dados estatísticos.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverCart = (cartId: string, email: string) => {
    recoverAbandonedCart(cartId);
    toast.success(`E-mail de recuperação enviado para: ${email}`);
    // Refresh local lists
    setAbandonedCarts(getAbandonedCarts());
  };

  // Calculations
  const totalSalesCount = orders.length;
  
  // Completed, Pending, Cancelled Count
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing' || o.status === 'out_for_delivery');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  // Revenue (Faturamento do mercado)
  const totalFaturamento = completedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  // Split calculation
  let sellerNetTotal = 0;
  let affiliateNetTotal = 0;
  let adminNetTotal = 0;

  completedOrders.forEach(o => {
    const priceNum = Number(o.products?.price) || 0;
    const affiliateCommPercent = Number(o.products?.affiliate_commission) || 0;
    const platformFee = priceNum * 0.10; // 10%
    const affiliateReward = affiliateCommPercent > 0 && o.affiliate_id ? priceNum * (affiliateCommPercent / 100) : 0;
    const sellerNet = Math.max(0, priceNum - platformFee - affiliateReward);

    sellerNetTotal += sellerNet;
    affiliateNetTotal += affiliateReward;
    adminNetTotal += platformFee;
  });

  // Abandoned carts sum
  const abandonedCartsCount = abandonedCarts.length;
  const abandonedCartsTotalValue = abandonedCarts.reduce((sum, c) => sum + (c.status === 'pending' ? Number(c.product_price) : 0), 0);

  // Payment methods distribution
  const paymentDistribution: { [key: string]: { count: number; value: number } } = {
    'Pagamento no Ato de Entrega': { count: 0, value: 0 },
    'Multicaixa Express': { count: 0, value: 0 },
    'Transferência Bancária': { count: 0, value: 0 }
  };

  orders.forEach(o => {
    const details = parseOrderDetails(o.neighborhood);
    const method = details.paymentMethod || 'Pagamento no Ato de Entrega';
    if (paymentDistribution[method]) {
      paymentDistribution[method].count += 1;
      paymentDistribution[method].value += Number(o.total || 0);
    } else {
      // Create dynamically if a new method appears
      paymentDistribution[method] = { count: 1, value: Number(o.total || 0) };
    }
  });

  // Calculate stats for graphs
  // Group by day of week
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dailyGraphData = daysOfWeek.map((day, idx) => {
    // Filter orders matching day
    const matching = completedOrders.filter(o => {
      const orderDate = new Date(o.created_at);
      return orderDate.getDay() === idx;
    });
    const salesAmount = matching.reduce((sum, o) => sum + Number(o.total || 0), 0);
    
    // Filter abandoned matching day
    const matchAbandoned = abandonedCarts.filter(c => {
      const cartDate = new Date(c.created_at);
      return cartDate.getDay() === idx;
    });

    return {
      name: day,
      'Faturamento (Kz)': salesAmount,
      'Carts Abandonados': matchAbandoned.length
    };
  });

  // Re-order starting from Monday to Sunday
  const graphData = [
    dailyGraphData[1], // Seg
    dailyGraphData[2], // Ter
    dailyGraphData[3], // Qua
    dailyGraphData[4], // Qui
    dailyGraphData[5], // Sex
    dailyGraphData[6], // Sáb
    dailyGraphData[0], // Dom
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-4">
        <RefreshCw size={40} className="text-brand-blue animate-spin" />
        <p className="text-gray-400 font-sans text-sm animate-pulse">A calcular estatísticas do mercado angolano...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display text-white tracking-tight">Estatísticas Gerais (ADM)</h1>
          <p className="text-sm text-gray-400 font-sans mt-1">Status completo de vendas, faturamento, divisões líquidas e carrinhos abandonados.</p>
        </div>
        <button 
          onClick={fetchStats}
          className="premium-button flex items-center justify-center gap-2 border-brand-border/60 hover:bg-brand-surface py-2.5 px-4 text-xs font-mono text-gray-300 font-semibold uppercase tracking-wider"
        >
          <RefreshCw size={14} /> Atualizar Painel
        </button>
      </div>

      {/* Main Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Faturamento */}
        <div className="premium-card p-6 bg-gradient-to-br from-brand-surface/80 to-brand-blue/5 border-brand-blue/20">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-xl">
              <DollarSign size={20} />
            </span>
            <span className="text-[10px] font-mono py-0.5 px-2 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full font-bold uppercase tracking-wider">
              Concluídas
            </span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 font-sans">Faturamento Total</p>
          <p className="text-2xl font-bold text-white font-display">Kz {totalFaturamento.toLocaleString()}</p>
          <span className="text-[10px] text-gray-500 block mt-1 font-mono">10% comissão admin inserida</span>
        </div>

        {/* Líquidos splits (Sellers, Affiliates, Admin) */}
        <div className="premium-card p-6 border-brand-border/40">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Users size={20} />
            </span>
            <span className="text-[10px] font-mono py-0.5 px-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full font-bold uppercase tracking-wider">
              Divisão de Ganhos
            </span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-sans">Liquido dos Participantes</p>
          <div className="space-y-1.5 text-xs text-gray-300 font-mono">
            <div className="flex justify-between">
              <span className="text-gray-500">Vendedores:</span>
              <span className="text-white font-semibold">Kz {sellerNetTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Afiliados:</span>
              <span className="text-brand-blue font-semibold">Kz {affiliateNetTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-brand-border/50 pt-1.5 text-xs">
              <span className="text-gray-400 font-bold">Admin (10%):</span>
              <span className="text-pink-400 font-bold">Kz {adminNetTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Encomendas Status */}
        <div className="premium-card p-6 border-brand-border/40">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl">
              <ListOrdered size={20} />
            </span>
            <span className="text-[10px] font-mono py-0.5 px-2 bg-brand-surface border border-brand-border text-gray-400 rounded-full font-bold uppercase tracking-wider">
              Vendas: {totalSalesCount}
            </span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-sans">Status de Pedidos</p>
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

        {/* Carrinhos Abandonados */}
        <div className="premium-card p-6 bg-gradient-to-br from-brand-surface/80 to-pink-500/[0.03] border-pink-500/15">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-xl">
              <ShoppingCart size={20} />
            </span>
            <span className={`text-[10px] font-mono py-0.5 px-2 rounded-full font-bold uppercase tracking-wider ${
              abandonedCartsCount > 0 ? 'bg-red-500/10 border border-red-500/20 text-red-500 animate-pulse' : 'bg-gray-500/10 border border-gray-500/20 text-gray-500'
            }`}>
              Alerta de Perda
            </span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 font-sans">Carrinhos Abandonados</p>
          <p className="text-2xl font-bold text-white font-display">{abandonedCartsCount} perdidos</p>
          <span className="text-[10px] text-pink-400/90 block mt-1 font-mono">Volume retido: Kz {abandonedCartsTotalValue.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts: Trend Analysis */}
        <div className="premium-card p-6 lg:col-span-2 border-brand-border/40">
          <h3 className="text-lg font-bold text-white font-display mb-6">Faturamento vs. Carrinhos Abandonados</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphData}>
                <defs>
                  <linearGradient id="colorSalesAd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066FF" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="name" stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#121212', border: '1px solid #2A2A2A', borderRadius: '12px' }}
                  labelStyle={{ color: '#aaa', fontFamily: 'monospace' }}
                  itemStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Area type="monotone" name="Faturamento (Kz)" dataKey="Faturamento (Kz)" stroke="#0066FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSalesAd)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods and count */}
        <div className="premium-card p-6 border-brand-border/40 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2 mb-1">
              <CreditCard size={18} className="text-brand-blue" /> Métodos de Pagamento
            </h3>
            <p className="text-xs text-gray-500 font-sans mb-6">Canal de fecho com número de vendas em cada método.</p>
            
            <div className="space-y-4">
              {Object.entries(paymentDistribution).map(([method, data]) => {
                const percentage = totalFaturamento > 0 ? Math.round((data.value / totalFaturamento) * 100) : 0;
                
                return (
                  <div key={method} className="space-y-1.5 p-3 rounded-xl bg-brand-dark/40 border border-brand-border/30">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-white font-semibold truncate max-w-[200px]">{method}</span>
                      <span className="text-brand-blue font-bold">{data.count} vendas</span>
                    </div>
                    
                    <div className="w-full bg-brand-dark h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-brand-blue h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(4, percentage)}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                      <span>Volume: Kz {data.value.toLocaleString()}</span>
                      <span>{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="pt-4 border-t border-brand-border/40 mt-4 text-[10px] text-gray-500 font-sans text-center">
            Informação sincronizada com as faturas dos clientes Angolanos.
          </div>
        </div>
      </div>

      {/* Recover Abandoned Carts Table Block */}
      <div className="premium-card p-6 border-brand-border/40">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold font-display text-white">Visualizador de Carrinhos Abandonados</h2>
            <p className="text-xs text-gray-400 font-sans mt-0.5">Contactos capturados na abertura do checkout. Prossiga para recuperar a venda.</p>
          </div>
          <span className="font-mono text-xs font-bold text-pink-400 py-1 px-3 rounded-full bg-pink-500/10 border border-pink-500/20">
            {abandonedCarts.filter(c => c.status === 'pending').length} Carrinhos Pendentes
          </span>
        </div>

        {abandonedCarts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-brand-border/40 rounded-2xl bg-brand-dark/20">
            <ShoppingBag className="mx-auto text-gray-600 mb-3" size={32} />
            <p className="text-sm font-sans text-gray-400">Nenhum carrinho abandonado registado até ao momento.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-brand-border/60 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <th className="pb-3 text-left">Utilizador / Contacto</th>
                  <th className="pb-3 text-left">Produto Tentado</th>
                  <th className="pb-3 text-left">Valor do Item</th>
                  <th className="pb-3 text-left">Abandono em</th>
                  <th className="pb-3 text-center">Estado</th>
                  <th className="pb-3 text-right">Ação de Recuperação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {abandonedCarts.map((cart) => (
                  <tr key={cart.id} className="hover:bg-brand-surface/30 transition-colors">
                    <td className="py-4 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold font-mono">
                          {cart.customer_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{cart.customer_name}</span>
                          <span className="text-xs font-mono text-gray-500 block">{cart.customer_email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-3">
                      <div className="flex items-center gap-2">
                        {cart.product_image && (
                          <img src={cart.product_image} alt="" className="w-8 h-8 rounded object-cover bg-brand-dark" />
                        )}
                        <span className="font-medium text-gray-200 block truncate max-w-[180px]">{cart.product_name}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-3 font-mono font-semibold text-white">
                      Kz {Number(cart.product_price).toLocaleString()}
                    </td>
                    <td className="py-4 pr-1 text-xs text-gray-400 font-mono">
                      {new Date(cart.created_at).toLocaleString('pt-AO')}
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
                        <div className="inline-flex items-center gap-1.5 text-xs text-green-500 font-bold font-mono bg-green-500/5 px-3 py-1.5 rounded-full border border-green-500/10">
                          <Check size={12} /> Email Enviado
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRecoverCart(cart.id, cart.customer_email)}
                          className="premium-button p-2 text-xs font-bold text-brand-blue bg-brand-blue/10 border border-brand-blue/20 hover:bg-brand-blue hover:text-white cursor-pointer px-4.5 rounded-xl font-mono flex items-center gap-1.5 ml-auto uppercase tracking-wide"
                        >
                          <Mail size={12} /> Recuperar
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
  let phone1 = '';
  let phone2 = '';

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
      phone1 = meta.phone1 || '';
      phone2 = meta.phone2 || '';
    }
  } catch (e) {
    // Treat as default plain description
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
    subcategory,
    phone1: phone1 || 'N/D',
    phone2: phone2 || 'N/D'
  };
}

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase.from('products').update({ status }).eq('id', id);
    if (!error) {
      toast.success(`Produto ${status === 'approved' ? 'aprovado' : 'rejeitado'}`);
      if (selectedProduct && selectedProduct.id === id) {
        setSelectedProduct({ ...selectedProduct, status });
      }
      fetchProducts();
    } else {
      toast.error('Erro ao atualizar produto.');
    }
  };

  const handleOpenInspect = (p: Product) => {
    setSelectedProduct(p);
    setCurrentImgIndex(0);
  };

  const selectedMeta = selectedProduct ? parseProductMeta(selectedProduct) : null;
  const selectedImages = selectedMeta ? (selectedMeta.images.length > 0 ? selectedMeta.images : [selectedProduct?.image_url || '']) : [];

  const priceNum = selectedProduct ? Number(selectedProduct.price) || 0 : 0;
  const affiliateCommPercent = selectedProduct ? Number(selectedProduct.affiliate_commission) || 0 : 0;
  const platformFee = priceNum * 0.10;
  const affiliateReward = priceNum * (affiliateCommPercent / 100);
  const netProducer = Math.max(0, priceNum - platformFee - affiliateReward);

  // Apply search query and status filter
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Paginated products
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterClick = (status: 'all' | 'pending' | 'approved' | 'rejected') => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display text-white">Gestão de Produtos</h2>
          <p className="text-sm text-gray-400 font-sans mt-1">Aprove ou rejeite novos produtos e visualize as especificações e fotos enviadas de Angola.</p>
        </div>
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Pesquisar por nome do produto..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2.5 bg-brand-surface border border-brand-border/60 rounded-xl text-sm focus:outline-none focus:border-brand-blue font-sans text-white placeholder-gray-500 transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          { id: 'all', label: 'Todos' },
          { id: 'pending', label: 'Pendentes' },
          { id: 'approved', label: 'Aprovados' },
          { id: 'rejected', label: 'Rejeitados' }
        ] as const).map((btn) => (
          <button
            key={btn.id}
            onClick={() => handleFilterClick(btn.id)}
            className={`py-1.5 px-4 rounded-full text-xs font-bold transition-all uppercase tracking-wider cursor-pointer border ${
              statusFilter === btn.id 
                ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                : 'bg-brand-surface border-brand-border/40 text-gray-400 hover:text-white'
            }`}
          >
            {btn.label} ({products.filter(p => btn.id === 'all' ? true : p.status === btn.id).length})
          </button>
        ))}
      </div>

      <div className="premium-card overflow-x-auto border border-brand-border/40 bg-brand-dark/20 rounded-2xl shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-brand-dark border-b border-brand-border">
              <th className="p-6 text-sm font-bold text-gray-400">Produto</th>
              <th className="p-6 text-sm font-bold text-gray-400">Categoria & Marca</th>
              <th className="p-6 text-sm font-bold text-gray-400">Preço</th>
              <th className="p-6 text-sm font-bold text-gray-400">Comissão Afiliado</th>
              <th className="p-6 text-sm font-bold text-gray-400">Status</th>
              <th className="p-6 text-sm font-bold text-gray-400 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {paginatedProducts.map((p) => {
              const meta = parseProductMeta(p);
              return (
                <tr key={p.id} className="hover:bg-brand-surface/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <img src={p.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'} className="w-12 h-12 rounded-lg bg-brand-dark object-cover border border-brand-border/50" />
                      <div>
                        <span className="font-bold text-white block truncate max-w-xs">{p.name}</span>
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{p.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-sm">
                    <span className="text-brand-blue font-semibold block">{meta.category}</span>
                    <span className="text-xs text-gray-400">{meta.brand || 'Sem marca'} &rsaquo; {meta.subcategory}</span>
                  </td>
                  <td className="p-6 font-display font-bold text-white">Kz {Number(p.price).toLocaleString()}</td>
                  <td className="p-6 font-mono text-pink-400 font-bold">{p.affiliate_commission}%</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none ${
                      p.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                      p.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 font-semibold animate-pulse' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {p.status === 'approved' ? 'Aprovado' :
                       p.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => handleOpenInspect(p)} 
                        title="Inspecionar"
                        className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg hover:bg-brand-blue transition-colors hover:text-white cursor-pointer"
                      >
                        <Eye size={18} />
                      </button>
                      {p.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateStatus(p.id, 'approved')} 
                            title="Aprovar"
                            className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 transition-colors hover:text-white cursor-pointer"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => updateStatus(p.id, 'rejected')} 
                            title="Rejeitar"
                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 transition-colors hover:text-white cursor-pointer"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredProducts.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-500 font-sans">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginação */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
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

      {/* Modal de Detalhes e Inspeção Multi-foto */}
      <AnimatePresence>
        {selectedProduct && selectedMeta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="premium-card p-6 w-full max-w-4xl bg-brand-black border border-brand-border/60 rounded-3xl relative shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row gap-8"
            >
              {/* Botão de Fechar */}
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 bg-brand-dark/80 hover:bg-brand-blue border border-brand-border/60 rounded-full text-gray-400 hover:text-white transition-colors cursor-pointer z-10 shadow-md"
              >
                <X size={20} />
              </button>

              {/* Lado Esquerdo: Imagem Cover e Lista Completa de Uploads */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="aspect-square relative rounded-2xl overflow-hidden bg-brand-dark/40 border border-brand-border/40">
                  <img 
                    src={selectedImages[currentImgIndex] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'} 
                    alt="Inspeção" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-4 left-4 bg-brand-black/70 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest text-shadow-sm border border-brand-border/60">
                    Foto {currentImgIndex + 1} de {selectedImages.length}
                  </div>
                </div>

                {/* Thumbnails */}
                {selectedImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedImages.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImgIndex(idx)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border cursor-pointer select-none shrink-0 transition-all ${
                          idx === currentImgIndex ? 'border-brand-blue ring-2 ring-brand-blue/30 scale-102 shadow-md' : 'border-brand-border/50 hover:border-brand-blue/50'
                        }`}
                      >
                        <img src={img} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Lado Direito: Especificações e Controles */}
              <div className="flex-1 flex flex-col justify-between space-y-6 overflow-y-auto">
                <div>
                  <div className="flex flex-wrap gap-2 items-center mb-2">
                    <span className="text-[10px] uppercase font-bold text-gray-500">{selectedMeta.category} &rsaquo; {selectedMeta.subcategory}</span>
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-brand-blue/10 text-brand-blue tracking-wider border border-brand-blue/20">
                      {selectedMeta.condition}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold font-display text-white tracking-tight leading-snug">{selectedProduct.name}</h3>
                  
                  {selectedMeta.brand && (
                    <p className="text-xs text-brand-blue font-bold uppercase tracking-wider mt-1">{selectedMeta.brand}</p>
                  )}

                  {/* Informações detalhadas do stock, cor, tamanho e peso */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-brand-black/60 p-3.5 rounded-xl border border-brand-border/40 my-4 text-xs">
                    <div>
                      <span className="text-gray-500 font-bold block mb-0.5">Estoque</span>
                      <span className="text-white font-mono font-medium">{selectedMeta.quantity} unid</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold block mb-0.5">Cor</span>
                      <span className="text-white font-mono font-medium">{selectedMeta.color || 'N/D'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold block mb-0.5">Tamanho</span>
                      <span className="text-white font-mono font-medium">{selectedMeta.size || 'N/D'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold block mb-0.5">Peso</span>
                      <span className="text-white font-mono font-medium">{selectedMeta.weight ? `${selectedMeta.weight} kg` : 'N/D'}</span>
                    </div>
                  </div>

                  {/* Contactos do Produtor para recolha se agendado */}
                  <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-3.5 space-y-2 my-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-blue">Contactos do Produtor (Para Recolha)</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400 block font-sans">Telefone Principal</span>
                        <span className="text-white font-mono font-semibold">{selectedMeta.phone1}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-sans">Telefone Secundário</span>
                        <span className="text-white font-mono font-semibold">{selectedMeta.phone2}</span>
                      </div>
                    </div>
                  </div>

                  {/* Descrição curta */}
                  <div className="space-y-1.5 my-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Descrição do Produto</h4>
                    <p className="text-sm text-gray-300 font-sans leading-relaxed whitespace-pre-wrap">{selectedMeta.description}</p>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-4.5 space-y-3.5 my-4 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Preço de Venda</span>
                      <span className="font-mono text-white font-bold">Kz {priceNum.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-400 pt-1 border-t border-brand-blue/10">
                      <span>Comissão Plataforma (10%)</span>
                      <span className="font-mono text-red-400 font-semibold">- Kz {platformFee.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between text-gray-400 pt-1">
                      <span>Comissão do Afiliado ({affiliateCommPercent}%)</span>
                      <span className="font-mono text-pink-400 font-semibold">- Kz {affiliateReward.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-300 font-bold pt-3.5 border-t border-brand-blue/20">
                      <span className="text-brand-blue uppercase tracking-wider">Margem Líquida do Produtor</span>
                      <span className="font-mono text-green-400 text-sm bg-green-500/10 px-2 py-0.5 rounded">
                        Kz {netProducer.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status e Ações Finais */}
                <div className="pt-4 border-t border-brand-border/60 flex gap-4">
                  {selectedProduct.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => updateStatus(selectedProduct.id, 'approved')} 
                        className="premium-button-primary flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer bg-green-600 hover:bg-green-700 hover:scale-101 transition-all"
                      >
                        <CheckCircle size={16} /> Aprovar Produto
                      </button>
                      <button 
                        onClick={() => updateStatus(selectedProduct.id, 'rejected')} 
                        className="premium-button-secondary flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:border-red-500 hover:text-red-500 hover:scale-101 transition-all"
                      >
                        <XCircle size={16} /> Rejeitar Produto
                      </button>
                    </>
                  ) : (
                    <div className="w-full text-center py-2.5 rounded-xl border border-brand-border/40 bg-brand-dark/40">
                      <span className="text-xs text-gray-400 font-medium">Estado do Produto: </span>
                      <span className={`text-xs font-bold uppercase tracking-widest ${
                        selectedProduct.status === 'approved' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {selectedProduct.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WithdrawalsTab() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  useEffect(() => { fetchWithdrawals(); }, []);

  const fetchWithdrawals = async () => {
    const { data } = await supabase.from('withdrawals').select('*').order('created_at', { ascending: false });
    setWithdrawals(data || []);
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase.from('withdrawals').update({ status }).eq('id', id);
    if (!error) {
       toast.success(`Levantamento ${status === 'approved' ? 'aprovado' : 'rejeitado'}`);
       fetchWithdrawals();
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold font-display">Pedidos de Levantamento</h2>
      <div className="premium-card overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-brand-dark border-b border-brand-border">
            <tr>
              <th className="p-6 text-sm font-bold text-gray-400">Valor</th>
              <th className="p-6 text-sm font-bold text-gray-400">Método</th>
              <th className="p-6 text-sm font-bold text-gray-400">Status</th>
              <th className="p-6 text-sm font-bold text-gray-400">Data</th>
              <th className="p-6 text-sm font-bold text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {withdrawals.map((w) => (
              <tr key={w.id}>
                <td className="p-6 font-bold">Kz {Number(w.amount).toLocaleString()}</td>
                <td className="p-6">{w.method}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    w.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                    w.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {w.status}
                  </span>
                </td>
                <td className="p-6 text-sm text-gray-500">{new Date(w.created_at).toLocaleDateString()}</td>
                <td className="p-6">
                   {w.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(w.id, 'approved')} className="text-green-500 hover:bg-green-500/10 p-2 rounded">Aprovar</button>
                        <button onClick={() => updateStatus(w.id, 'rejected')} className="text-red-500 hover:bg-red-500/10 p-2 rounded">Rejeitar</button>
                      </div>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeliveryTab() {
  const [fees, setFees] = useState<DeliveryFee[]>([]);
  const [neighborhood, setNeighborhood] = useState('');
  const [amount, setAmount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNeighborhood, setEditNeighborhood] = useState('');
  const [editAmount, setEditAmount] = useState('');

  useEffect(() => { fetchFees(); }, []);

  const fetchFees = async () => {
    const { data } = await supabase.from('delivery_fees').select('*');
    setFees(data || []);
  };

  const addFee = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('delivery_fees').insert([{ neighborhood, amount }]);
    if (error) toast.error('Erro ao adicionar taxa');
    else {
      toast.success('Taxa adicionada');
      setNeighborhood('');
      setAmount('');
      fetchFees();
    }
  };

  const deleteFee = async (id: string) => {
    const { error } = await supabase.from('delivery_fees').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao excluir taxa: ' + error.message);
    } else {
      toast.success('Taxa excluída com sucesso');
      fetchFees();
    }
  };

  const startEdit = (fee: DeliveryFee) => {
    setEditingId(fee.id);
    setEditNeighborhood(fee.neighborhood);
    setEditAmount(String(fee.amount));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNeighborhood('');
    setEditAmount('');
  };

  const saveEdit = async (id: string) => {
    if (!editNeighborhood.trim() || !editAmount) {
      toast.error('Preencha todos os campos corretamente');
      return;
    }
    const { error } = await supabase.from('delivery_fees').update({
      neighborhood: editNeighborhood,
      amount: Number(editAmount)
    }).eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar taxa: ' + error.message);
    } else {
      toast.success('Taxa atualizada com sucesso');
      setEditingId(null);
      fetchFees();
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold font-display">Taxas de Entrega por Bairro</h2>
      
      <form onSubmit={addFee} className="premium-card p-6 flex flex-col md:flex-row gap-4">
        <input 
          placeholder="Nome do Bairro" 
          value={neighborhood} 
          onChange={(e) => setNeighborhood(e.target.value)} 
          className="premium-input flex-1" 
          required 
        />
        <input 
          type="number" 
          placeholder="Valor (Kz)" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          className="premium-input w-full md:w-48" 
          required 
        />
        <button type="submit" className="premium-button-primary">Adicionar</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {fees.map((fee) => {
          const isEditing = editingId === fee.id;
          return (
            <div key={fee.id} className="premium-card p-5 flex flex-col justify-between gap-4">
              {isEditing ? (
                <div className="flex flex-col gap-2 w-full">
                  <input
                    value={editNeighborhood}
                    onChange={(e) => setEditNeighborhood(e.target.value)}
                    className="premium-input text-sm py-1.5 px-3"
                    placeholder="Bairro"
                    required
                  />
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="premium-input text-sm py-1.5 px-3"
                    placeholder="Valor (Kz)"
                    required
                  />
                  <div className="flex gap-2 mt-1 justify-end">
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1.5 text-xs text-gray-400 hover:text-white border border-brand-border rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => saveEdit(fee.id)}
                      className="px-3 py-1.5 text-xs bg-brand-blue text-white rounded-lg hover:bg-brand-blue/80"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="font-bold text-gray-100">{fee.neighborhood}</p>
                    <p className="text-brand-blue font-display text-sm font-semibold mt-1">Kz {Number(fee.amount).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => startEdit(fee)}
                      className="text-gray-400 p-2 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                      title="Editar"
                    >
                      <SettingsIcon size={18} />
                    </button>
                    <button 
                      onClick={() => deleteFee(fee.id)}
                      className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Apagar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RankingsTab() {
  return (
    <div className="space-y-12 text-center py-20">
      <Trophy size={64} className="mx-auto text-brand-blue mb-6" />
      <h2 className="text-4xl font-bold font-display">Ranking de Afiliados</h2>
      <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
    </div>
  );
}

function AdminWalletTab() {
  const { profile } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('IBAN');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWalletAndWithdrawals();
  }, [profile]);

  const fetchWalletAndWithdrawals = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      
      // Calcular comissão de administração dinâmica e buscar levantamentos concorrentemente
      const [ordersRes, withdrawalsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*, products!inner(*)')
          .eq('status', 'delivered'),
        supabase
          .from('withdrawals')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (withdrawalsRes.error) throw withdrawalsRes.error;

      const completedOrders = ordersRes.data;
      const wdData = withdrawalsRes.data;

      let totalComm = 0;
      if (completedOrders) {
        completedOrders.forEach((o: any) => {
          const price = Number(o.products?.price) || 0;
          const comm = price * 0.10; // 10% comissão plataforma
          totalComm += comm;
        });
      }

      setWithdrawals(wdData || []);

      let totalWithdrawn = 0;
      if (wdData) {
        wdData.forEach((wd: any) => {
          if (wd.status !== 'rejected') {
            totalWithdrawn += Number(wd.amount);
          }
        });
      }

      const balance = Math.max(0, totalComm - totalWithdrawn);
      setWallet({
        id: profile.id,
        user_id: profile.id,
        balance,
        updated_at: new Date().toISOString()
      } as any);

    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao carregar dados da carteira: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !wallet) return;

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error('Por favor, insira um valor válido maior que zero.');
      return;
    }

    if (val > Number(wallet.balance)) {
      toast.error('Saldo de comissões insuficiente para concluir o pedido.');
      return;
    }

    try {
      setSubmitting(true);

      // 1. Insert withdrawal request
      const { error: wdError } = await supabase
        .from('withdrawals')
        .insert([{
          user_id: profile.id,
          amount: val,
          method: `${method} (${details || 'Sem detalhes'})`,
          status: 'pending'
        }]);

      if (wdError) throw wdError;

      // 2. Subtract balance from wallet
      const newBalance = Number(wallet.balance) - val;
      const { error: walletUpdateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', profile.id);

      if (walletUpdateError) throw walletUpdateError;

      toast.success('Pedido de levantamento efetuado com sucesso!');
      setAmount('');
      setDetails('');
      fetchWalletAndWithdrawals();
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao processar levantamento: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold font-display tracking-tight text-white mb-2">Minha Carteira (ADM)</h2>
        <p className="text-gray-400 font-sans text-sm">Gerencie e levante suas comissões acumuladas na plataforma.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card de Saldo */}
        <div className="premium-card p-8 flex flex-col justify-between border border-brand-border/40 relative overflow-hidden bg-brand-dark/40 rounded-2xl shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-3 text-brand-blue mb-6">
            <div className="p-3 bg-brand-blue/10 rounded-xl">
              <WalletIcon size={28} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Saldo do Administrador</p>
              <p className="text-xs text-green-400 font-semibold font-mono">Comissões de Vendas</p>
            </div>
          </div>
          
          <div className="space-y-2 mb-6">
            <h3 className="text-gray-400 text-sm font-sans">Disponível para Levantamento</h3>
            <p className="text-5xl font-extrabold font-display text-white tracking-tight">
              Kz {Number(wallet?.balance || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-xl p-4">
            <p className="text-xs text-brand-blue/90 font-medium font-sans leading-relaxed">
              Lembrete: Como administrador, seus levantamentos são diretos e isentos de taxas operacionais fixas!
            </p>
          </div>
        </div>

        {/* Form para levantamento */}
        <div className="premium-card p-8 border border-brand-border/40 bg-brand-dark/40 rounded-2xl shadow-xl">
          <h3 className="text-xl font-bold mb-6 font-display text-white">Solicitar Levantamento</h3>
          
          <form onSubmit={handleWithdrawalRequest} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-sans">
                Valor do Levantamento (Kz)
              </label>
              <input
                type="number"
                step="0.01"
                min="100"
                placeholder="Ex: 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="premium-input w-full"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-sans">
                  Método de Recebimento
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="premium-input w-full bg-brand-black"
                >
                  <option value="IBAN">IBAN (Conta Bancária)</option>
                  <option value="Multicaixa Express">Multicaixa Express</option>
                  <option value="Unitel Money">Unitel Money</option>
                  <option value="Afrimoney">Afrimoney</option>
                  <option value="PayPay">PayPay</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-sans">
                  Detalhes da Conta / Telefone
                </label>
                <input
                  type="text"
                  placeholder="Seu IBAN ou nº associado"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="premium-input w-full"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !wallet?.balance || Number(wallet.balance) <= 0}
              className="premium-button-primary w-full py-3 font-display font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar Levantamento'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Tabela de Histórico */}
      <div className="premium-card overflow-hidden border border-brand-border/40 bg-brand-dark/40 rounded-2xl shadow-xl">
        <div className="p-6 border-b border-brand-border/40">
          <h3 className="text-xl font-bold font-display text-white">Meus Levantamentos Solicitados</h3>
          <p className="text-xs text-gray-400 font-sans">Histórico de todas as suas retiradas pessoais.</p>
        </div>

        {withdrawals.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-sans">
            Nenhum levantamento solicitado até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-brand-dark/60 border-b border-brand-border/40">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Data</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Valor</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Método / Conta</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {withdrawals.map((item) => (
                  <tr key={item.id} className="hover:bg-brand-surface/25 transition-colors">
                    <td className="p-4 text-sm text-gray-300">
                      {new Date(item.created_at).toLocaleDateString('pt-AO')} às {new Date(item.created_at).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-sm font-bold text-white font-mono">
                      Kz {Number(item.amount).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {item.method}
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                        item.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                        item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 animate-pulse' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {item.status === 'approved' ? 'Aprovado' :
                         item.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                      </span>
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

function OrdersTab() {
  const { profile: adminProfile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products:product_id (*),
          customer:customer_id (name, email),
          affiliate:affiliate_id (name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      toast.error('Erro ao buscar encomendas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateOrderStatus = async (order: any, newStatus: string) => {
    try {
      const { error: statusErr } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);

      if (statusErr) throw statusErr;

      // Se o status alterou para concluído, creditar fisicamente na tabela "wallets" os valores divididos correspondentes
      if (newStatus === 'delivered') {
        const priceNum = Number(order.products?.price) || 0;
        const affiliateCommPercent = Number(order.products?.affiliate_commission) || 0;
        const platformFee = priceNum * 0.10; // 10% comissão da plataforma
        const affiliateReward = affiliateCommPercent > 0 && order.affiliate_id ? priceNum * (affiliateCommPercent / 100) : 0;
        const sellerNet = Math.max(0, priceNum - platformFee - affiliateReward);

        // 1. Creditar carteira do Produtor
        const producerId = order.products?.producer_id;
        if (producerId) {
          const { data: prodWallet } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', producerId)
            .maybeSingle();

          const currentProdBal = Number(prodWallet?.balance || 0);
          const newProdBal = currentProdBal + sellerNet;

          await supabase
            .from('wallets')
            .upsert({ user_id: producerId, balance: newProdBal, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
        }

        // 2. Creditar carteira do Afiliado (se aplicável)
        if (order.affiliate_id && affiliateReward > 0) {
          const { data: affWallet } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', order.affiliate_id)
            .maybeSingle();

          const currentAffBal = Number(affWallet?.balance || 0);
          const newAffBal = currentAffBal + affiliateReward;

          await supabase
            .from('wallets')
            .upsert({ user_id: order.affiliate_id, balance: newAffBal, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
        }

        // 3. Creditar carteira do Administrador
        if (adminProfile?.id) {
          const { data: admWallet } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', adminProfile.id)
            .maybeSingle();

          const currentAdmBal = Number(admWallet?.balance || 0);
          const newAdmBal = currentAdmBal + platformFee;

          await supabase
            .from('wallets')
            .upsert({ user_id: adminProfile.id, balance: newAdmBal, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
        }
      }

      toast.success(`Estado atualizado com êxito para: ${
        newStatus === 'delivered' ? 'Concluído (Carteiras Creditadas)' :
        newStatus === 'out_for_delivery' ? 'Em andamento' :
        newStatus === 'cancelled' ? 'Cancelada' : 'Pendente'
      }`);
      fetchOrders();
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao atualizar estado do pedido: ' + err.message);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return o.status === 'pending';
    if (filter === 'out_for_delivery') return o.status === 'out_for_delivery';
    if (filter === 'delivered') return o.status === 'delivered';
    if (filter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterClick = (filterId: string) => {
    setFilter(filterId);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display text-white">Gerenciamento de Encomendas</h2>
          <p className="text-sm text-gray-400 font-sans mt-0.5">Gerencie os pedidos, altere o status das entregas e credite comissões quando o pedido for concluído.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="premium-button-secondary py-2 px-4 text-xs font-bold uppercase tracking-wider cursor-pointer font-display"
        >
          Sincronizar Lista
        </button>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'pending', label: 'Pendentes' },
          { id: 'out_for_delivery', label: 'Em Andamento' },
          { id: 'delivered', label: 'Concluídas' },
          { id: 'cancelled', label: 'Canceladas' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => handleFilterClick(btn.id)}
            className={`py-1.5 px-4 rounded-full text-xs font-bold transition-all uppercase tracking-wider cursor-pointer border ${
              filter === btn.id 
                ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                : 'border-brand-border/40 text-gray-400 hover:text-white hover:border-brand-blue/30'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="premium-card h-28 animate-pulse border border-brand-border/25" />
          ))}
        </div>
      ) : paginatedOrders.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {paginatedOrders.map((order) => {
            const product = order.products || {};
            const customer = order.customer || {};
            const affiliate = order.affiliate || {};

            return (
              <div 
                key={order.id} 
                className="premium-card p-6 border border-brand-border/40 bg-brand-dark/20 rounded-2xl flex flex-col lg:flex-row gap-6 justify-between lg:items-center"
              >
                <div className="flex items-start gap-4">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-16 h-16 object-cover rounded-xl bg-brand-black" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-brand-black flex items-center justify-center text-gray-500">
                      Sem img
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-lg text-white font-display mb-1">{product.name || 'Produto Não Encontrado'}</h4>
                    <p className="text-xs text-gray-400 font-sans">
                      Cliente: <span className="font-semibold text-gray-300">{customer.name || 'Desconhecido'}</span> ({customer.email || 's/ email'})
                    </p>
                    {order.affiliate_id && (
                      <p className="text-xs text-brand-blue font-sans mt-0.5">
                        Afiliado: <span className="font-semibold">{affiliate.name || 'Desconhecido'}</span> ({affiliate.email || 's/ email'})
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-gray-500 font-mono">
                      <span>Bairro: {order.neighborhood}</span>
                      <span>•</span>
                      <span>Entrega: Kz {Number(order.delivery_fee).toLocaleString()}</span>
                      <span>•</span>
                      <span>Criado em: {new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end gap-4 border-t border-brand-border/30 pt-4 lg:pt-0 lg:border-t-0">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-0.5 font-sans">Total Cobrado</span>
                    <span className="text-2xl font-bold font-display text-brand-blue">
                      Kz {Number(order.total).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full mr-2 ${
                      order.status === 'delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                      order.status === 'out_for_delivery' ? 'bg-blue-500/10 text-brand-blue border border-brand-blue/30' :
                      order.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {order.status === 'delivered' ? 'Concluído' :
                       order.status === 'out_for_delivery' ? 'Em andamento' :
                       order.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                    </span>

                    {/* Action Selector */}
                    {order.status !== 'delivered' && (
                      <select
                        onChange={(e) => handleUpdateOrderStatus(order, e.target.value)}
                        value={order.status}
                        className="premium-input text-xs py-1.5 px-3 bg-brand-surface border-brand-border/60 text-white cursor-pointer"
                      >
                        <option value="pending">Pendente</option>
                        <option value="out_for_delivery">Em Andamento</option>
                        <option value="delivered">Marcar Concluído ✓</option>
                        <option value="cancelled">Marcar Cancelado ✗</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="premium-card py-16 text-center border border-brand-border/25 bg-brand-dark/10 rounded-2xl">
          <p className="text-gray-400 font-sans">Nenhuma encomenda encontrada com este status.</p>
        </div>
      )}

      {/* Controles de Paginação */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-brand-border/20">
          <p className="text-xs text-gray-400 font-sans">
            A mostrar <span className="font-semibold text-white">{startIndex + 1}</span> a <span className="font-semibold text-white">{Math.min(startIndex + itemsPerPage, filteredOrders.length)}</span> de <span className="font-semibold text-white">{filteredOrders.length}</span> encomendas
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

