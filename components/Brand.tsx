import Image from 'next/image';
import logoImage from '@/public/images/logo-rebord.png';

type BrandProps = {
  light?: boolean;
  priority?: boolean;
  sizes?: string;
};

export function Brand({ light = true, priority = false, sizes = '(max-width: 360px) 160px, 180px' }: BrandProps) {
  return <div className={`brand ${light ? '' : 'brand-dark'}`}>
    <Image
      className="brand-logo"
      src={logoImage}
      alt="Esteban Rebord Negocios Inmobiliarios"
      placeholder="blur"
      priority={priority}
      quality={90}
      sizes={sizes}
    />
  </div>;
}
