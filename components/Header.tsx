'use client';

import Link from 'next/link';
import { Menu, MessageCircle, Phone, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Brand } from './Brand';
import { generalWhatsappMessage, whatsappUrl } from '@/lib/whatsapp';

const links = [
  ['Inicio', '/'], ['Propiedades', '/propiedades'], ['Venta', '/propiedades?operacion=Venta'], ['Alquiler', '/propiedades?operacion=Alquiler'], ['Tasaciones', '/tasaciones'], ['Nosotros', '/#nosotros'], ['Contacto', '/#contacto'],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return <header className="site-header">
    <div className="header-inner">
      <Link href="/" aria-label="Ir al inicio"><Brand /></Link>
      <nav className="desktop-nav" aria-label="Navegación principal">
        {links.map(([label, href]) => <Link className={pathname === href || (href === '/propiedades' && pathname.startsWith('/propiedades')) ? 'active' : ''} href={href} key={label}>{label}</Link>)}
      </nav>
      <div className="header-contact">
        <a href={whatsappUrl(generalWhatsappMessage)} target="_blank"><MessageCircle /><span><small>WhatsApp</small>3447-546469</span></a>
        <a href="tel:+543447424412"><Phone /><span><small>Oficina</small>3447-424412</span></a>
      </div>
      <button className="menu-button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
    {open && <nav className="mobile-nav" aria-label="Navegación móvil">
      {links.map(([label, href]) => <Link href={href} onClick={() => setOpen(false)} key={label}>{label}</Link>)}
      <a className="button button-white" href={whatsappUrl(generalWhatsappMessage)} target="_blank"><MessageCircle /> Escribinos por WhatsApp</a>
    </nav>}
  </header>;
}
