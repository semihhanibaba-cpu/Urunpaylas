'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, ArrowLeft, Mail, Lock, Phone, User, Building, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register State
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Giriş yapılamadı.');
        setLoginLoading(false);
        return;
      }

      // Store token and redirect based on role
      localStorage.setItem('fs_token', data.token);
      localStorage.setItem('fs_role', data.role);

      if (data.role === 'superadmin') {
        router.push('/admin');
      } else {
        router.push('/merchant');
      }
    } catch (err: any) {
      setLoginError('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setRegLoading(true);

    if (!regBusinessName || !regOwnerName || !regEmail || !regPassword || !regPhone) {
      setRegError('Lütfen tüm alanları eksiksiz doldurunuz.');
      setRegLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: regBusinessName,
          ownerName: regOwnerName,
          email: regEmail,
          password: regPassword,
          phone: regPhone
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setRegError(data.error || 'Kayıt işlemi başarısız.');
        setRegLoading(false);
        return;
      }

      setRegSuccess(data.message || 'Kayıt başarılı! Admin onayı bekleyiniz.');
      // Reset fields
      setRegBusinessName('');
      setRegOwnerName('');
      setRegEmail('');
      setRegPassword('');
      setRegPhone('');
      
      // Auto switch to login tab after 3 seconds
      setTimeout(() => {
        setActiveTab('login');
        setLoginEmail(regEmail);
        setRegSuccess('');
      }, 3500);

    } catch (err) {
      setRegError('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-orange-600 selection:text-white relative">
      {/* Top Back Nav */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          href="/" 
          className="flex items-center gap-1.5 text-zinc-900 hover:text-orange-600 text-xs font-black uppercase tracking-wider bg-white border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-4 py-2"
        >
          <ArrowLeft className="h-4 w-4" /> Ana Sayfa
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="bg-orange-600 w-10 h-10 flex items-center justify-center rounded-sm rotate-12 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-black text-xl -rotate-12 italic text-white">FS</span>
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase text-zinc-950">
            Flash Stock
          </span>
        </div>
        <h2 className="text-3xl font-black text-zinc-950 tracking-tight uppercase">
          {activeTab === 'login' ? 'Toptancı Giriş' : 'Toptancı Kayıt'}
        </h2>
        <p className="mt-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
          Spot ve fazla stoklarınızı dakikalar içinde nakde çevirin.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4">
        <div className="bg-white border-2 border-zinc-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-10">
          
          {/* Tab Selection */}
          <div className="flex bg-zinc-100 border-2 border-zinc-950 p-1 mb-8">
            <button
              onClick={() => {
                setActiveTab('login');
                setLoginError('');
                setRegError('');
              }}
              className={`flex-1 text-center py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'login'
                  ? 'bg-orange-600 text-white border border-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setLoginError('');
                setRegError('');
              }}
              className={`flex-1 text-center py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'register'
                  ? 'bg-orange-600 text-white border border-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && (
                <div className="bg-red-50 border-2 border-red-200 p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 font-bold leading-relaxed">{loginError}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">
                  E-Posta Adresiniz
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-zinc-50 border-2 border-zinc-950 text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-600 font-medium text-sm"
                    placeholder="ornek@firma.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">
                  Şifreniz
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-zinc-50 border-2 border-zinc-950 text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-600 font-medium text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-zinc-950 hover:bg-zinc-900 text-white border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none py-4 px-6 font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loginLoading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Toptancı Sistemine Giriş Yap'
                )}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              {regError && (
                <div className="bg-red-50 border-2 border-red-200 p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 font-bold leading-relaxed">{regError}</p>
                </div>
              )}

              {regSuccess && (
                <div className="bg-emerald-50 border-2 border-emerald-200 p-4 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-800 font-bold leading-relaxed">{regSuccess}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">
                  Firma / Dükkan Ünvanı
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                    <Building className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regBusinessName}
                    onChange={(e) => setRegBusinessName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2.5 bg-zinc-50 border-2 border-zinc-950 text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-600 font-medium text-sm"
                    placeholder="Örn: Akdağ Gıda Toptan Ltd."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">
                  Yetkili / Sahibi Adı Soyadı
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regOwnerName}
                    onChange={(e) => setRegOwnerName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2.5 bg-zinc-50 border-2 border-zinc-950 text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-600 font-medium text-sm"
                    placeholder="Ahmet Akdağ"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">
                  E-Posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2.5 bg-zinc-50 border-2 border-zinc-950 text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-600 font-medium text-sm"
                    placeholder="iletisim@akdaggida.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">
                  İletişim Telefon No
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2.5 bg-zinc-50 border-2 border-zinc-950 text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-600 font-medium text-sm"
                    placeholder="0532 XXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">
                  Şifre Oluşturun
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2.5 bg-zinc-50 border-2 border-zinc-950 text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-600 font-medium text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none py-4 px-6 font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {regLoading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Kayıt Ol ve Onay Talebi Gönder'
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t-2 border-dashed border-zinc-200 text-center">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
              Kayıt olduktan sonra hesabınız admin tarafından kontrol edilerek onaylanacaktır.
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
