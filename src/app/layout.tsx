import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { auth0 } from '@/lib/auth0';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '時給管理 App',
  description: '従業員の時給計算とシフト管理を簡単に',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();
  const user = session?.user;

  return (
    <html lang="ja">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <Auth0Provider user={user}>
          <Navbar />
          <main className="pt-16 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-8">
              {children}
            </div>
          </main>
        </Auth0Provider>
      </body>
    </html>
  );
}
