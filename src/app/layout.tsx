import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SmartAiAssistant } from '@/components/ai/SmartAiAssistant';

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
      <body className="h-full flex overflow-hidden antialiased">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 md:p-8">
            {children}
          </main>
        </div>
        <SmartAiAssistant />
      </body>
    </html>
  );
}
