'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

type SearchProps = { compact?: boolean };
export function PropertySearch({ compact = false }: SearchProps) {
  const router = useRouter();
  const [operation, setOperation] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (operation) params.set('operacion', operation);
    if (type) params.set('tipo', type);
    if (location) params.set('ubicacion', location);
    if (price) params.set('precio', price);
    if (bedrooms) params.set('dormitorios', bedrooms);
    router.push(`/propiedades${params.size ? `?${params}` : ''}`);
  }
  return <form className={`property-search ${compact ? 'property-search-page' : ''}`} onSubmit={submit}>
    <label>Operación<select value={operation} onChange={e => setOperation(e.target.value)}><option value="">Todas</option><option>Venta</option><option>Alquiler</option></select></label>
    <label>Tipo de propiedad<select value={type} onChange={e => setType(e.target.value)}><option value="">Todas</option><option>Casa</option><option>Departamento</option><option>Dúplex</option></select></label>
    <label>Ubicación<select value={location} onChange={e => setLocation(e.target.value)}><option value="">Todas</option><option>Colón, Entre Ríos</option></select></label>
    {compact && <label>Ambientes<select><option value="">Todos</option><option>3</option><option>4</option><option>5</option></select></label>}
    {compact && <label>Dormitorios<select value={bedrooms} onChange={e => setBedrooms(e.target.value)}><option value="">Todos</option><option>1</option><option>2</option><option>3</option></select></label>}
    <label>Precio<select value={price} onChange={e => setPrice(e.target.value)}><option value="">Hasta USD</option><option value="160000">USD 160.000</option><option value="190000">USD 190.000</option><option value="500000">$ 500.000</option></select></label>
    <button className="button search-button" type="submit"><Search /> Buscar</button>
  </form>;
}
