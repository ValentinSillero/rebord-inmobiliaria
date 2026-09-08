import Image from 'next/image';
import heroImage from '@/public/images/hero-inmobiliaria.png';
import { propertyFilterOptions } from '@/data/properties';
import { PropertySearch } from './PropertySearch';

export function Hero() {
  return <section className="hero">
    <Image src={heroImage} alt="Propiedad destacada de Esteban Rebord" fill priority placeholder="blur" quality={90} sizes="100vw" className="hero-image" />
    <div className="hero-overlay" />
    <div className="container hero-content">
      <div className="hero-copy fade-up"><p className="eyebrow eyebrow-light">NEGOCIOS INMOBILIARIOS</p><h1>Encontrá la propiedad ideal para vos</h1><p>Te acompañamos en cada paso para que tomes la mejor decisión. Confianza, experiencia y cercanía en cada operación.</p></div>
      <PropertySearch options={propertyFilterOptions} />
    </div>
  </section>;
}
