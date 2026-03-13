import { createClient } from '@/utils/supabase/server';
import { AdminTable } from '@/components/AdminTable';
import { FilterControls, FilterOption } from '@/components/FilterControls';
import { PaginationControls } from '@/components/PaginationControls';
import Link from 'next/link';

const DEFAULT_PAGE_SIZE = 10;

export default async function AdminFlavorPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const supabase = await createClient();

    const resolvedSearchParams = (await searchParams) || {};
    const currentPage = Number(resolvedSearchParams.page) || 1;
    const searchQuery = (resolvedSearchParams.q as string) || '';
    const filterBy = (resolvedSearchParams.filterBy as string) || 'slug'; // Default filter property for humor_flavors
    const pageSize = DEFAULT_PAGE_SIZE;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize - 1;

    // Fetch humor_flavors
    let humorFlavorsQuery = supabase
        .from('humor_flavors')
        .select('id, created_datetime_utc, slug, description', { count: 'exact' });

    if (searchQuery) {
        if (filterBy === 'id') {
            humorFlavorsQuery = humorFlavorsQuery.ilike('id', `%${searchQuery}%`);
        } else if (filterBy === 'name') {
            humorFlavorsQuery = humorFlavorsQuery.ilike('name', `%${searchQuery}%`);
        } else if (filterBy === 'description') {
            humorFlavorsQuery = humorFlavorsQuery.ilike('description', `%${searchQuery}%`);
        } else if (filterBy === 'owner_id') {
            humorFlavorsQuery = humorFlavorsQuery.ilike('owner_id', `%${searchQuery}%`);
        }
    }

    const { data: humorFlavors, error: flavorError, count: totalFlavorCount } = await humorFlavorsQuery.range(start, end);

    if (flavorError) {
        console.error('Error fetching humor flavors:', JSON.stringify(flavorError, null, 2));
        return <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-red-500">Error loading humor flavors.</div>;
    }

    const processedHumorFlavors = humorFlavors?.map((flavor) => ({
        ...flavor,
        display_id: <span title={flavor.id}>{flavor.id}</span>, // Display full ID
        created_at_formatted: new Date(flavor.created_datetime_utc).toLocaleDateString(),
    })) || [];

    const humorFlavorHeaders = [
        { key: 'display_id', label: 'ID' }, // Use display_id for rendering
        { key: 'created_at_formatted', label: 'Created' },
        { key: 'slug', label: 'Slug' },
        { key: 'description', label: 'Description' },
    ];

    const humorFlavorFilterOptions: FilterOption[] = [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'slug', label: 'Slug', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            {/* Sub-navigation for Flavor section */}
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <Link href="/admin/flavor" className="whitespace-nowrap border-b-2 border-indigo-500 px-1 py-4 text-sm font-medium text-indigo-600" aria-current="page">Flavors</Link>
                    <Link href="/admin/flavor/mix" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Mixes</Link>
                    <Link href="/admin/flavor/steps" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Steps</Link>
                </nav>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Humor Flavors Management</h2>
            <FilterControls filterOptions={humorFlavorFilterOptions} defaultFilterKey="slug" placeholder="Search humor flavors..." />
            <div className="my-8"></div>
            <AdminTable
                headers={humorFlavorHeaders}
                data={processedHumorFlavors}
                cardTitleKey="slug"
            />
            <PaginationControls
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalFlavorCount || 0}
            />
        </div>
    );
}

// Removed the humorFlavorStepHeaders, humorFlavorStepFilterOptions, humorFlavorMixHeaders, humorFlavorMixFilterOptions
// as they are no longer needed in this file
