import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product, DeliveryFee } from '../types/database';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Filter, ShoppingCart, Star, X, Truck, Wallet, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Marketplace() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [neighborhoods, setNeighborhoods] = useState<DeliveryFee[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyingProduct, setBuyingProduct] = useState<Product | null>(null);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string>('');
  const [isOrdering, setIsOrdering] = useState(false);

  // Novos campos para agendamento detalhado de encomendas de segunda a segunda
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutReference, setCheckoutReference] = useState('');
  const [checkoutDeliveryDay, setCheckoutDeliveryDay] = useState('Segunda-feira');

  useEffect(() => {
    fetchProducts();
    fetchNeighborhoods();
  }, []);

  // Preencher nome do cliente logado automaticamente ao abrir finalização de compra
  useEffect(() => {
    if (profile && buyingProduct) {
      setCheckoutName(profile.name || '');
    }
  }, [profile, buyingProduct]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const fetchNeighborhoods = async () => {
    const { data } = await supabase.from('delivery_fees').select('*');
    setNeighborhoods(data || []);
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Precisa de iniciar sessão para comprar');
      navigate('/auth');
      return;
    }

    if (!selectedNeighborhoodId || !buyingProduct) {
      toast.error('Por favor, selecione um bairro');
      return;
    }

    if (!checkoutName.trim() || !checkoutPhone.trim() || !checkoutReference.trim()) {
      toast.error('Por favor, preencha todos os campos de entrega obrigatórios.');
      return;
    }

    setIsOrdering(true);
    try {
      const neighborhood = neighborhoods.find(n => n.id.toString() === selectedNeighborhoodId);
      const delivery_fee = neighborhood?.amount || 0;
      const total = Number(buyingProduct.price) + Number(delivery_fee);
      const affiliate_id = localStorage.getItem('affiliate_ref');

      // String composta com os detalhes completos do agendamento
      const compositeNeighborhood = `${neighborhood?.neighborhood} | Ref: ${checkoutReference.trim()} | Tel: ${checkoutPhone.trim()} | Nome: ${checkoutName.trim()} | Dia: ${checkoutDeliveryDay}`;

      const { error } = await supabase.from('orders').insert([{
        customer_id: user.id,
        product_id: buyingProduct.id,
        affiliate_id: affiliate_id || null,
        status: 'pending',
        neighborhood: compositeNeighborhood,
        delivery_fee,
        total
      }]);

      if (error) throw error;

      toast.custom((t) => (
        <div className="bg-brand-surface border border-brand-blue/50 p-4 rounded-xl shadow-2xl flex items-center gap-4 text-white">
          <div className="bg-brand-blue p-2 rounded-full">
            <Truck size={20} />
          </div>
          <div>
            <p className="font-bold">Encomenda Realizada!</p>
            <p className="text-xs text-gray-400">Pague Kz {total.toLocaleString()} no ato da entrega ({checkoutDeliveryDay}).</p>
          </div>
        </div>
      ), { duration: 5000 });

      setBuyingProduct(null);
      setSelectedNeighborhoodId('');
      setCheckoutPhone('');
      setCheckoutReference('');
      setCheckoutDeliveryDay('Segunda-feira');
    } catch (error: any) {
      toast.error('Erro ao processar encomenda: ' + error.message);
    } finally {
      setIsOrdering(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const currentFee = neighborhoods.find(n => n.id.toString() === selectedNeighborhoodId)?.amount || 0;

  return (
    <div className="min-h-screen pb-20">
      {/* Header & Filter */}
      <div className="bg-brand-dark border-b border-brand-border py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:w-96 text-left">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar produtos..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="premium-input w-full pl-12"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="premium-card py-2 px-4 flex items-center gap-2 border-brand-blue/20">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-widest">Entrega em Luanda</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="premium-card h-80 animate-pulse bg-brand-surface" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductItem 
                key={product.id} 
                product={product} 
                onBuy={() => setBuyingProduct(product)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-brand-surface rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="text-gray-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500">Tente ajustar a sua pesquisa.</p>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {buyingProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="premium-card w-full max-w-lg p-0 overflow-hidden"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-dark">
                <h3 className="text-xl font-bold">Finalizar Compra</h3>
                <button 
                  onClick={() => setBuyingProduct(null)}
                  className="p-2 hover:bg-brand-surface rounded-lg transition-colors"
                >
                  <X />
                </button>
              </div>

              <form onSubmit={handleOrder} className="p-8 space-y-6">
                <div className="flex gap-4 items-center">
                  <img src={buyingProduct.image_url || ''} className="w-20 h-20 rounded-xl object-cover" />
                  <div>
                    <p className="font-bold">{buyingProduct.name}</p>
                    <p className="text-brand-blue font-bold font-display">Kz {Number(buyingProduct.price).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-400">Selecione o Bairro de Entrega</label>
                  <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-1">
                    {neighborhoods.map(n => (
                      <button
                        type="button"
                        key={n.id}
                        onClick={() => setSelectedNeighborhoodId(n.id.toString())}
                        className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          selectedNeighborhoodId === n.id.toString()
                            ? 'bg-brand-blue/10 border-brand-blue text-brand-blue'
                            : 'bg-brand-dark border-brand-border text-gray-500 hover:border-brand-border/50'
                        }`}
                      >
                        <p className="text-xs font-bold uppercase truncate">{n.neighborhood}</p>
                        <p className="text-[10px]">Taxa: Kz {Number(n.amount).toLocaleString()}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Novos campos de entrega detalhados */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Nome de Contacto</label>
                    <input
                      type="text"
                      className="premium-input w-full text-white text-sm"
                      placeholder="Nome de quem recebe"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Telemóvel de Contacto</label>
                    <input
                      type="tel"
                      className="premium-input w-full text-white text-sm"
                      placeholder="Ex: 923456789"
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Referência do Bairro detalhadamente</label>
                  <textarea
                    className="premium-input w-full h-16 min-h-[64px] text-white text-sm py-2 px-3"
                    placeholder="Especifique rua, cor de casa ou ponto de referência..."
                    value={checkoutReference}
                    onChange={(e) => setCheckoutReference(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Agendar Dia de Entrega (Segunda a Segunda)</label>
                  <select
                    className="premium-input w-full bg-brand-dark text-white text-sm py-2.5 px-3 cursor-pointer"
                    value={checkoutDeliveryDay}
                    onChange={(e) => setCheckoutDeliveryDay(e.target.value)}
                  >
                    <option value="Segunda-feira">Segunda-feira</option>
                    <option value="Terça-feira">Terça-feira</option>
                    <option value="Quarta-feira">Quarta-feira</option>
                    <option value="Quinta-feira">Quinta-feira</option>
                    <option value="Sexta-feira">Sexta-feira</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                  </select>
                </div>

                <div className="bg-brand-dark p-6 rounded-2xl space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>Kz {Number(buyingProduct.price).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Taxa de Entrega</span>
                    <span>Kz {currentFee.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-brand-border" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-brand-blue font-display">Kz {(Number(buyingProduct.price) + currentFee).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-yellow-500 bg-yellow-500/10 p-4 rounded-xl">
                  <Truck size={16} />
                  <span>Pagamento via **Cash on Delivery**. Receba a sua encomenda e pague ao estafeta.</span>
                </div>

                <button 
                  type="submit" 
                  disabled={isOrdering}
                  className="premium-button-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2"
                >
                  {isOrdering ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Confirmar Pedido'}
                </button>

                <a 
                  href="https://wa.me/244900000000" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-green-500 hover:underline pt-2"
                >
                  <MessageSquare size={16} />
                  Falar com Suporte via WhatsApp
                </a>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
    subcategory
  };
}

function ProductItem({ product, onBuy }: { product: Product, onBuy: () => void, key?: string }) {
  const [rating] = useState(4.5 + Math.random() * 0.5);
  const meta = parseProductMeta(product);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`premium-card group ${product.is_featured ? 'border-brand-blue/30 ring-1 ring-brand-blue/20' : ''}`}
    >
      <div className="relative aspect-square overflow-hidden bg-brand-dark">
        <img 
          src={product.image_url || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400`} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {meta.condition && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-brand-black/80 border border-brand-border/60 text-gray-300 tracking-wider">
            {meta.condition}
          </div>
        )}

        {meta.brand && (
          <div className="absolute top-3 right-3 bg-brand-black/70 px-2 py-0.5 rounded text-[9px] text-brand-blue font-bold uppercase tracking-wider border border-brand-blue/20">
            {meta.brand}
          </div>
        )}

        {product.is_featured && (
          <div className="absolute bottom-3 left-3 bg-brand-blue text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow-lg glow-blue">
            Premium
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <button 
            onClick={onBuy}
            className="premium-button-primary w-full flex items-center justify-center gap-2 py-2 cursor-pointer"
          >
            <ShoppingCart size={18} />
            Comprar Agora
          </button>
        </div>
      </div>
      <div className="p-5">
        <span className="text-[9px] uppercase font-bold tracking-wider text-gray-500 block mb-1">
          {meta.category} &rsaquo; {meta.subcategory}
        </span>
        <div className="flex items-center gap-1.5 mb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={12} className={i <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'} />
          ))}
          <span className="text-[10px] text-gray-500 ml-1">({Math.floor(Math.random() * 50) + 10} avaliações)</span>
        </div>
        <h3 className="font-bold text-lg mb-1 truncate text-white">{product.name}</h3>
        <p className="text-gray-400 text-xs mb-4 line-clamp-1">{meta.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold font-display text-brand-blue">
            Kz {Number(product.price).toLocaleString()}
          </span>
          <div className="text-[10px] text-gray-500 uppercase tracking-tighter px-2 py-1 bg-brand-dark rounded border border-brand-border">
            Luanda COD
          </div>
        </div>
      </div>
    </motion.div>
  );
}
