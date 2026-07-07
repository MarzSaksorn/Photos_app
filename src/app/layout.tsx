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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

const themeScript = `
  (function() {
    try {
      var t = localStorage.getItem('theme');
      if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (t === 'dark') document.documentElement.classList.add('dark');
    } catch(e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
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
