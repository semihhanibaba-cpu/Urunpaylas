import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Flaş Stok | Toptancılar İçin Hızlı Stok Nakit Dönüştürme',
  description: 'Gıda ve mal toptancılarının spot veya fazla stoklarını WhatsApp/Telegram üzerinden anlık flaş satış linkleri ile saniyeler içinde nakde çevirmesini sağlar.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-slate-50 text-slate-900 font-sans antialiased selection:bg-orange-500 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
