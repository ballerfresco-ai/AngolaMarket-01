import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Save, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfileTab() {
  const { profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingName, setIsSubmittingName] = useState(false);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!name.trim()) {
      toast.error('O nome não pode estar vazio');
      return;
    }

    try {
      setIsSubmittingName(true);
      const { error } = await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', profile.id);

      if (error) throw error;
      await refreshProfile();
      toast.success('Nome de perfil atualizado com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao atualizar nome: ' + err.message);
    } finally {
      setIsSubmittingName(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error('Por favor, digite a nova password');
      return;
    }
    if (password.length < 6) {
      toast.error('A password deve ter pelo menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('As passwords não coincidem');
      return;
    }

    try {
      setIsSubmittingPass(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password atualizada com sucesso!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error('Erro ao atualizar password: ' + err.message);
    } finally {
      setIsSubmittingPass(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold font-display text-white">O Meu Perfil</h2>
        <p className="text-sm text-gray-400 font-sans mt-1">Gerencie as suas informações de login e perfil de utilizador.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Update Profile Details */}
        <div className="premium-card p-6 border border-brand-border/40 bg-brand-dark/20 rounded-2xl shadow-xl flex flex-col justify-between">
          <form onSubmit={handleUpdateName} className="space-y-4">
            <h3 className="text-xl font-bold font-display text-white border-b border-brand-border/40 pb-2 flex items-center gap-2">
              <User size={20} className="text-brand-blue" /> Dados Básicos
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Tipo de Conta</label>
              <div>
                <span className="inline-block py-1 px-3.5 rounded-full text-xs font-bold uppercase tracking-widest bg-brand-blue/10 border border-brand-blue/35 text-brand-blue font-mono">
                  {profile?.role === 'admin' ? 'Administrador' :
                   profile?.role === 'producer' ? 'Produtor nacional' :
                   profile?.role === 'affiliate' ? 'Afiliado digital' : 'Comprador (Cliente)'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Email de Login</label>
              <input
                type="text"
                value={profile?.email || ''}
                disabled
                className="premium-input w-full bg-brand-black/40 text-gray-400 border-brand-border/30 cursor-not-allowed select-none"
              />
              <span className="text-[10px] text-gray-500 font-sans block">O email de registo não pode ser alterado por motivos de segurança.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Introduza o seu nome"
                className="premium-input w-full text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingName}
              className="premium-button-primary w-full py-3 mt-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={16} />
              {isSubmittingName ? 'A Guardar...' : 'Guardar Alterações'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="premium-card p-6 border border-brand-border/40 bg-brand-dark/20 rounded-2xl shadow-xl flex flex-col justify-between">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <h3 className="text-xl font-bold font-display text-white border-b border-brand-border/40 pb-2 flex items-center gap-2">
              <Shield size={20} className="text-pink-400" /> Segurança & Password
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Nova Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="premium-input w-full text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Confirmar Nova Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a password anterior"
                className="premium-input w-full text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingPass}
              className="premium-button-secondary border-pink-500/30 text-pink-400 hover:bg-pink-500 hover:text-white w-full py-3 mt-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Lock size={16} />
              {isSubmittingPass ? 'A Atualizar...' : 'Atualizar Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
