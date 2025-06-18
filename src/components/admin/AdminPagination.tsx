"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  basePath?: string;
}

export default function AdminPagination({ 
  currentPage, 
  totalPages, 
  hasNextPage, 
  hasPrevPage,
  basePath = '/admin/products'
}: AdminPaginationProps) {
  const searchParams = useSearchParams();

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    
    const queryString = params.toString();
    return `${basePath}${queryString ? `?${queryString}` : ''}`;
  };

  if (totalPages <= 1) {
    return null;
  }

  // Calculate page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
      <div className="text-sm text-gray-700">
        Trang <span className="font-medium">{currentPage}</span> của{' '}
        <span className="font-medium">{totalPages}</span>
      </div>
      
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        {/* Previous button */}
        {hasPrevPage ? (
          <Link
            href={buildUrl(currentPage - 1)}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span className="sr-only">Previous</span>
            <i className="fas fa-chevron-left"></i>
          </Link>
        ) : (
          <span className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-gray-100 text-sm font-medium text-gray-300 cursor-not-allowed">
            <span className="sr-only">Previous</span>
            <i className="fas fa-chevron-left"></i>
          </span>
        )}

        {/* Page numbers */}
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === '...') {
            return (
              <span
                key={`dots-${index}`}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
              >
                ...
              </span>
            );
          }

          const isCurrentPage = pageNum === currentPage;
          
          return (
            <Link
              key={pageNum}
              href={buildUrl(pageNum as number)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                isCurrentPage
                  ? 'z-10 bg-green-50 border-green-500 text-green-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </Link>
          );
        })}

        {/* Next button */}
        {hasNextPage ? (
          <Link
            href={buildUrl(currentPage + 1)}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span className="sr-only">Next</span>
            <i className="fas fa-chevron-right"></i>
          </Link>
        ) : (
          <span className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-gray-100 text-sm font-medium text-gray-300 cursor-not-allowed">
            <span className="sr-only">Next</span>
            <i className="fas fa-chevron-right"></i>
          </span>
        )}
      </nav>
    </div>
  );
}
