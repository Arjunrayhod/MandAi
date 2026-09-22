import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4f46e5',
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'MandAi - Krishi Mandi & Business Billing Suite',
  description: 'Customizable Mandi Vyapari, Krishi Upaj, GST Billing, Inventory & Money Management Software',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className="h-full bg-slate-50" suppressHydrationWarning>
      <body
        className="h-full flex antialiased bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white"
        suppressHydrationWarning
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
