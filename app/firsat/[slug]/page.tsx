/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, use } from 'react';
import { 
  Zap, ShoppingCart, Store, User, Phone, CheckCircle2, 
  AlertTriangle, ArrowLeft, Package, Clock, ShieldCheck 
} from 'lucide-react';
import Link from 'next/link';

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
}

interface IMerchant {
  businessName: string;
  phone: string;
}

export default function FlashSaleCustomerPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await the dynamic params
  const { slug } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [sale, setSale] = useState<IFlashSale | null>(null);
  const [merchant, setMerchant] = useState<IMerchant | null>(null);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Success State
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchSaleDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/sales/${slug}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'İlgili flaş kampanya bulunamadı.');
        return;
      }

      setSale(data.sale);
      setMerchant(data.merchant);
    } catch {
      setError('Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchSaleDetails();
    }
  }, [slug]);

  // Handle Order submit
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitLoading(true);

    if (!sale) return;

    if (!businessName || !customerName || !customerPhone || !quantity) {
      setFormError('Lütfen tüm alanları eksiksiz doldurunuz.');
      setSubmitLoading(false);
      return;
    }

    if (quantity <= 0) {
      setFormError('Lütfen geçerli bir sipariş miktarı giriniz.');
      setSubmitLoading(false);
      return;
    }

    if (quantity > sale.remainingStock) {
      setFormError(`Yetersiz stok! En fazla ${sale.remainingStock} ${sale.unitType} sipariş edebilirsiniz.`);
      setSubmitLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashSaleId: sale.id,
          customerBusinessName: businessName,
          customerName,
          customerPhone,
          quantity: Number(quantity)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Siparişiniz tamamlanamadı.');
        setSubmitLoading(false);
        // Refresh details so they see updated remaining stock
        fetchSaleDetails();
        return;
      }

      setPlacedOrder(data.order);
      setOrderSuccess(true);
    } catch {
      setFormError('Bağlantı hatası oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center text-zinc-950 p-6 font-sans">
        <div className="h-10 w-10 border-4 border-orange-600/30 border-t-orange-600 rounded-none animate-spin mb-4" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Fırsat Detayları Yükleniyor...</span>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center text-center p-6 text-zinc-950 selection:bg-orange-600">
        <div className="bg-red-50 p-4 border-2 border-zinc-950 text-red-600 mb-4 rotate-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <AlertTriangle className="h-10 w-10 animate-bounce" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight mb-2">Flaş Kampanya Mevcut Değil</h2>
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 max-w-sm mb-6 leading-relaxed">
          {error || 'Aradığınız bağlantı süresi dolmuş veya sistemden kaldırılmış olabilir.'}
        </p>
        <Link 
          href="/" 
          className="bg-zinc-950 hover:bg-zinc-900 text-white px-6 py-3 border-2 border-zinc-950 shadow-[3px_3px_0px_0px_rgba(249,115,22,1)] text-xs font-black uppercase tracking-widest transition-all"
        >
          Ana Sayfaya Git
        </Link>
      </div>
    );
  }

  const isSoldOut = sale.status === 'sold_out' || sale.remainingStock <= 0;
  const progressPercent = (sale.remainingStock / sale.totalStock) * 100;

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 font-sans selection:bg-orange-600 selection:text-white pb-12">
      {/* Top minimalistic header */}
      <div className="bg-zinc-950 text-white sticky top-0 z-40 border-b-2 border-zinc-800">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-orange-600 w-8 h-8 flex items-center justify-center rounded-sm rotate-12 shadow-[1px_1px_0px_0px_rgba(255,255,255,1)]">
              <span className="font-black text-sm -rotate-12 italic text-white">FS</span>
            </div>
            <span className="font-black text-xs tracking-widest">FLASH STOCK</span>
          </div>
          <span className="text-[9px] bg-red-600 text-white px-2 py-1 font-black uppercase tracking-wider animate-pulse">
            CANLI STOK
          </span>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        
        {/* SUCCESS STATE PAGE */}
        {orderSuccess ? (
          <div className="bg-white border-2 border-zinc-950 p-6 sm:p-8 text-center space-y-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="inline-flex bg-emerald-100 p-4 border-2 border-zinc-950 text-emerald-800 rotate-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight">Siparişiniz Rezerve Edildi!</h2>
            <p className="text-sm font-bold text-zinc-600 leading-relaxed">
              Tebrikler, <strong>{customerName}</strong>! <strong>{quantity} {sale.unitType}</strong> ürün başarıyla sizin dükkanınız (<strong>{businessName}</strong>) adına ayrılmıştır. 
            </p>

            <div className="bg-zinc-50 p-5 border-2 border-zinc-950 text-left space-y-3">
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Sipariş Özetiniz</div>
              <div className="text-sm font-black text-zinc-950 leading-tight">{sale.title}</div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-500">
                <span>Miktar:</span>
                <span className="font-black text-zinc-950">{quantity} {sale.unitType}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-500">
                <span>Birim Fiyatı:</span>
                <span className="font-black text-zinc-950">₺{sale.price}</span>
              </div>
              <div className="border-t-2 border-zinc-950 pt-2 flex justify-between items-center text-sm font-black text-orange-600">
                <span>Toplam Ödeme:</span>
                <span className="text-lg">₺{placedOrder?.totalPrice || (sale.price * quantity)}</span>
              </div>
            </div>

            <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider leading-relaxed pt-2">
              💳 Herhangi bir kredi kartı veya ödeme şu an alınmamıştır. Toptancınız (<strong>{merchant?.businessName}</strong>) teslimat ve nakit tahsilat için sizinle en kısa sürede <strong>{customerPhone}</strong> numaralı telefondan iletişime geçecektir.
            </div>

            <button
              onClick={() => {
                setOrderSuccess(false);
                setQuantity(1);
                fetchSaleDetails();
              }}
              className="w-full bg-zinc-950 text-white py-4 px-4 border-2 border-zinc-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none font-black text-xs uppercase tracking-widest transition-all"
            >
              Yeni Sipariş Talebi Geç
            </button>
          </div>
        ) : (
          /* ACTIVE SHOPPING FORM PAGE */
          <div className="space-y-6">
            
            {/* Merchant info & product title card */}
            <div className="bg-white border-2 border-zinc-950 overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="relative h-56 sm:h-64 bg-zinc-100 border-b-2 border-zinc-950">
                {sale.productImage ? (
                  <img 
                    src={sale.productImage} 
                    alt={sale.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-zinc-300 tracking-widest italic uppercase">PRODUCT IMAGE</div>
                )}
                
                {/* Price Tag Overlay */}
                <div className="absolute -bottom-2 -right-2 bg-orange-600 text-white p-3 font-black text-sm rotate-6 border-2 border-zinc-950 shadow-lg">
                  SADECE {sale.price}₺
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Toptanci info */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 border-b-2 border-dashed border-zinc-200 pb-3">
                  <Store className="h-4 w-4 text-orange-600" />
                  <span>Satıcı Toptancı: <strong className="text-zinc-950">{merchant?.businessName}</strong></span>
                </div>

                <h1 className="text-lg font-black text-zinc-950 leading-snug uppercase tracking-tight">
                  {sale.title}
                </h1>

                {/* Kocaman CANLI STOK Sayacı */}
                <div className="bg-orange-50 border-2 border-orange-600 p-4 text-center relative overflow-hidden">
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 flex items-center justify-center gap-1">
                    <Clock className="h-3.5 w-3.5 animate-pulse" /> Kalan Stok
                  </span>
                  
                  <div className="text-4xl font-black text-orange-600 mt-1 flex items-baseline justify-center gap-1">
                    {isSoldOut ? '0' : sale.remainingStock} <span className="text-xs font-black">{sale.unitType.toUpperCase()}</span>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full h-3 bg-white border-2 border-orange-600 overflow-hidden mt-3">
                    <div 
                      className="h-full bg-orange-600 transition-all duration-700"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* ORDER SUBMIT FORM CARD */}
            <div className="bg-white border-2 border-zinc-950 p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(249,115,22,1)]">
              <h3 className="font-black text-zinc-950 text-base uppercase tracking-tight mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-orange-600" /> Stoğu Kapat & Rezerve Et
              </h3>

              {isSoldOut ? (
                <div className="bg-red-50 border-2 border-red-200 p-5 text-center space-y-2">
                  <Package className="h-8 w-8 mx-auto text-red-600" />
                  <h4 className="font-black text-red-800 uppercase text-sm">Ürün Stoğu Tükenmiştir!</h4>
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wider">WhatsApp grubundaki diğer güncel flaş fırsatları takip etmeye devam edin.</p>
                </div>
              ) : (
                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  {formError && (
                    <div className="bg-red-50 border-2 border-red-200 p-3 flex items-start gap-2">
                      <AlertTriangle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-800 font-bold">{formError}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-1.5">
                      Dükkan / Firma Adı <span className="text-orange-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <Store className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 bg-zinc-50 border-2 border-zinc-950 text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-600 text-sm font-medium"
                        placeholder="Örn: Akdeniz Market / Dostlar Büfe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-1.5">
                      Adınız ve Soyadınız <span className="text-orange-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 bg-zinc-50 border-2 border-zinc-950 text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-600 text-sm font-medium"
                        placeholder="Örn: Mustafa Yılmaz"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-1.5">
                      İletişim Telefon Numaranız <span className="text-orange-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 bg-zinc-50 border-2 border-zinc-950 text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-600 text-sm font-medium"
                        placeholder="Örn: 0532 XXXXXXX"
                      />
                    </div>
                  </div>

                  {/* Quantity and Price Calculation row */}
                  <div className="grid grid-cols-2 gap-4 items-center bg-zinc-50 p-4 border-2 border-zinc-950">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">
                        Miktar ({sale.unitType.toUpperCase()})
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={sale.remainingStock}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.min(sale.remainingStock, Math.max(1, Number(e.target.value))))}
                        className="block w-full px-3 py-2 bg-white border-2 border-zinc-950 text-zinc-950 font-black text-sm text-center"
                      />
                    </div>
                    <div className="text-right">
                      <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-400">Toplam</span>
                      <span className="text-xl font-black text-orange-600 block mt-1">
                        ₺{(sale.price * quantity).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full bg-zinc-950 text-white py-4 px-6 border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {submitLoading ? (
                      <div className="h-5 w-5 border-2 border-zinc-950 border-t-zinc-600 rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="h-5 w-5" /> Siparişi Onayla ve Stoğu Kap
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Back to main landing note */}
            <div className="text-center">
              <Link 
                href="/" 
                className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 text-xs font-black uppercase tracking-widest transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Flash Stock Nedir?
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
