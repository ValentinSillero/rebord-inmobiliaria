import { MessageCircle } from 'lucide-react';
import { generalWhatsappMessage, whatsappUrl } from '@/lib/whatsapp';
export function WhatsAppButton() { return <a className="whatsapp-float" href={whatsappUrl(generalWhatsappMessage)} target="_blank" aria-label="Contactar por WhatsApp"><MessageCircle /><span>WhatsApp</span></a>; }
