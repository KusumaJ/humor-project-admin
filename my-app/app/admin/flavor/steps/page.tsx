import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { AdminTable } from '@/components/AdminTable';
import { FilterControls, FilterOption } from '@/components/FilterControls';
import { PaginationControls } from '@/components/PaginationControls';

const DEFAULT_PAGE_SIZE = 10;

export default async function AdminFlavorStepsPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const supabase = await createClient();

    const resolvedSearchParams = (await searchParams) || {};
    const currentPage = Number(resolvedSearchParams.page) || 1;
    const searchQuery = (resolvedSearchParams.q as string) || '';
    const filterBy = (resolvedSearchParams.filterBy as string) || 'description';
    const pageSize = DEFAULT_PAGE_SIZE;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize - 1;

    let humorFlavorStepsQuery = supabase
        .from('humor_flavor_steps')
        .select('id, created_datetime_utc, humor_flavor_id, humor_flavor_step_type_id, order_by, description', { count: 'exact' });

    if (searchQuery) {
        if (filterBy === 'id') {
            humorFlavorStepsQuery = humorFlavorStepsQuery.ilike('id', `%${searchQuery}%`);
        } else if (filterBy === 'flavor_id') {
            humorFlavorStepsQuery = humorFlavorStepsQuery.ilike('flavor_id', `%${searchQuery}%`);
        } else if (filterBy === 'step_type_id') {
            humorFlavorStepsQuery = humorFlavorStepsQuery.ilike('step_type_id', `%${searchQuery}%`);
        } else if (filterBy === 'description') {
            humorFlavorStepsQuery = humorFlavorStepsQuery.ilike('description', `%${searchQuery}%`);
        }
    }

    const { data: humorFlavorSteps, error: stepError, count: totalFlavorStepCount } = await humorFlavorStepsQuery.range(start, end);

    if (stepError) {
        console.error('Error fetching humor flavor steps:', JSON.stringify(stepError, null, 2));
        return <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-red-500">Error loading humor flavor steps.</div>;
    }

    const processedHumorFlavorSteps = humorFlavorSteps?.map((step) => ({
        ...step,
        display_id: <span title={step.id}>{step.id}</span>, // Display full ID
        created_at_formatted: new Date(step.created_datetime_utc).toLocaleDateString(),
        display_humor_flavor_id: <span title={step.humor_flavor_id}>{step.humor_flavor_id}</span>, // Display full ID
        display_humor_flavor_step_type_id: <span title={step.humor_flavor_step_type_id}>{step.humor_flavor_step_type_id}</span>, // Display full ID
        order_by: step.order_by,
    })) || [];

    const humorFlavorStepHeaders = [
        { key: 'display_id', label: 'ID' }, // Use display_id for rendering
        { key: 'created_at_formatted', label: 'Created' },
        { key: 'display_humor_flavor_id', label: 'Humor Flavor ID' }, // Use display_humor_flavor_id for rendering
        { key: 'display_humor_flavor_step_type_id', label: 'Humor Flavor Step Type ID' }, // Use display_humor_flavor_step_type_id for rendering
        { key: 'order_by', label: 'Order By' },
        { key: 'description', label: 'Description' },
    ];

    const humorFlavorStepFilterOptions: FilterOption[] = [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'humor_flavor_id', label: 'Humor Flavor ID', type: 'text' },
        { key: 'humor_flavor_step_type_id', label: 'Humor Flavor Step Type ID', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            {/* Sub-navigation for Flavor section */}
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <Link href="/admin/flavor" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Flavors</Link>
                    <Link href="/admin/flavor/mix" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Mixes</Link>
                    <Link href="/admin/flavor/steps" className="whitespace-nowrap border-b-2 border-indigo-500 px-1 py-4 text-sm font-medium text-indigo-600" aria-current="page">Steps</Link>
                </nav>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Humor Flavor Steps Management</h2>
            <FilterControls filterOptions={humorFlavorStepFilterOptions} defaultFilterKey="description" placeholder="Search humor flavor steps..." />
            <div className="my-8"></div>
            <AdminTable
                headers={humorFlavorStepHeaders}
                data={processedHumorFlavorSteps}
                cardTitleKey="description"
            />
            <PaginationControls
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalFlavorStepCount || 0}
            />
        </div>
    );
}
