'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  queryString: string;
};

type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

export function getPaginationItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages];
  if (currentPage >= totalPages - 3) return [1, 'ellipsis-start', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, 'ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end', totalPages];
}

export function Pagination({ currentPage, totalPages, queryString }: PaginationProps) {
  if (totalPages <= 1) return null;

  function hrefForPage(page: number) {
    const params = new URLSearchParams(queryString);
    params.set('page', page.toString());
    return `/propiedades?${params.toString()}`;
  }

  function scrollToListing() {
    window.setTimeout(() => {
      document.getElementById('propiedades-listado')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  const items = getPaginationItems(currentPage, totalPages);

  return <nav className="pagination" aria-label="Paginación de propiedades">
    {currentPage > 1
      ? <Link className="pagination-direction" href={hrefForPage(currentPage - 1)} rel="prev" prefetch={false} scroll={false} onClick={scrollToListing}><ArrowLeft aria-hidden="true" /><span>Anterior</span></Link>
      : <span className="pagination-direction is-disabled" aria-disabled="true"><ArrowLeft aria-hidden="true" /><span>Anterior</span></span>}
    <div className="pagination-pages">
      {items.map(item => typeof item === 'number'
        ? <Link
          className={`pagination-page${item === currentPage ? ' is-current' : ''}`}
          href={hrefForPage(item)}
          aria-label={`Página ${item}`}
          aria-current={item === currentPage ? 'page' : undefined}
          prefetch={false}
          scroll={false}
          onClick={scrollToListing}
          key={item}
        >{item}</Link>
        : <span className="pagination-ellipsis" aria-hidden="true" key={item}>…</span>)}
    </div>
    {currentPage < totalPages
      ? <Link className="pagination-direction" href={hrefForPage(currentPage + 1)} rel="next" prefetch={false} scroll={false} onClick={scrollToListing}><span>Siguiente</span><ArrowRight aria-hidden="true" /></Link>
      : <span className="pagination-direction is-disabled" aria-disabled="true"><span>Siguiente</span><ArrowRight aria-hidden="true" /></span>}
  </nav>;
}
