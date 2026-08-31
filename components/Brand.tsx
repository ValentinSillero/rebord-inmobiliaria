export function Brand({ light = true }: { light?: boolean }) {
  return <div className="brand">
    <span className="brand-mark" aria-hidden="true">ER</span>
    <span className={light ? 'brand-copy' : 'brand-copy brand-copy-dark'}><strong>ESTEBAN REBORD</strong><small>NEGOCIOS INMOBILIARIOS</small></span>
  </div>;
}
