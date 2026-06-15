import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Oubliette - On-Chain AI Escape-Room Lock',
  description:
    'Oubliette is a clockwork vault of riddle-guarded locks on GenLayer. An injection-resistant AI gatekeeper rules SOLVED, PARTIAL, or REJECTED under validator consensus, releasing each mechanism and pulling you deeper into the vault on-chain.',
  applicationName: 'Oubliette',
  authors: [{ name: 'Oubliette' }],
  keywords: ['GenLayer', 'AI', 'escape room', 'puzzle', 'consensus', 'on-chain'],
  openGraph: {
    title: 'Oubliette - On-Chain AI Escape-Room Lock',
    description:
      'Defeat riddle-guarded brass mechanisms with a single written attempt. An AI gatekeeper rules under validator consensus and advances you deeper into the vault.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#1a1410',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
