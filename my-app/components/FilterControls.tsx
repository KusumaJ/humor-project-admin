'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface FilterOption {
    key: string;
    label: string;
    type: 'text' | 'boolean' | 'select'; // Added 'select' type
    options?: { value: string; label: string }[]; // Options for select type
}

export interface ViewOption {
    key: string;
    label: string;
}

interface FilterControlsProps {
    placeholder?: string;
    filterOptions: FilterOption[];
    defaultFilterKey: string;
    viewOptions?: ViewOption[]; // New prop for view options
    defaultViewKey?: string; // New prop for default view
}

export function FilterControls({
    placeholder = "Search...",
    filterOptions,
    defaultFilterKey,
    viewOptions,
    defaultViewKey,
}: FilterControlsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialQuery = searchParams.get('q') || '';
    const initialFilterBy = searchParams.get('filterBy') || defaultFilterKey;
    const initialView = searchParams.get('view') || defaultViewKey || (viewOptions && viewOptions.length > 0 ? viewOptions[0].key : '');


    // State for text search
    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [filterBy, setFilterBy] = useState(initialFilterBy);
    const [currentView, setCurrentView] = useState(initialView);


    // State for boolean filters
    const initialBooleanFilters: { [key: string]: boolean | undefined } = {};
    filterOptions.filter(opt => opt.type === 'boolean').forEach(opt => {
        const paramValue = searchParams.get(opt.key);
        if (paramValue === 'true') {
            initialBooleanFilters[opt.key] = true;
        } else if (paramValue === 'false') {
            initialBooleanFilters[opt.key] = false;
        } else {
            initialBooleanFilters[opt.key] = undefined;
        }
    });
    const [booleanFilters, setBooleanFilters] = useState(initialBooleanFilters);

    // State for select filters
    const initialSelectFilters: { [key: string]: string } = {};
    filterOptions.filter(opt => opt.type === 'select' && opt.options).forEach(opt => {
        initialSelectFilters[opt.key] = searchParams.get(opt.key) || opt.options![0].value;
    });
    const [selectFilters, setSelectFilters] = useState(initialSelectFilters);

    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setSearchTerm(initialQuery);
        setFilterBy(initialFilterBy);
        setCurrentView(initialView); // Sync view state

        const newBooleanFilters: { [key: string]: boolean | undefined } = {};
        filterOptions.filter(opt => opt.type === 'boolean').forEach(opt => {
            const paramValue = searchParams.get(opt.key);
            if (paramValue === 'true') {
                newBooleanFilters[opt.key] = true;
            } else if (paramValue === 'false') {
                newBooleanFilters[opt.key] = false;
            } else {
                newBooleanFilters[opt.key] = undefined;
            }
        });
        setBooleanFilters(newBooleanFilters);

        const newSelectFilters: { [key: string]: string } = {};
        filterOptions.filter(opt => opt.type === 'select' && opt.options).forEach(opt => {
            newSelectFilters[opt.key] = searchParams.get(opt.key) || opt.options![0].value;
        });
        setSelectFilters(newSelectFilters);
    }, [initialQuery, initialFilterBy, initialView, searchParams, filterOptions]);


    const applyFilters = (newSearchTerm: string, newFilterBy: string, newBooleanFilters: { [key: string]: boolean | undefined }, newView: string, newSelectFilters: { [key: string]: string }) => {
        const params = new URLSearchParams(searchParams.toString());

        // Text search params
        if (newSearchTerm) {
            params.set('q', newSearchTerm);
        } else {
            params.delete('q');
        }
        params.set('filterBy', newFilterBy);

        // Boolean filter params
        filterOptions.filter(opt => opt.type === 'boolean').forEach(opt => {
            if (newBooleanFilters[opt.key] === true) {
                params.set(opt.key, 'true');
            } else if (newBooleanFilters[opt.key] === false) {
                params.set(opt.key, 'false');
            } else {
                params.delete(opt.key);
            }
        });

        // Select filter params
        filterOptions.filter(opt => opt.type === 'select' && opt.options).forEach(opt => {
            if (newSelectFilters[opt.key] && newSelectFilters[opt.key] !== opt.options![0].value) { // Don't set if default
                params.set(opt.key, newSelectFilters[opt.key]);
            } else {
                params.delete(opt.key);
            }
        });

        // View param
        if (newView && viewOptions?.find(opt => opt.key === newView)) {
            params.set('view', newView);
        } else {
            params.delete('view');
        }

        params.set('page', '1'); // Reset page when filters change
        router.push(`?${params.toString()}`);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = event.target.value;
        setSearchTerm(newSearchTerm);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            applyFilters(newSearchTerm, filterBy, booleanFilters, currentView, selectFilters);
        }, 300); // 300ms debounce
    };

    const handleFilterByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newFilterBy = event.target.value;
        setFilterBy(newFilterBy);
        applyFilters(searchTerm, newFilterBy, booleanFilters, currentView, selectFilters); // Apply immediately when filter property changes
    };

    const handleBooleanFilterChange = (key: string, value: boolean | undefined) => {
        const newBooleanFilters = { ...booleanFilters, [key]: value };
        setBooleanFilters(newBooleanFilters);
        applyFilters(searchTerm, filterBy, newBooleanFilters, currentView, selectFilters); // Apply immediately
    };

    const handleSelectFilterChange = (key: string, value: string) => {
        const newSelectFilters = { ...selectFilters, [key]: value };
        setSelectFilters(newSelectFilters);
        applyFilters(searchTerm, filterBy, booleanFilters, currentView, newSelectFilters); // Apply immediately
    };

    const handleViewChange = (newView: string) => {
        setCurrentView(newView);
        applyFilters(searchTerm, filterBy, booleanFilters, newView, selectFilters); // Apply immediately
    };


    return (
        <div className="mb-12">
            <div className="flex flex-wrap items-end gap-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm">
                {/* Text Search Controls */}
                <div className="flex items-center gap-6 flex-grow">
                    <select
                        value={filterBy}
                        onChange={handleFilterByChange}
                        className="px-4 py-2 border-none ring-1 ring-gray-300 dark:ring-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none pr-8 transition-all duration-200"
                    >
                        {filterOptions.filter(opt => opt.type === 'text').map((option) => (
                            <option key={option.key} value={option.key}>{option.label}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="flex-grow px-4 py-2 border-none ring-1 ring-gray-300 dark:ring-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    />
                </div>

                {/* Boolean Filters */}
                {filterOptions.filter(opt => opt.type === 'boolean').map((option) => (
                    <div key={option.key} className="flex items-center gap-2">
                        <label htmlFor={option.key} className="text-gray-700 dark:text-gray-300 whitespace-nowrap">{option.label}:</label>
                        <select
                            id={option.key}
                            value={booleanFilters[option.key]?.toString() ?? 'all'}
                            onChange={(e) => handleBooleanFilterChange(option.key, e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}
                            className="px-4 py-2 border-none ring-1 ring-gray-300 dark:ring-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none pr-8 transition-all duration-200"
                        >
                            <option value="all">All</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                ))}

                {/* Select Filters */}
                {filterOptions.filter(opt => opt.type === 'select' && opt.options).map((option) => (
                    <div key={option.key} className="flex items-center gap-2">
                        <label htmlFor={option.key} className="text-gray-700 dark:text-gray-300 whitespace-nowrap">{option.label}:</label>
                        <select
                            id={option.key}
                            value={selectFilters[option.key] || option.options![0].value}
                            onChange={(e) => handleSelectFilterChange(option.key, e.target.value)}
                            className="px-4 py-2 border-none ring-1 ring-300 dark:ring-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none pr-8 transition-all duration-200"
                        >
                            {option.options!.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                ))}

                {/* View Options */}
                {viewOptions && viewOptions.length > 0 && (
                    <div className="flex items-center gap-2 p-1 rounded-md bg-gray-100 dark:bg-gray-700">
                        {viewOptions.map((option) => (
                            <button
                                key={option.key}
                                onClick={() => handleViewChange(option.key)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    currentView === option.key
                                        ? 'bg-indigo-600 text-white shadow'
                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
