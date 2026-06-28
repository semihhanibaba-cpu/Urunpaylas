'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, ShieldAlert } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-orange-600 selection:text-white">
      {/* Header */}
      <header className="bg-zinc-950 text-white h-20 flex items-center justify-between px-6 md:px-10 border-b border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-600 w-10 h-10 flex items-center justify-center rounded-sm rotate-12 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            <span className="font-black text-xl -rotate-12 italic text-white">FS</span>
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter uppercase">
            Flash Stock <span className="text-orange-500 font-bold text-xs italic ml-1 lowercase bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">flaş stok</span>
          </span>
        </div>
        <div className="flex items-center space-x-4 md:space-x-8 text-xs font-bold uppercase tracking-widest">
          <Link 
            href="/admin" 
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Süper Admin
          </Link>
          <Link 
            href="/auth" 
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-none border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            Toptancı Girişi
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        {/* Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 border-2 border-zinc-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-orange-700 text-xs font-black uppercase tracking-wider">
            <Zap className="h-3.5 w-3.5 animate-bounce" /> WhatsApp Grubu Üzerinden Flaş Satış
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-tight text-zinc-950 uppercase">
            Spot ve Fazla <br className="hidden sm:inline" />
            <span className="underline decoration-orange-600 decoration-8 underline-offset-4">
              Stoklarınızı
            </span> Flaş Hızla Satın!
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed font-medium">
            WhatsApp grubunuzdaki market ve kafelere tek tıkla mobil uyumlu şifresiz sipariş linki atın. 
            Canlı stok sayacı ile yarış başlasın, tüm ölü stoklar saniyeler içinde erisin!
          </p>

          <div className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              href="/auth" 
              className="w-full sm:w-auto bg-orange-600 text-white px-8 py-4 border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 text-base font-black transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              Hemen Toptancı Olarak Başla <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="/admin" 
              className="w-full sm:w-auto bg-zinc-950 text-white px-8 py-4 border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] hover:shadow-[2px_2px_0px_0px_rgba(249,115,22,1)] hover:translate-x-0.5 hover:translate-y-0.5 text-base font-black transition-all text-center uppercase tracking-wide"
            >
              Sistemi Test Et (Süper Admin)
            </Link>
          </div>
        </div>

        {/* System Work Flow (Visual Step-by-Step) */}
        <div className="mt-24">
          <h2 className="text-2xl sm:text-3xl font-black text-center text-zinc-950 uppercase tracking-tight mb-16">
            Sistem Nasıl Çalışır?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white border-2 border-zinc-950 p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="bg-orange-600 text-white w-12 h-12 flex items-center justify-center font-black text-xl border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-6 rotate-3">
                1
              </div>
              <h3 className="text-xl font-black text-zinc-950 mb-3 uppercase tracking-tight">
                Kampanya Oluşturun
              </h3>
              <p className="text-zinc-600 text-sm leading-relaxed font-medium">
                Toptancı paneline girerek; elinizdeki spot peynir, ambalaj, termos veya diğer ürünlerin acil indirimli fiyatını ve stok miktarını yazıp saniyeler içinde flaş satış başlatın.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border-2 border-zinc-950 p-8 shadow-[6px_6px_0px_0px_rgba(249,115,22,1)] transition-all">
              <div className="bg-zinc-950 text-white w-12 h-12 flex items-center justify-center font-black text-xl border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(249,115,22,1)] mb-6 -rotate-3">
                2
              </div>
              <h3 className="text-xl font-black text-zinc-950 mb-3 uppercase tracking-tight">
                Anlık Linki Gruba Atın
              </h3>
              <p className="text-zinc-600 text-sm leading-relaxed font-medium">
                Sistemin sizin için özel olarak ürettiği mobil uyumlu, şifresiz satış linkini (<code className="text-orange-600 bg-orange-50 font-black px-1.5 py-0.5 border border-orange-200 text-xs">/firsat/peynir-742</code>) WhatsApp grubunuza gönderin.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border-2 border-zinc-950 p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="bg-orange-600 text-white w-12 h-12 flex items-center justify-center font-black text-xl border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-6 rotate-6">
                3
              </div>
              <h3 className="text-xl font-black text-zinc-950 mb-3 uppercase tracking-tight">
                Siparişleri Toplayın
              </h3>
              <p className="text-zinc-600 text-sm leading-relaxed font-medium">
                Müşteriler (market, kafe) linke tıklar, canlı stok sayacını görerek dükkan adı ve telefonlarıyla saniyede stoğu kapar. Stok bittiğinde link otomatik kapanır, yarış tamamlanır!
              </p>
            </div>
          </div>
        </div>

        {/* Demo Simulator Note */}
        <div className="mt-20 bg-orange-50 border-2 border-zinc-950 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="bg-orange-600 p-3 rounded-none border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
            <ShieldAlert className="h-8 w-8 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-black text-zinc-950 uppercase tracking-tight mb-2">💡 Hızlı Test Rehberi</h4>
            <p className="text-sm text-zinc-700 leading-relaxed font-medium">
              Sistemi hemen deneyimlemek için <strong>Süper Admin Paneli</strong>&apos;ne giderek varsayılan yönetici hesabı (<code className="text-orange-600 font-bold bg-white border border-zinc-200 px-1 py-0.5 rounded">admin@flashstock.com</code> / şifre: <code className="text-orange-600 font-bold bg-white border border-zinc-200 px-1 py-0.5 rounded">admin123</code>) ile giriş yapabilir, yeni kayıt olan toptancıları tek tıkla onaylayıp kampanya linklerinin nasıl çalıştığını canlı test edebilirsiniz.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t-2 border-zinc-950 bg-white py-10 text-center text-xs font-bold uppercase tracking-widest text-zinc-500">
        <p>&copy; 2026 Flash Stock (Flaş Stok) SaaS Platformu. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
