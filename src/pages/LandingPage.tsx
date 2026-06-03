import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Truck, 
  DollarSign,
  Users
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 md:px-8">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-4 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-brand-blue text-sm font-semibold mb-6">
              O Marketplace Oficial de Angola
            </span>
            <h1 className="text-5xl md:text-8xl font-bold font-display tracking-tight mb-8 leading-tight">
              A Revolução do Comércio <br />
              Digital em <span className="text-brand-blue">Angola</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              Conectamos produtores locais a afiliados talentosos e clientes satisfeitos. 
              Venda mais, ganhe comissões e compre com a segurança do Cash on Delivery.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link to="/marketplace" className="premium-button-primary scale-110 px-10 py-5 flex items-center gap-3 group">
                Explorar Marketplace
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/auth" className="premium-button-secondary scale-110 px-10 py-5">
                Criar Minha Loja
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-24 relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden border border-brand-border bg-brand-surface shadow-2xl p-2 mx-auto max-w-5xl">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000" 
                alt="AngolaMarket Dashboard" 
                className="rounded-2xl w-full opacity-80"
              />
            </div>
            {/* Float Cards */}
            <div className="absolute top-1/4 -left-12 md:left-24 z-20 hidden md:block">
              <div className="premium-card p-6 scale-110 flex items-center gap-4 bg-brand-surface/90 backdrop-blur">
                <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-xl flex items-center justify-center">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vendas Diárias</p>
                  <p className="text-2xl font-bold font-display">+Kz 450.000</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 md:px-8 bg-brand-dark/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-6">Porque escolher a AngolaMarket?</h2>
            <div className="w-24 h-1.5 bg-brand-blue mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Truck size={32} />}
              title="Cash on Delivery"
              description="Pague apenas quando receber o produto na mão. Máxima confiança para compradores angolanos."
            />
            <FeatureCard 
              icon={<Users size={32} />}
              title="Rede de Afiliados"
              description="Milhares de afiliados prontos para promover os seus produtos e escalar as suas vendas rapidamente."
            />
            <FeatureCard 
              icon={<DollarSign size={32} />}
              title="Pagamentos Flexíveis"
              description="Levante os seus lucros via IBAN, Unitel Money, Afrimoney ou Multicaixa Express."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-blue opacity-5 pointer-events-none" />
        <div className="max-w-5xl mx-auto premium-card p-12 md:p-20 text-center relative">
          <h2 className="text-3xl md:text-6xl font-bold font-display mb-8">Pronto para começar a faturar?</h2>
          <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto">
            Seja você um produtor procurando expandir ou um afiliado buscando renda extra, 
            a AngolaMarket é a sua ferramenta definitiva.
          </p>
          <Link to="/auth" className="premium-button-primary px-12 py-5 text-xl font-bold inline-flex items-center gap-3">
            Começar Grátis agora
            <ArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="premium-card p-10 hover:translate-y-[-8px] transition-all">
      <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-2xl flex items-center justify-center mb-8">
        {icon}
      </div>
      <h3 className="text-2xl font-bold font-display mb-4">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-lg">{description}</p>
    </div>
  );
}
