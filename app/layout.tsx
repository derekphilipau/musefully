import { Inter } from 'next/font/google';

import { siteConfig } from '@/config/site';
import { Footer } from '@/components/layout/footer';
import { SiteHeader } from '@/components/layout/site-header';
import { Providers } from './layoutProviders';
import './globals.css';

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'musefully',
    template: '%s | musefully',
  },
  description: 'Elasticsearch + Next.js Search Prototype',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon.svg',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/apple-icon.jpg',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body className="bg-white font-sans text-neutral-900 antialiased dark:bg-neutral-900 dark:text-neutral-50">
        <Providers>
          <SiteHeader />
          <main className="min-h-screen">{children}</main>
          <Footer items={siteConfig.mainNav} />
        </Providers>
      </body>
    </html>
  );
}
