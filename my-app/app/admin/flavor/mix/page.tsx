import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { AdminTable } from '@/components/AdminTable';
import { FilterControls, FilterOption } from '@/components/FilterControls';
import { PaginationControls } from '@/components/PaginationControls';
import { redirect } from 'next/navigation';

const DEFAULT_PAGE_SIZE = 10;

export default async function AdminFlavorMixPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const supabase = await createClient();

    const resolvedSearchParams = (await searchParams) || {};
    const currentPage = Number(resolvedSearchParams.page) || 1;
    const searchQuery = (resolvedSearchParams.q as string) || '';
    const filterBy = (resolvedSearchParams.filterBy as string) || 'humor_flavor_id';
    const pageSize = DEFAULT_PAGE_SIZE;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize - 1;

    let humorFlavorMixQuery = supabase
        .from('humor_flavor_mix')
        .select('id, created_datetime_utc, humor_flavor_id, caption_count', { count: 'exact' });

    if (searchQuery) {
        if (filterBy === 'id') {
            humorFlavorMixQuery = humorFlavorMixQuery.ilike('id', `%${searchQuery}%`);
        } else if (filterBy === 'humor_flavor_id') {
            humorFlavorMixQuery = humorFlavorMixQuery.ilike('humor_flavor_id', `%${searchQuery}%`);
        } else if (filterBy === 'caption_count') {
            humorFlavorMixQuery = humorFlavorMixQuery.ilike('caption_count', `%${searchQuery}%`);
        }
    }

    const { data: humorFlavorMix, error: mixError, count: totalFlavorMixCount } = await humorFlavorMixQuery.range(start, end);

    if (mixError) {
        console.error('Error fetching humor flavor mix:', JSON.stringify(mixError, null, 2));
        return <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-red-500">Error loading humor flavor mix.</div>;
    }

    if (totalFlavorMixCount === 1) {
        redirect(`/admin/flavor/mix/${humorFlavorMix[0].id}`);
    } else if (totalFlavorMixCount === 0) {
        redirect('/admin/flavor/mix/create');
    }


    const processedHumorFlavorMix = humorFlavorMix?.map((mix) => ({
        ...mix,
        display_id: <span title={mix.id}>{mix.id}</span>, // Display full ID
        created_at_formatted: new Date(mix.created_datetime_utc).toLocaleDateString(),
        display_humor_flavor_id: <span title={mix.humor_flavor_id}>{mix.humor_flavor_id}</span>, // Display full ID
        actions: (
            <Link
                href={`/admin/flavor/mix/${mix.id}`}
                className="text-indigo-600 hover:text-indigo-900"
            >
                Edit
            </Link>
        ),
    })) || [];

    const humorFlavorMixHeaders = [
        { key: 'display_id', label: 'ID' }, // Use display_id for rendering
        { key: 'created_at_formatted', label: 'Created' },
        { key: 'display_humor_flavor_id', label: 'Humor Flavor ID' }, // Use display_humor_flavor_id for rendering
        { key: 'caption_count', label: 'Caption Count' },
        { key: 'actions', label: 'Actions' }, // New Actions column
    ];

    const humorFlavorMixFilterOptions: FilterOption[] = [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'humor_flavor_id', label: 'Humor Flavor ID', type: 'text' },
        { key: 'caption_count', label: 'Caption Count', type: 'text' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            {/* Sub-navigation for Flavor section */}
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <Link href="/admin/flavor" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Flavors</Link>
                    <Link href="/admin/flavor/mix" className="whitespace-nowrap border-b-2 border-indigo-500 px-1 py-4 text-sm font-medium text-indigo-600" aria-current="page">Mixes</Link>
                    <Link href="/admin/flavor/steps" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Steps</Link>
                </nav>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Humor Flavor Mix Management</h2>
            <FilterControls filterOptions={humorFlavorMixFilterOptions} defaultFilterKey="humor_flavor_id" placeholder="Search humor flavor mix..." />
            <div className="my-8"></div>
            <AdminTable
                headers={humorFlavorMixHeaders}
                data={processedHumorFlavorMix}
                cardTitleKey="humor_flavor_id"
            />
            <PaginationControls
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalFlavorMixCount || 0}
            />
        </div>
    );
}
