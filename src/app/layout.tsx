import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { NavBar } from '@/components/nav-bar';
import { PWARegister } from './pwa-register';

export const metadata: Metadata = {
  title: 'Photos',
  description: 'Your personal photo library',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <PWARegister />
          <div className="flex min-h-dvh">
            <NavBar />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
