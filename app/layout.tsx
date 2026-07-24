import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Noviq Now — Real-Time News Dashboard',
  description: 'Live news tracking dashboard with AI-powered summarization and real-time updates from multiple sources.',
  icons: {
    icon: '/favicon.jpg',
    shortcut: '/favicon.jpg',
    apple: '/favicon.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col dot-grid">
        {/* Apply the saved theme before hydration to avoid a flash of the wrong theme. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{if(localStorage.getItem('noviq_theme')==='light'){document.documentElement.classList.add('light')}}catch(e){}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
