export type Property = {
  slug: string;
  operation: 'Venta' | 'Alquiler';
  type: string;
  name: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  price: number;
  priceLabel: string;
  image: string;
  gallery: string[];
  description: string;
  features: string[];
  rooms: number;
  featured?: boolean;
};

// Datos demostrativos: editar este archivo para actualizar el catálogo.
export const properties: Property[] = [
  { slug: 'casa-premium-en-colon', operation: 'Venta', type: 'Casa', name: 'Casa premium en Colón', location: 'Colón, Entre Ríos', bedrooms: 3, bathrooms: 2, area: 180, price: 185000, priceLabel: 'USD 185.000', image: '/images/propiedad-1.png', gallery: ['/images/propiedad-1.png', '/images/propiedad-2.png', '/images/propiedad-3.png'], description: 'Una casa pensada para disfrutar del confort, los espacios luminosos y una ubicación privilegiada en Colón.', features: ['Cochera cubierta', 'Jardín', 'Parrilla', 'Aire acondicionado'], rooms: 5, featured: true },
  { slug: 'departamento-centrico', operation: 'Alquiler', type: 'Departamento', name: 'Departamento céntrico', location: 'Colón, Entre Ríos', bedrooms: 2, bathrooms: 1, area: 70, price: 380000, priceLabel: '$ 380.000 /mes', image: '/images/propiedad-2.png', gallery: ['/images/propiedad-2.png', '/images/propiedad-1.png', '/images/propiedad-4.png'], description: 'Departamento funcional y luminoso, cerca de los principales servicios y comercios de la ciudad.', features: ['Balcón', 'Ascensor', 'Cocina equipada', 'Excelente ubicación'], rooms: 3, featured: true },
  { slug: 'casa-moderna-a-estrenar', operation: 'Venta', type: 'Casa', name: 'Casa moderna a estrenar', location: 'Colón, Entre Ríos', bedrooms: 3, bathrooms: 2, area: 160, price: 155000, priceLabel: 'USD 155.000', image: '/images/propiedad-3.png', gallery: ['/images/propiedad-3.png', '/images/propiedad-1.png', '/images/propiedad-4.png'], description: 'Diseño contemporáneo, terminaciones de calidad y ambientes integrados para una vida más cómoda.', features: ['A estrenar', 'Galería', 'Lavadero', 'Patio'], rooms: 5, featured: true },
  { slug: 'duplex-con-patio', operation: 'Alquiler', type: 'Dúplex', name: 'Dúplex con patio', location: 'Colón, Entre Ríos', bedrooms: 3, bathrooms: 2, area: 90, price: 450000, priceLabel: '$ 450.000 /mes', image: '/images/propiedad-4.png', gallery: ['/images/propiedad-4.png', '/images/propiedad-2.png', '/images/propiedad-1.png'], description: 'Dúplex práctico con patio propio, ideal para quienes buscan comodidad y privacidad.', features: ['Patio', 'Cochera', 'Dos plantas', 'Calefacción'], rooms: 4, featured: true },
];

// Estadísticas demostrativas, centralizadas para su futura actualización.
export const stats = [
  { value: '+450', label: 'Propiedades disponibles' },
  { value: '+2.600', label: 'Clientes acompañados' },
  { value: '+12', label: 'Años de experiencia' },
  { value: '100%', label: 'Compromiso y confianza' },
];
