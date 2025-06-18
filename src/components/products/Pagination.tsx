"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function Pagination({ currentPage, totalPages, hasNextPage, hasPrevPage }: PaginationProps) {
  const searchParams = useSearchParams();

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    
    const queryString = params.toString();
    return `/san-pham${queryString ? `?${queryString}` : ''}`;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <nav className="flex items-center space-x-2">
        {hasPrevPage && (
          <Link
            href={buildUrl(currentPage - 1)}
            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-green-50 transition-colors"
          >
            <i className="fas fa-chevron-left"></i>
          </Link>
        )}
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <Link
            key={pageNum}
            href={buildUrl(pageNum)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              pageNum === currentPage
                ? 'bg-green-600 text-white'
                : 'border border-gray-300 hover:bg-green-50'
            }`}
          >
            {pageNum}
          </Link>
        ))}
        
        {hasNextPage && (
          <Link
            href={buildUrl(currentPage + 1)}
            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-green-50 transition-colors"
          >
            <i className="fas fa-chevron-right"></i>
          </Link>
        )}
      </nav>
    </div>
  );
}
