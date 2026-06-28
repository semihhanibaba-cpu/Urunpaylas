/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Zap, Plus, Copy, Share2, LogOut, Package, RefreshCw, ShoppingCart, 
  AlertCircle, CheckCircle2, DollarSign, ArrowRight 
} from 'lucide-react';

interface IFlashSale {
  id: string;
  title: string;
  productImage: string;
  price: number;
  totalStock: number;
  remainingStock: number;
  unitType: string;
  status: 'active' | 'sold_out';
  uniqueSlug: string;
  createdAt: string;
}

interface IOrder {
  id: string;
  flashSaleId: string;
  customerBusinessName: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

const PRODUCT_PRESETS = [
  {
    title: 'Ezine Klasik Beyaz Peynir (17 kg Teneke)',
    price: 3850,
    totalStock: 45,
    unitType: 'Teneke',
    image: 'https://images.unsplash.com/photo-1486887396153-fa416525c108?auto=format&fit=crop&q=80&w=400'
  },
  {
    title: 'Karton Hamburger Kutusu (100\'lü Paket)',
    price: 420,
    totalStock: 150,
    unitType: 'Paket',
    image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&q=80&w=400'
  },
  {
    title: 'Paslanmaz Çelik Çift Cidarlı Termos',
    price: 290,
    totalStock: 80,
    unitType: 'Adet',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=400'
  },
  {
    title: 'Sızma Zeytinyağı 5 lt (Yerli Üretim)',
    price: 1650,
    totalStock: 30,
    unitType: 'Teneke',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400'
  }
];

export default function MerchantDashboard() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active sub-section view
  const [activeTab, setActiveTab] = useState<'sales' | 'orders'>('sales');

  // Campaigns and Orders state
  const [sales, setSales] = useState<IFlashSale[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);

