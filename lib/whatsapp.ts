export const WHATSAPP_NUMBER = '543447546469';

export function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const generalWhatsappMessage = 'Hola Esteban, vi su página web y quería realizar una consulta.';

export function propertyWhatsappMessage(propertyName: string) {
  return `Hola Esteban, estoy interesado/a en la propiedad: ${propertyName}. Quería recibir más información.`;
}
