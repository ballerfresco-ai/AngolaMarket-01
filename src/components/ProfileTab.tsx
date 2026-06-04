import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Save, Shield, Camera, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfileTab() {
  const { profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingName, setIsSubmittingName] = useState(false);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  // Profile Avatar states
  const [avatar, setAvatar] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      const cachedAvatar = localStorage.getItem(`profile_avatar_${profile.id}`);
      setAvatar(cachedAvatar || (profile as any)?.avatar_url || '');
    }
  }, [profile]);

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
      toast.success('Nome de perfil updated com sucesso!');
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, carregue uma imagem válida.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem de perfil não pode exceder 2MB.');
      return;
    }

    try {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setAvatar(base64String);

        if (profile) {
          // 1. Guardar no localStorage
          localStorage.setItem(`profile_avatar_${profile.id}`, base64String);

          // 2. Tentar atualizar a tabela de profiles de forma resiliente
          try {
            const { error } = await supabase
              .from('profiles')
              .update({ avatar_url: base64String } as any)
              .eq('id', profile.id);

            if (error) {
              await supabase
                .from('profiles')
                .update({ avatar: base64String } as any)
                .eq('id', profile.id);
            }
          } catch (err) {
            console.warn("Could not save avatar directly to cloud table. Stored in browser local storage.", err);
          }
          
          toast.success('Foto de perfil carregada com êxito!');
          await refreshProfile();
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error('Erro ao processar imagem de perfil: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile) return;
    try {
      setAvatar('');
      localStorage.removeItem(`profile_avatar_${profile.id}`);
      try {
        await supabase
          .from('profiles')
          .update({ avatar_url: null } as any)
          .eq('id', profile.id);
      } catch (e) {
        // Silent error
      }
      toast.success('Foto de perfil removida.');
      await refreshProfile();
    } catch (err: any) {
      toast.error('Erro ao remover foto: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold font-display text-white">O Meu Perfil</h2>
        <p className="text-sm text-gray-400 font-sans mt-1">Gerencie as suas informações de login, foto e perfil de utilizador.</p>
      </div>

      {/* Profile Photo Bento Section */}
      <div className="premium-card p-6 border border-brand-border/40 bg-brand-dark/20 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-brand-blue/40 bg-brand-surface flex items-center justify-center relative">
            {avatar ? (
              <img src={avatar} alt="Foto de Perfil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-brand-blue/10 text-brand-blue font-bold text-3xl font-display font-display">
                {name ? name.slice(0, 2).toUpperCase() : 'U'}
              </div>
            )}
            
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>

          <label className="absolute bottom-0 right-0 p-2 bg-brand-blue text-white rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarUpload} 
              disabled={isUploading} 
            />
            <Camera size={14} />
          </label>
        </div>

        <div className="text-center sm:text-left space-y-1">
          <h3 className="text-lg font-bold text-white font-display flex items-center gap-2 justify-center sm:justify-start">
            {name || 'Utilizador'}
            <span className="text-xs py-0.5 px-2 bg-brand-blue/10 border border-brand-blue/30 text-brand-blue rounded-full font-mono font-semibold uppercase tracking-wider scale-95">
              {profile?.role === 'admin' ? 'Administrador' :
               profile?.role === 'producer' ? 'Produtor nacional' :
               profile?.role === 'affiliate' ? 'Afiliado digital' : 'Comprador (Cliente)'}
            </span>
          </h3>
          <p className="text-xs text-gray-400 font-sans">{profile?.email}</p>
          <div className="flex gap-2 pt-2 justify-center sm:justify-start">
            <button 
              onClick={() => document.querySelector('input[type="file"]')?.dispatchEvent(new MouseEvent('click'))}
              className="text-xs font-bold text-brand-blue hover:underline cursor-pointer"
            >
              Alterar Foto
            </button>
            {avatar && (
              <>
                <span className="text-gray-600">|</span>
                <button 
                  onClick={handleRemoveAvatar}
                  className="text-xs font-bold text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={12} /> Remover
                </button>
              </>
            )}
          </div>
        </div>
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
                <span className="inline-block py-1 px-3.5 rounded-full text-xs font-bold uppercase tracking-widest bg-brand-blue/10 border border-brand-blue/35 text-brand-blue font-mono font-mono">
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
