import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Shield, ShoppingBag, Users, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'producer' | 'affiliate' | 'customer'>('customer');
  const [loading, setLoading] = useState(false);
  const { isAdminExist } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Bem-vindo de volta!');
        navigate('/marketplace');
      } else {
        // Enforce admin rule
        if (role === 'admin' && isAdminExist) {
          toast.error('Já existe um administrador no sistema.');
          setLoading(false);
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { name, role }
          }
        });
        
        if (authError) throw authError;

        if (authData.user) {
          toast.success('Conta criada com sucesso!');
          navigate('/marketplace');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full premium-card p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">
            {isLogin ? 'Bem-vindo' : 'Criar Conta'}
          </h1>
          <p className="text-gray-500">
            {isLogin ? 'Introduza os seus dados para aceder' : 'Junte-se ao maior marketplace de Angola'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Nome Completo</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="premium-input w-full"
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-4 text-gray-400">Eu sou um...</label>
                <div className="grid grid-cols-2 gap-3">
                  <RoleCard 
                    active={role === 'customer'} 
                    onClick={() => setRole('customer')}
                    icon={<ShoppingBag size={20} />}
                    label="Cliente"
                  />
                  <RoleCard 
                    active={role === 'producer'} 
                    onClick={() => setRole('producer')}
                    icon={<Briefcase size={20} />}
                    label="Produtor"
                  />
                  <RoleCard 
                    active={role === 'affiliate'} 
                    onClick={() => setRole('affiliate')}
                    icon={<Users size={20} />}
                    label="Afiliado"
                  />
                  {!isAdminExist && (
                    <RoleCard 
                      active={role === 'admin'} 
                      onClick={() => setRole('admin')}
                      icon={<Shield size={20} />}
                      label="Admin"
                    />
                  )}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="premium-input w-full"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Palavra-passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="premium-input w-full"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="premium-button-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                {isLogin ? 'Entrar' : 'Criar Conta'}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500">
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-blue ml-2 hover:underline focus:outline-none"
            >
              {isLogin ? 'Registe-se' : 'Inicie Sessão'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function RoleCard({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
        active 
          ? 'bg-brand-blue/10 border-brand-blue text-brand-blue' 
          : 'bg-brand-dark border-brand-border text-gray-500 hover:border-brand-border/50'
      }`}
    >
      {icon}
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}
