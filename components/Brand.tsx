import Image from 'next/image';

export function Brand({ light = true }: { light?: boolean }) {
  return <div className={`brand ${light ? '' : 'brand-dark'}`}>
    <Image
      className="brand-logo"
      src="/images/logo-rebord.png"
      alt="Esteban Rebord Negocios Inmobiliarios"
      width={1254}
      height={1254}
      sizes="(max-width: 360px) 160px, 180px"
    />
  </div>;
}
