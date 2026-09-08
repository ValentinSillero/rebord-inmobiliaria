'use client';

import { ArrowDownUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type PropertySort = 'recent' | 'low' | 'high';

type SortSelectProps = {
  value: PropertySort;
  queryString: string;
};

export function SortSelect({ value, queryString }: SortSelectProps) {
  const router = useRouter();

  function changeSort(nextSort: PropertySort) {
    const params = new URLSearchParams(queryString);
    params.delete('page');
    if (nextSort === 'recent') params.delete('orden');
    else params.set('orden', nextSort);

    const query = params.toString();
    router.push(`/propiedades${query ? `?${query}` : ''}`, { scroll: false });
    window.setTimeout(() => {
      document.getElementById('propiedades-listado')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  return <label className="sort">
    <ArrowDownUp aria-hidden="true" />
    <span>Ordenar por</span>
    <select value={value} onChange={event => changeSort(event.target.value as PropertySort)}>
      <option value="recent">Más recientes</option>
      <option value="low">Menor precio</option>
      <option value="high">Mayor precio</option>
    </select>
  </label>;
}
