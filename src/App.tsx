import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

function ConfigWarning() {
  const { isConfigured } = useAuth();
  if (isConfigured) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[100] premium-card p-6 border-brand-blue bg-brand-blue/10 backdrop-blur-xl">
      <div className="flex items-start gap-4 text-white">
        <div className="p-3 bg-brand-blue rounded-xl glow-blue">
          <AlertCircle className="text-white" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold font-display mb-1">Configuração Necessária</h3>
          <p className="text-sm text-gray-300">
            Para que a AngolaMarket funcione, você precisa configurar o Supabase. 
            Adicione <code className="bg-black px-1 rounded text-brand-blue font-mono">VITE_SUPABASE_URL</code> e <code className="bg-black px-1 rounded text-brand-blue font-mono">VITE_SUPABASE_ANON_KEY</code> no painel Secrets.
          </p>
        </div>
      </div>
    </div>
  );
}

// Lazy load pages for performance
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const Marketplace = React.lazy(() => import('./pages/Marketplace'));
const AdminDashboard = React.lazy(() => import('./pages/dashboards/AdminDashboard'));
const ProducerDashboard = React.lazy(() => import('./pages/dashboards/ProducerDashboard'));
const AffiliateDashboard = React.lazy(() => import('./pages/dashboards/AffiliateDashboard'));
const CustomerDashboard = React.lazy(() => import('./pages/dashboards/CustomerDashboard'));

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { profile, loading, session } = useAuth();
  
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-brand-black">
      <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!session) return <Navigate to="/auth" />;
  
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  const { profile, signOut, loading } = useAuth();

  // Affiliate tracking
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('affiliate_ref', ref);
      console.log('Affiliate reference saved:', ref);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-black">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (profile?.is_blocked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-black p-4 text-white">
        <div className="max-w-md w-full premium-card p-8 border-red-500/30 text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 animate-pulse">
            <AlertCircle size={36} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-display text-white">Conta Bloqueada</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              A sua conta foi temporariamente ou permanentemente suspensa pelo administrador da AngolaMarket por violação dos termos de serviço.
            </p>
          </div>
          <div className="pt-4 border-t border-brand-border">
            <button
              onClick={() => signOut()}
              className="w-full py-3 bg-red-500/20 text-red-100 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-sm font-semibold transition-colors"
            >
              Terminar Sessão
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/marketplace" element={<Marketplace />} />
      
      {/* Dashboards */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/producer/*" element={
        <ProtectedRoute allowedRoles={['producer']}>
          <ProducerDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/affiliate/*" element={
        <ProtectedRoute allowedRoles={['affiliate']}>
          <AffiliateDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/customer/*" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <CustomerDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={<DashboardRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <ConfigWarning />
          <React.Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <AppContent />
          </React.Suspense>
        </Layout>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#1E1E1E',
            color: '#fff',
            border: '1px solid #2A2A2A',
          }
        }} />
      </BrowserRouter>
    </AuthProvider>
  );
}

function DashboardRedirect() {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (!profile) return <Navigate to="/auth" />;
  
  switch (profile.role) {
    case 'admin': return <Navigate to="/admin" />;
    case 'producer': return <Navigate to="/producer" />;
    case 'affiliate': return <Navigate to="/affiliate" />;
    case 'customer': return <Navigate to="/customer" />;
    default: return <Navigate to="/" />;
  }
}
