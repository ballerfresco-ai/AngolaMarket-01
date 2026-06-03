import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  LayoutDashboard, 
  User, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  Search,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const getDashboardPath = () => {
    switch (profile?.role) {
      case 'admin': return '/admin';
      case 'producer': return '/producer';
      case 'affiliate': return '/affiliate';
      case 'customer': return '/customer';
      default: return '/dashboard';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-black text-white">
      {/* Navigation */}
      <nav className="glass-effect sticky top-0 z-50 px-4 md:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-brand-blue rounded-lg flex items-center justify-center glow-blue transition-transform group-hover:scale-110">
            <ShoppingBag className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight">
            Angola<span className="text-brand-blue">Market</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/marketplace" className={`hover:text-brand-blue transition-colors ${location.pathname === '/marketplace' ? 'text-brand-blue' : ''}`}>Marketplace</Link>
          {profile && (
            <Link to={getDashboardPath()} className="flex items-center gap-2 hover:text-brand-blue transition-colors">
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {profile ? (
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-brand-surface rounded-full transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-brand-blue rounded-full"></span>
              </button>
              <div className="h-8 w-px bg-brand-border" />
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium leading-none">{profile.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
                </div>
                <button 
                  onClick={() => signOut()}
                  className="p-2 hover:bg-brand-surface rounded-lg text-gray-400 hover:text-white transition-all"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          ) : (
            <Link to="/auth" className="premium-button-primary py-2 px-6">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 hover:bg-brand-surface rounded-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden glass-effect absolute top-[72px] left-0 w-full p-6 flex flex-col gap-6 z-40"
          >
            <Link 
              to="/marketplace" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-medium"
            >
              Marketplace
            </Link>
            {profile && (
              <Link 
                to={getDashboardPath()} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium flex items-center gap-2"
              >
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
            )}
            <div className="h-px bg-brand-border" />
            {profile ? (
              <button 
                onClick={() => {
                  signOut();
                  setIsMobileMenuOpen(false);
                }}
                className="text-lg font-medium text-red-500 flex items-center gap-2"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            ) : (
              <Link 
                to="/auth" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="premium-button-primary text-center"
              >
                Sign In
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark border-t border-brand-border py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-bold font-display">
                Angola<span className="text-brand-blue">Market</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              O maior ecossistema de produtores e afiliados de Angola. Conectando a produção nacional ao consumidor final.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li><Link to="/marketplace" className="hover:text-brand-blue transition-colors">Marketplace</Link></li>
              <li><Link to="/producers" className="hover:text-brand-blue transition-colors">Para Produtores</Link></li>
              <li><Link to="/affiliates" className="hover:text-brand-blue transition-colors">Para Afiliados</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Suporte</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li><Link to="/help" className="hover:text-brand-blue transition-colors">Centro de Ajuda</Link></li>
              <li><Link to="/terms" className="hover:text-brand-blue transition-colors">Termos de Uso</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-blue transition-colors">Privacidade</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Contacto</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li>Luanda, Angola</li>
              <li>suporte@angolamarket.com</li>
              <li>+244 9XX XXX XXX</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto h-px bg-brand-border my-12" />
        <p className="text-center text-gray-600 text-xs">
          © {new Date().getFullYear()} AngolaMarket. Todos os direitos reservados.
        </p>
      </footer>

      {/* Floating WhatsApp Support Button */}
      <motion.a
        id="whatsapp-floating-support"
        href="https://wa.me/244950461466?text=Olá%20AngolaMarket%2C%20gostaria%20de%20obter%20suporte!"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white p-3.5 rounded-full font-bold shadow-[0_8px_30px_rgb(37,211,102,0.3)] hover:bg-[#20ba5a] transition-all hover:scale-110 active:scale-95 duration-200 group cursor-pointer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <MessageCircle size={24} className="text-white" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300 ease-out font-sans text-sm tracking-wide font-semibold white-space-nowrap">
          Suporte WhatsApp
        </span>
      </motion.a>
    </div>
  );
}
