import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rebord Inmobiliaria',
  description: 'Venta, alquiler y tasación de propiedades en Colón, Entre Ríos. Esteban Rebord Negocios Inmobiliarios.',
  openGraph: {
    title: 'Rebord Inmobiliaria',
    description: 'Venta, alquiler y tasación de propiedades en Colón, Entre Ríos.',
    locale: 'es_AR',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
