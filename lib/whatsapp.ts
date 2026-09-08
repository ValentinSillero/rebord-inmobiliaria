export const WHATSAPP_NUMBER = '543447546469';
export const RENTALS_WHATSAPP_NUMBER = '543447409043';

export function whatsappUrl(message: string, number = WHATSAPP_NUMBER) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export const generalWhatsappMessage = 'Hola Esteban, vi su página web y quería realizar una consulta.';
export const rentalsWhatsappMessage = 'Hola, quería realizar una consulta por alquileres.';

export function propertyWhatsappMessage(propertyName: string) {
  return `Hola Esteban, estoy interesado/a en la propiedad: ${propertyName}. Quería recibir más información.`;
}

export function propertyWhatsappUrl(propertyName: string, operation: string) {
  const number = operation === 'Alquiler' ? RENTALS_WHATSAPP_NUMBER : WHATSAPP_NUMBER;
  return whatsappUrl(propertyWhatsappMessage(propertyName), number);
}
