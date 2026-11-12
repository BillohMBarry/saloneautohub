import type { Metadata } from 'next';
import { Archivo, Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

const seoTitle = 'SaloneAutoHub — Sierra Leone Auto Parts & Mechanics';
const seoDescription =
  'Find OEM car parts by make, model, and year, and book certified mechanics across Freetown, Bo, Kenema, and Makeni with SaloneAutoHub.';
const ogImagePath = '/images/hero_salone_workshop_1794322110330.jpg';

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
  applicationName: 'SaloneAutoHub',
  keywords: [
    'Sierra Leone car parts',
    'Freetown mechanics',
    'SaloneAutoHub',
    'OEM spare parts Sierra Leone',
    'certified auto electrician Freetown',
    'engine diagnostics Sierra Leone',
    'transmission repair Freetown',
  ],
  openGraph: {
    type: 'website',
    siteName: 'SaloneAutoHub',
    title: seoTitle,
    description: seoDescription,
    locale: 'en_SL',
    images: [
      {
        url: ogImagePath,
        width: 1280,
        height: 720,
        alt: 'SaloneAutoHub — Certified mechanic performing digital engine diagnostics in Freetown, Sierra Leone',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoTitle,
    description: seoDescription,
    images: [ogImagePath],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'SaloneAutoHub',
  applicationCategory: 'ShoppingApplication',
  operatingSystem: 'All',
  description: seoDescription,
  areaServed: {
    '@type': 'Country',
    name: 'Sierra Leone',
  },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'SLE',
    lowPrice: '160',
    highPrice: '5400',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plusJakarta.variable} ${ibmPlexMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="bg-zinc-100 text-zinc-900 font-sans antialiased selection:bg-amber-500 selection:text-zinc-950"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
