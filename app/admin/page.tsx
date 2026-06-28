/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Zap, Shield, CheckCircle, XCircle, LogOut, Users, 
  Building2, RefreshCw, Mail, Phone, Calendar, Search, 
  AlertTriangle, Lock, ArrowRight, Activity 
} from 'lucide-react';

interface IMerchant {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  isApproved: boolean;
  subscriptionStatus: 'trial' | 'active' | 'expired';
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [merchants, setMerchants] = useState<IMerchant[]>([]);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Admin Login Form States (if not already logged in as superadmin)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Check auth
  const checkAuthAndFetch = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('fs_token');
    const role = localStorage.getItem('fs_role');

    if (!token || role !== 'superadmin') {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/merchants', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        // Token expired or invalid
        localStorage.removeItem('fs_token');
        localStorage.removeItem('fs_role');
        setIsAdmin(false);
      } else {
        const data = await res.json();
        if (data.success) {
          setMerchants(data.merchants);
          setIsAdmin(true);
        }
      }
    } catch {
      setError('Veriler alınırken ağ hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  // Admin Login Handle
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Yönetici girişi başarısız.');
        setLoginLoading(false);
        return;
      }

      if (data.role !== 'superadmin') {
        setLoginError('Bu panele erişim yetkiniz bulunmamaktadır.');
        setLoginLoading(false);
        return;
      }

      localStorage.setItem('fs_token', data.token);
      localStorage.setItem('fs_role', data.role);
      
      // Successfully authenticated
      setAdminEmail('');
      setAdminPassword('');
      checkAuthAndFetch();
    } catch {
      setLoginError('Bağlantı hatası oluştu.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Toggle Merchant Approval
  const handleToggleApproval = async (merchantId: string, currentStatus: boolean) => {
    setActionLoading(merchantId);
    setError('');
    const token = localStorage.getItem('fs_token');

    try {
      const res = await fetch('/api/admin/merchants', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: merchantId,
          isApproved: !currentStatus
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Onay durumu güncellenemedi.');
        return;
      }

      // Update state locally
      setMerchants(prev => 
        prev.map(m => m.id === merchantId ? { ...m, isApproved: !currentStatus } : m)
      );
    } catch {
      setError('İşlem sırasında ağ hatası oluştu.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fs_token');
    localStorage.removeItem('fs_role');
    setIsAdmin(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center text-zinc-950 font-sans">
        <div className="h-10 w-10 border-4 border-orange-600/30 border-t-orange-600 rounded-none animate-spin mb-4" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Yönetici Paneli Yükleniyor...</span>
      </div>
    );
  }

  // LOGIN SCREEN (Inline for safety and simple flow)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-orange-600 selection:text-white relative">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
          <div className="inline-flex bg-orange-600 p-3 border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4 text-white rotate-6">
            <Shield className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-black text-zinc-950 uppercase tracking-tight">
            Süper Admin Giriş
          </h2>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
            Flash Stock (Flaş Stok) ana SaaS yönetim portalı.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
          <div className="bg-white border-2 border-zinc-950 p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <form onSubmit={handleAdminLogin} className="space-y-5">
              
              {loginError && (
                <div className="bg-red-50 border-2 border-red-200 p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 font-bold leading-relaxed">{loginError}</p>
                </div>
              )}

              <div className="bg-orange-50 border-2 border-zinc-950 p-4 text-xs text-orange-800 space-y-1">
                <span className="font-black block uppercase tracking-wider">💡 Hızlı Test Giriş Bilgileri:</span>
                <span>E-posta: <strong>admin@flashstock.com</strong></span>
                <span className="block">Şifre: <strong>admin123</strong></span>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">
                  Yönetici E-Postası
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-zinc-50 border-2 border-zinc-950 text-zinc-950 focus:outline-none focus:ring-1 focus:ring-orange-600 text-sm"
                    placeholder="admin@flashstock.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">
                  Admin Şifresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-zinc-50 border-2 border-zinc-950 text-zinc-950 focus:outline-none focus:ring-1 focus:ring-orange-600 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-zinc-950 hover:bg-zinc-900 text-white border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] active:translate-x-0.5 active:translate-y-0.5 py-4 px-6 font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loginLoading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Süper Admin Paneline Gir <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // COMPUTE METRICS
  const totalMerchantsCount = merchants.length;
  const approvedCount = merchants.filter(m => m.isApproved).length;
  const pendingCount = merchants.filter(m => !m.isApproved).length;

  // FILTERED MERCHANTS
  const filteredMerchants = merchants.filter(m => 
    m.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-orange-600 selection:text-white">
      {/* Header */}
      <nav className="bg-zinc-950 text-white h-20 flex items-center justify-between px-6 md:px-10 border-b border-zinc-800 sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-600 w-10 h-10 flex items-center justify-center rounded-sm rotate-12 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            <span className="font-black text-xl -rotate-12 italic text-white">FS</span>
          </div>
          <div>
            <span className="text-xl font-black tracking-tighter uppercase block">
              Süper Admin
            </span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Flash Stock SaaS Yönetimi</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] text-xs font-black uppercase tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5"
        >
          Çıkış Yap
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Banner with Title and Refresh */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-zinc-950 uppercase tracking-tight">Toptancı Onay Havuzu</h1>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mt-1">
              Sisteme kayıt olan toptancıların belgelerini/bilgilerini inceleyerek tek tıkla onay havuzundan onaylayın.
            </p>
          </div>
          <button
            onClick={checkAuthAndFetch}
            className="flex items-center gap-1.5 bg-white text-zinc-950 px-4 py-2.5 border-2 border-zinc-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none text-xs font-black uppercase tracking-wider transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Listeyi Yenile
          </button>
        </div>

        {/* Status Metrics cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border-2 border-zinc-950 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <span className="text-zinc-400 text-xs font-black uppercase tracking-widest block">Toplam Toptancı</span>
              <span className="text-3xl font-black text-zinc-950 block mt-1">{totalMerchantsCount}</span>
            </div>
            <div className="bg-zinc-100 p-4 border border-zinc-200 text-zinc-600"><Users className="h-6 w-6" /></div>
          </div>

          <div className="bg-white border-2 border-zinc-950 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <span className="text-zinc-400 text-xs font-black uppercase tracking-widest block">Aktif / Onaylı</span>
              <span className="text-3xl font-black text-emerald-600 block mt-1">{approvedCount}</span>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-4 border border-emerald-200"><CheckCircle className="h-6 w-6" /></div>
          </div>

          <div className="bg-white border-2 border-zinc-950 p-6 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] flex items-center justify-between">
            <div>
              <span className="text-zinc-400 text-xs font-black uppercase tracking-widest block">Onay Bekleyen</span>
              <span className="text-3xl font-black text-orange-600 block mt-1">{pendingCount}</span>
            </div>
            <div className="bg-orange-50 text-orange-600 p-4 border border-orange-200"><Activity className="h-6 w-6" /></div>
          </div>
        </div>

        {/* Global Action Errors if any */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 p-4 mb-6 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 font-bold">{error}</p>
          </div>
        )}

        {/* Filter bar and Table Container */}
        <div className="bg-white border-2 border-zinc-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <h2 className="text-lg font-black text-zinc-950 uppercase tracking-tight self-start">Toptancı Listesi</h2>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Firma adı, yetkili veya e-posta ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-zinc-50 border-2 border-zinc-950 text-zinc-950 focus:outline-none focus:border-orange-600 text-xs"
              />
            </div>
          </div>

          {filteredMerchants.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 border-2 border-dashed border-zinc-300">
              <Building2 className="h-12 w-12 mx-auto mb-3 text-zinc-400" />
              <p className="font-black text-sm uppercase">Kayıtlı toptancı bulunamadı.</p>
              <p className="text-xs text-zinc-400 mt-1 uppercase font-bold">Arama kriterlerinizi değiştirmeyi deneyebilir veya yeni kayıt oluşturabilirsiniz.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-zinc-950 text-white text-xs font-black uppercase tracking-widest">
                  <tr>
                    <th className="p-4 border-r border-zinc-800">Firma Detayı</th>
                    <th className="p-4 border-r border-zinc-800">Yetkili Kişi</th>
                    <th className="p-4 border-r border-zinc-800">İletişim Bilgileri</th>
                    <th className="p-4 border-r border-zinc-800">Kayıt Tarihi</th>
                    <th className="p-4 border-r border-zinc-800 text-center">Onay Durumu</th>
                    <th className="p-4 text-right">Aksiyon</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-zinc-950 text-zinc-800 border-t-2 border-zinc-950">
                  {filteredMerchants.map((merchant) => (
                    <tr key={merchant.id} className="hover:bg-zinc-50 transition-colors font-medium">
                      <td className="p-4 border-r border-zinc-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-100 border border-zinc-300 text-zinc-600">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-black text-zinc-950 block">{merchant.businessName}</span>
                            <span className="text-[10px] bg-orange-50 border border-orange-200 text-orange-700 px-1.5 py-0.5 uppercase font-black tracking-wider">{merchant.subscriptionStatus}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-zinc-900 border-r border-zinc-200">
                        {merchant.ownerName}
                      </td>
                      <td className="p-4 border-r border-zinc-200">
                        <div className="space-y-0.5 text-xs">
                          <span className="flex items-center gap-1 text-zinc-700">
                            <Mail className="h-3 w-3 text-zinc-400" /> {merchant.email}
                          </span>
                          <span className="flex items-center gap-1 text-zinc-600">
                            <Phone className="h-3 w-3 text-zinc-400" /> {merchant.phone}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-zinc-500 border-r border-zinc-200 font-bold uppercase">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          {new Date(merchant.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="p-4 text-center border-r border-zinc-200">
                        {merchant.isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle className="h-3.5 w-3.5" /> AKTİF / ONAYLI
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black bg-orange-100 text-orange-800 border border-orange-300">
                            <XCircle className="h-3.5 w-3.5" /> ONAY BEKLİYOR
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleApproval(merchant.id, merchant.isApproved)}
                          disabled={actionLoading === merchant.id}
                          className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                            merchant.isApproved
                              ? 'bg-red-100 hover:bg-red-200 text-red-800'
                              : 'bg-green-500 hover:bg-green-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                          }`}
                        >
                          {actionLoading === merchant.id ? (
                            <div className="h-4 w-4 border-2 border-zinc-950 border-t-zinc-600 rounded-full animate-spin mx-auto" />
                          ) : merchant.isApproved ? (
                            'Onayı Kaldır / Askıya Al'
                          ) : (
                            'Onayla / Aktif Et'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
