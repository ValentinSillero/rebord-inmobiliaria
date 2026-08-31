import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Esteban Rebord | Negocios Inmobiliarios en Colón, Entre Ríos',
  description: 'Venta, alquiler y tasación de propiedades en Colón, Entre Ríos. Esteban Rebord Negocios Inmobiliarios.',
  openGraph: {
    title: 'Esteban Rebord | Negocios Inmobiliarios',
    description: 'Venta, alquiler y tasación de propiedades en Colón, Entre Ríos.',
    locale: 'es_AR',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
