'use client';

import { FormEvent, useState } from 'react';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { whatsappUrl } from '@/lib/whatsapp';

export default function ValuationsPage() {
  const [sent, setSent] = useState(false);
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const data = new FormData(e.currentTarget); const fields = ['nombre','apellido','telefono','email','tipo','direccion','localidad','comentario']; const text = fields.map(k => `${k[0].toUpperCase() + k.slice(1)}: ${data.get(k) || '-'}`).join('\n'); window.open(whatsappUrl(`Hola Esteban, quiero solicitar una tasación.\n\n${text}`), '_blank'); setSent(true); }
  return <><Header /><main><section className="valuation-hero"><div className="container"><p className="eyebrow eyebrow-light">TASACIONES</p><h1>¿Querés conocer el valor de tu propiedad?</h1><p>Solicitá una tasación y nos pondremos en contacto con vos.</p></div></section><section className="section valuation-section"><div className="container valuation-grid"><div className="valuation-copy"><p className="eyebrow">UNA DECISIÓN INFORMADA</p><h2>Conocé el valor de mercado de tu propiedad.</h2><p>Completá el formulario y recibí asesoramiento personalizado para tomar mejores decisiones.</p><div><CheckCircle2 /> Atención cercana y profesional</div><div><CheckCircle2 /> Tasaciones a medida</div><div><CheckCircle2 /> Confidencialidad en cada consulta</div></div><form className="valuation-form" onSubmit={submit}><div className="form-grid"><label>Nombre<input name="nombre" required /></label><label>Apellido<input name="apellido" required /></label><label>Teléfono<input name="telefono" type="tel" required /></label><label>Email<input name="email" type="email" required /></label><label>Tipo de propiedad<select name="tipo" required><option value="">Seleccioná una opción</option><option>Casa</option><option>Departamento</option><option>Terreno</option><option>Local comercial</option><option>Otra</option></select></label><label>Localidad<input name="localidad" required /></label></div><label>Dirección<input name="direccion" required /></label><label>Comentario<textarea name="comentario" rows={4} placeholder="Contanos brevemente sobre la propiedad" /></label><button className="button full-button" type="submit"><MessageCircle /> Solicitar tasación</button>{sent && <p className="form-success">Abrimos WhatsApp con tu solicitud. ¡Gracias por contactarnos!</p>}</form></div></section></main><Footer /><WhatsAppButton /></>;
}
