import { AlignLeft, Check, Info, LayoutGrid, MapPin, Maximize, Zap } from 'lucide-react';
import type { PropertyDescriptionSections } from '@/lib/property-description';

export function PropertyDescription({ sections }: { sections: PropertyDescriptionSections }) {
  return <div className="property-information">
    {sections.description.length > 0 && <section className="property-info-section">
      <h2><AlignLeft /> Descripción</h2>
      <div className="property-info-copy">{sections.description.map(line => <p key={line}>{line}</p>)}</div>
    </section>}

    {sections.location.length > 0 && <section className="property-info-section">
      <h2><MapPin /> Ubicación</h2>
      <div className="property-info-copy">{sections.location.map(line => <p key={line}>{line}</p>)}</div>
    </section>}

    {sections.features.length > 0 && <section className="property-info-section">
      <h2><Check /> Características</h2>
      <ul className="property-info-list">{sections.features.map(line => <li key={line}><Check /> <span>{line}</span></li>)}</ul>
    </section>}

    {sections.surfaces.length > 0 && <section className="property-info-section">
      <h2><Maximize /> Superficie</h2>
      <div className="property-info-values">{sections.surfaces.map(line => <span key={line}>{line}</span>)}</div>
    </section>}

    {sections.distribution.length > 0 && <section className="property-info-section">
      <h2><LayoutGrid /> Distribución</h2>
      <ul className="property-info-list">{sections.distribution.map(line => <li key={line}><Check /> <span>{line}</span></li>)}</ul>
    </section>}

    {sections.services.length > 0 && <section className="property-info-section">
      <h2><Zap /> Servicios</h2>
      <ul className="property-info-list">{sections.services.map(line => <li key={line}><Check /> <span>{line}</span></li>)}</ul>
    </section>}

    {sections.additional.length > 0 && <section className="property-info-section">
      <h2><Info /> Información adicional</h2>
      <div className="property-info-copy">{sections.additional.map(line => <p key={line}>{line}</p>)}</div>
    </section>}
  </div>;
}