  // Form states for creating campaign
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formUnit, setFormUnit] = useState('Koli');
  const [formImage, setFormImage] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Copied slugs registry for feedback
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('fs_token');
      if (!token) {
        router.push('/auth');
        return;
      }

      // Fetch profile
      const profileRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!profileRes.ok) {
        localStorage.removeItem('fs_token');
        router.push('/auth');
        return;
      }
      const profileData = await profileRes.json();
      setMerchant(profileData.user);

      // Fetch sales
      const salesRes = await fetch('/api/merchant/sales', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const salesData = await salesRes.json();
      if (salesData.success) {
        setSales(salesData.sales);
      }

      // Fetch orders
      const ordersRes = await fetch('/api/merchant/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setOrders(ordersData.orders);
      }

    } catch (err: any) {
      setError('Veriler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'POST' });
    } catch {}
    localStorage.removeItem('fs_token');
    localStorage.removeItem('fs_role');
    router.push('/auth');
  };

  // Preset Select Auto Fill
  const applyPreset = (preset: typeof PRODUCT_PRESETS[0]) => {
    setFormTitle(preset.title);
    setFormPrice(preset.price.toString());
    setFormStock(preset.totalStock.toString());
    setFormUnit(preset.unitType);
    setFormImage(preset.image);
    setFormSuccess('Hazır şablon yüklendi! "Flaş Satış Başlat" butonuna basarak anında aktifleştirebilirsiniz.');
    setTimeout(() => setFormSuccess(''), 4000);
  };

  // Submit new Campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    if (!formTitle || !formPrice || !formStock || !formUnit) {
      setFormError('Lütfen tüm zorunlu alanları doldurunuz.');
      setFormLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('fs_token');
      const res = await fetch('/api/merchant/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formTitle,
          price: Number(formPrice),
          totalStock: Number(formStock),
          unitType: formUnit,
          productImage: formImage
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Kampanya oluşturulamadı.');
        setFormLoading(false);
        return;
      }

      setFormSuccess('Harika! Flaş kampanya yayına alındı ve link üretildi.');
      // Reset form
      setFormTitle('');
      setFormPrice('');
      setFormStock('');
      setFormUnit('Koli');
      setFormImage('');
      
      // Refresh list
      fetchDashboardData();
    } catch (err) {
      setFormError('Sunucu bağlantı hatası oluştu.');
    } finally {
      setFormLoading(false);
    }
  };

  // Clipboard copy helper
  const handleCopyLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/firsat/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  // WhatsApp Share Helper
  const handleWhatsAppShare = (sale: IFlashSale) => {
    const fullUrl = `${window.location.origin}/firsat/${sale.uniqueSlug}`;
    const text = `🚨 *ANLIK FLAŞ FIRSAT!* 🚨\n\n🛍️ *${sale.title}*\n🔥 Acil İndirimli Fiyat: *${sale.price} TL*\n📦 Toplam Stok: *${sale.totalStock} ${sale.unitType}* (Kalan: *${sale.remainingStock}*)\n\n👇 Siparişinizi saniyeler içinde şifresiz geçmek ve stoğu ayırtmak için hemen tıklayın:\n🔗 ${fullUrl}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center text-zinc-950 font-sans">
        <div className="h-10 w-10 border-4 border-orange-600/30 border-t-orange-600 rounded-none animate-spin mb-4" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Yükleniyor...</span>
      </div>
    );
  }

  // Compute Stats
  const totalEarnings = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.totalPrice : 0), 0);
  const totalOrdersCount = orders.length;
  const activeCampaignsCount = sales.filter(s => s.status === 'active' && s.remainingStock > 0).length;
  const totalRemainingStock = sales.reduce((sum, s) => sum + s.remainingStock, 0);

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
              Flash Stock
            </span>
            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">Toptancı Satış Paneli</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-black text-white leading-tight uppercase">{merchant?.businessName}</span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">YETKİLİ: {merchant?.ownerName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] text-xs font-black uppercase tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            Güvenli Çıkış
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Welcome and Alert if not approved */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border-2 border-zinc-950 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <h1 className="text-2xl font-black text-zinc-950 uppercase tracking-tight flex items-center gap-2">
              Hoş Geldiniz, <span className="underline decoration-orange-600 decoration-4 underline-offset-2 italic">{merchant?.ownerName}</span> 👋
            </h1>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mt-1">
              {merchant?.businessName} firması olarak spot stok kampanyanızı yönetin ve gelen siparişleri canlı izleyin.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black uppercase">
            <CheckCircle2 className="h-4 w-4" /> HESABINIZ AKTİF VE ONAYLI
          </div>
        </div>

        {/* Dashboard Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <div className="bg-white border-2 border-zinc-950 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="text-zinc-400 text-xs font-black uppercase tracking-widest">Toplam Gelir</div>
            <div className="text-xl sm:text-2xl font-black text-zinc-950 mt-2">₺{totalEarnings.toLocaleString('tr-TR')}</div>
            <div className="absolute right-4 bottom-4 text-zinc-100 border border-zinc-200 p-2"><DollarSign className="h-6 w-6 text-zinc-400" /></div>
          </div>

          <div className="bg-white border-2 border-zinc-950 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="text-zinc-400 text-xs font-black uppercase tracking-widest">Gelen Sipariş</div>
            <div className="text-xl sm:text-2xl font-black text-zinc-950 mt-2">{totalOrdersCount} Adet</div>
            <div className="absolute right-4 bottom-4 text-zinc-100 border border-zinc-200 p-2"><ShoppingCart className="h-6 w-6 text-zinc-400" /></div>
          </div>

          <div className="bg-white border-2 border-zinc-950 p-5 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] relative overflow-hidden">
            <div className="text-zinc-400 text-xs font-black uppercase tracking-widest">Aktif Kampanya</div>
            <div className="text-xl sm:text-2xl font-black text-orange-600 mt-2">{activeCampaignsCount} Link</div>
            <div className="absolute right-4 bottom-4 text-orange-50 border border-orange-200 p-2"><Zap className="h-6 w-6 text-orange-500" /></div>
          </div>

          <div className="bg-white border-2 border-zinc-950 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="text-zinc-400 text-xs font-black uppercase tracking-widest">Kalan Toplam Stok</div>
            <div className="text-xl sm:text-2xl font-black text-zinc-950 mt-2">{totalRemainingStock} Birim</div>
            <div className="absolute right-4 bottom-4 text-zinc-100 border border-zinc-200 p-2"><Package className="h-6 w-6 text-zinc-400" /></div>
          </div>
        </div>

        {/* Main Grid: Create Campaign (Left) and Campaigns/Orders (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Create Campaign Form (5 columns) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white border-2 border-zinc-950 p-6 shadow-[6px_6px_0px_0px_rgba(249,115,22,1)] relative overflow-hidden">
              <h2 className="text-lg font-black text-zinc-950 mb-6 flex items-center gap-2 uppercase tracking-tight">
                <Plus className="h-5 w-5 text-orange-600" /> Yeni Flaş Kampanya Başlat
              </h2>

              {/* Product Presets Picker */}
              <div className="mb-6">
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">
                  Hazır Test Şablonları (Tek Tıkla Doldur)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRODUCT_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="text-left bg-zinc-50 hover:bg-zinc-100 p-2.5 border-2 border-zinc-950 hover:border-orange-600 text-[10px] font-bold text-zinc-800 transition-all flex items-start gap-1.5"
                    >
                      <span className="text-orange-600 font-bold">•</span>
                      <span className="line-clamp-2">{p.title.split(' (')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleCreateCampaign} className="space-y-4">
                {formError && (
                  <div className="bg-red-50 border-2 border-red-200 p-3.5 flex items-start gap-2">
                    <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-800 font-bold">{formError}</p>
                  </div>
                )}

                {formSuccess && (
                  <div className="bg-emerald-50 border-2 border-emerald-200 p-3.5 flex items-start gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-800 font-bold">{formSuccess}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">
                    Ürün Adı / Detayı <span className="text-orange-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="block w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-950 text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-600 font-medium text-sm"
                    placeholder="Örn: Klasik Sert Ezine Peyniri (Koli)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">
                      Fiyat (TL) <span className="text-orange-600">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="block w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-950 text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-600 font-medium text-sm"
                      placeholder="Örn: 2450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">
                      Birim Türü <span className="text-orange-600">*</span>
                    </label>
                    <select
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      className="block w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-950 text-zinc-950 focus:outline-none focus:ring-1 focus:ring-orange-600 font-bold text-sm"
                    >
                      <option value="Koli">Koli</option>
                      <option value="Adet">Adet</option>
                      <option value="Teneke">Teneke</option>
                      <option value="Kutu">Kutu</option>
                      <option value="Paket">Paket</option>
                      <option value="Kg">Kg</option>
                      <option value="Çuval">Çuval</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">
                    Stok Adeti (Flaş Satılacak) <span className="text-orange-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="block w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-950 text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-600 font-medium text-sm"
                    placeholder="Örn: 50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">
                    Ürün Resim URL&apos;si (Opsiyonel)
                  </label>
                  <input
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="block w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-950 text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-600 font-medium text-sm"
                    placeholder="https://..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-zinc-950 hover:bg-zinc-900 text-white border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none py-4 px-6 font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
                >
                  {formLoading ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap className="h-4 w-4 animate-pulse" /> Flaş Satış Başlat (Link Üret)
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: Active Campaigns & Live Orders tracking (7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* View Switcher Tabs */}
            <div className="flex border-b-2 border-zinc-950">
              <button
                onClick={() => setActiveTab('sales')}
                className={`py-3 px-6 text-xs font-black uppercase tracking-wider border-2 border-b-0 border-zinc-950 transition-all flex items-center gap-2 ${
                  activeTab === 'sales'
                    ? 'bg-orange-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-zinc-500 hover:text-zinc-950'
                }`}
              >
                <Zap className="h-4 w-4" /> Kampanyalar ({sales.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3 px-6 text-xs font-black uppercase tracking-wider border-2 border-b-0 border-l-0 border-zinc-950 transition-all flex items-center gap-2 ${
                  activeTab === 'orders'
                    ? 'bg-orange-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-zinc-500 hover:text-zinc-950'
                }`}
              >
                <ShoppingCart className="h-4 w-4" /> Siparişler ({orders.length})
              </button>
              <button
                onClick={fetchDashboardData}
                className="ml-auto p-2 border-2 border-b-0 border-zinc-950 bg-white text-zinc-500 hover:text-zinc-900 self-center transition-colors"
                title="Yenile"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {/* CONTENT AREA */}
            {activeTab === 'sales' && (
              <div className="space-y-4">
                {sales.length === 0 ? (
                  <div className="text-center py-12 bg-white border-2 border-zinc-950 text-zinc-500">
                    <Package className="h-10 w-10 mx-auto mb-3 text-zinc-400" />
                    <p className="font-black text-sm uppercase">Henüz flaş satış kampanyası başlatmadınız.</p>
                    <p className="text-xs text-zinc-400 mt-1 uppercase font-bold">Sol taraftaki formu doldurarak ilk kampanyayı anında yayınlayabilirsiniz.</p>
                  </div>
                ) : (
                  sales.map((sale) => {
                    const progress = (sale.remainingStock / sale.totalStock) * 100;

                    return (
                      <div 
                        key={sale.id}
                        className="bg-white border-2 border-zinc-950 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex gap-4">
                            {sale.productImage ? (
                              <img 
                                src={sale.productImage} 
                                alt={sale.title}
                                className="w-16 h-16 object-cover border-2 border-zinc-950 shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-zinc-100 border-2 border-zinc-950 flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0 italic">GÖRSEL YOK</div>
                            )}
                            <div>
                              <h3 className="font-black text-zinc-950 text-base leading-snug">{sale.title}</h3>
                              <p className="text-orange-600 font-black text-sm mt-1">₺{sale.price} / {sale.unitType}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-zinc-400 text-[10px] font-black uppercase">SLUG: {sale.uniqueSlug}</span>
                                {sale.remainingStock === 0 ? (
                                  <span className="px-1.5 py-0.5 text-[9px] font-black bg-red-100 text-red-800 border border-red-300 uppercase">Stok Bitti</span>
                                ) : (
                                  <span className="px-1.5 py-0.5 text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase animate-pulse">Aktif Satışta</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleCopyLink(sale.uniqueSlug)}
                              className="flex-1 sm:flex-initial bg-white text-zinc-950 px-3.5 py-2 border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[10px] font-black uppercase tracking-wider transition-all hover:shadow-none"
                            >
                              {copiedSlug === sale.uniqueSlug ? 'Kopyalandı!' : 'Linki Kopyala'}
                            </button>
                            <button
                              onClick={() => handleWhatsAppShare(sale)}
                              className="flex-1 sm:flex-initial bg-green-500 hover:bg-green-600 text-white px-3.5 py-2 border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[10px] font-black uppercase tracking-wider transition-all hover:shadow-none flex items-center justify-center gap-1"
                            >
                              <Share2 className="h-3.5 w-3.5" /> WhatsApp Paylaş
                            </button>
                          </div>
                        </div>

                        {/* Stok Progress Bar */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500 font-bold uppercase tracking-wider">Canlı Stok Durumu:</span>
                            <span className="font-black text-zinc-950">
                              {sale.remainingStock} / {sale.totalStock} {sale.unitType} Kalan
                            </span>
                          </div>
                          <div className="h-3 bg-zinc-100 border-2 border-zinc-950 overflow-hidden">
                            <div 
                              className={`h-full border-r border-zinc-950 transition-all duration-500 ${
                                progress <= 20 ? 'bg-red-500' : progress <= 50 ? 'bg-amber-500' : 'bg-orange-600'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Public Link Preview clicker */}
                        <div className="text-right">
                          <Link 
                            href={`/firsat/${sale.uniqueSlug}`} 
                            target="_blank"
                            className="inline-flex items-center gap-1 text-zinc-500 hover:text-orange-600 text-xs font-black uppercase tracking-wider transition-colors"
                          >
                            Müşteri Sayfasını Önizle <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-12 bg-white border-2 border-zinc-950 text-zinc-500">
                    <ShoppingCart className="h-10 w-10 mx-auto mb-3 text-zinc-400" />
                    <p className="font-black text-sm uppercase">Henüz hiç sipariş alınmadı.</p>
                    <p className="text-xs text-zinc-400 mt-1 uppercase font-bold">Flaş linklerinizi WhatsApp grubunuzda paylaştıkça siparişler buraya anında düşecektir.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden border-2 border-zinc-950 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="bg-zinc-950 text-xs font-black uppercase tracking-widest text-white">
                        <tr>
                          <th className="p-4 border-r border-zinc-800">Dükkan / Firma</th>
                          <th className="p-4 border-r border-zinc-800">Müşteri Alıcı</th>
                          <th className="p-4 border-r border-zinc-800 text-center">Miktar</th>
                          <th className="p-4 border-r border-zinc-800 text-right">Toplam Fiyat</th>
                          <th className="p-4 text-center">Tarih</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-zinc-800">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="p-4 border-r border-zinc-200">
                              <span className="font-bold text-zinc-950 block">{order.customerBusinessName}</span>
                              <span className="text-xs text-zinc-500 font-mono">{order.customerPhone}</span>
                            </td>
                            <td className="p-4 font-bold text-zinc-900 border-r border-zinc-200">
                              {order.customerName}
                            </td>
                            <td className="p-4 text-center font-black text-orange-600 border-r border-zinc-200">
                              {order.quantity} Adet
                            </td>
                            <td className="p-4 text-right font-black text-zinc-950 border-r border-zinc-200">
                              ₺{order.totalPrice.toLocaleString('tr-TR')}
                            </td>
                            <td className="p-4 text-center text-xs font-bold uppercase text-zinc-500">
                              {new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}
