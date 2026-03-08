'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationControlsProps {
    currentPage: number;
    pageSize: number;
    totalCount: number;
}

export function PaginationControls({ currentPage, pageSize, totalCount }: PaginationControlsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
    };

    if (totalPages <= 1) {
        return null; // Don't show controls if only one page or no data
    }

    return (
        <nav className="flex justify-between items-center pt-4" aria-label="Pagination">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-200">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </nav>
    );
}
