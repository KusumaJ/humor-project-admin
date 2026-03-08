'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import Link from 'next/link'; // Import Link

interface AdminTableProps<T> {
    headers: { key: string; label: string }[];
    data: T[];
    cardTitleKey: keyof T; // Key to use for the card title on small screens
    basePath?: string; // New optional prop for link base path
}

export function AdminTable<T extends { id: string | number } | {id: string} | {id: number}>({
    headers,
    data,
    cardTitleKey,
    basePath,
}: AdminTableProps<T>) {
    const router = useRouter(); // Call useRouter at the top level

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            {/* Table for larger screens */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            {headers.map((header) => (
                                <th
                                    key={header.key}
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                >
                                    {header.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {data.map((item: T) => (
                            <tr
                                key={item.id}
                                className={basePath ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" : ""} // Add hover effect if clickable
                                onClick={() => basePath && router.push(`${basePath}/${item.id}`)} // Use the router object
                            >
                                {headers.map((header) => (
                                    <td key={`${item.id}-${header.key}`} className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                        {item[header.key as keyof T] as React.ReactNode}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Cards for smaller screens */}
            <div className="md:hidden space-y-4">
                {data.map((item: T) => (
                    <div
                        key={item.id}
                        className={basePath ? "bg-gray-50 dark:bg-gray-700 shadow rounded-lg p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200" : "bg-gray-50 dark:bg-gray-700 shadow rounded-lg p-4"}
                        onClick={() => basePath && router.push(`${basePath}/${item.id}`)} // Use the router object
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {item[cardTitleKey] as React.ReactNode}
                        </h3>
                        {headers.map((header) => (
                            <div key={`${item.id}-card-${header.key}`} className="flex justify-between py-1">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-300">{header.label}:</span>
                                <span className="text-sm text-gray-900 dark:text-white">
                                    {item[header.key as keyof T] as React.ReactNode}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
