import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Alinversion — Investment Tracker',
  description: 'Seguí tus CEDEARs y criptos en un solo lugar — Alinversion',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0b0d',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="noise-bg grid-lines">
        {children}
      </body>
    </html>
  );
}
