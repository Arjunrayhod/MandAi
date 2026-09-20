import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SmartAiAssistant } from '@/components/ai/SmartAiAssistant';

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
    <html lang="hi" className="h-full bg-slate-50">
      <body className="h-full flex overflow-hidden antialiased bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden w-full">
          <Header />
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-900 p-3 sm:p-6 md:p-8 w-full max-w-full">
            {children}
          </main>
        </div>
        <SmartAiAssistant />
      </body>
    </html>
  );
}
