import { createClient } from '@/utils/supabase/server';
import { AdminTable } from '@/components/AdminTable';
import { FilterControls, FilterOption } from '@/components/FilterControls';
import { PaginationControls } from '@/components/PaginationControls';
import Link from 'next/link';

const DEFAULT_PAGE_SIZE = 10;

export default async function AdminLlmModelsPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const supabase = await createClient();

    const resolvedSearchParams = (await searchParams) || {};
    const currentPage = Number(resolvedSearchParams.page) || 1;
    const searchQuery = (resolvedSearchParams.q as string) || '';
    const filterBy = (resolvedSearchParams.filterBy as string) || 'name'; // Default filter property for llm_models
    const pageSize = DEFAULT_PAGE_SIZE;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize - 1;

    let query = supabase
        .from('llm_models')
        .select('id, created_datetime_utc, name, llm_provider_id, provider_model_id, is_temperature_supported', { count: 'exact' });

    if (searchQuery) {
        if (filterBy === 'id') {
            query = query.ilike('id', `%${searchQuery}%`);
        } else if (filterBy === 'name') {
            query = query.ilike('name', `%${searchQuery}%`);
        } else if (filterBy === 'llm_provider_id') {
            query = query.ilike('llm_provider_id', `%${searchQuery}%`);
        } else if (filterBy === 'provider_model_id') {
            query = query.ilike('provider_model_id', `%${searchQuery}%`);
        }
    }

    const { data: llmModels, error, count: totalCount } = await query.range(start, end);

    if (error) {
        console.error('Error fetching LLM models:', JSON.stringify(error, null, 2));
        return <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-red-500">Error loading LLM models.</div>;
    }

    const processedLlmModels = llmModels?.map((model) => ({
        ...model,
        id_short: <span title={model.id}>{String(model.id).substring(0, 8)}...</span>,
        created_at_formatted: new Date(model.created_datetime_utc).toLocaleDateString(),
        llm_provider_id_short: <span title={model.llm_provider_id}>{String(model.llm_provider_id).substring(0, 8)}...</span>,
        is_temperature_supported_formatted: model.is_temperature_supported ? 'Yes' : 'No',
        actions: (
            <div className="flex space-x-2">
                <Link
                    href={`/admin/llm/models/${model.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                >
                    Edit
                </Link>
                {/* Delete functionality will be on the edit page for confirmation */}
            </div>
        ),
    })) || [];

    const headers = [
        { key: 'id_short', label: 'ID' },
        { key: 'created_at_formatted', label: 'Created' },
        { key: 'name', label: 'Name' },
        { key: 'llm_provider_id_short', label: 'Provider ID' },
        { key: 'provider_model_id', label: 'Provider Model ID' },
        { key: 'is_temperature_supported_formatted', label: 'Temp Supported' },
        { key: 'actions', label: 'Actions' },
    ];

    const filterOptions: FilterOption[] = [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'llm_provider_id', label: 'Provider ID', type: 'text' },
        { key: 'provider_model_id', label: 'Provider Model ID', type: 'text' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            {/* Sub-navigation for LLM section */}
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <Link href="/admin/llm/models" className="whitespace-nowrap border-b-2 border-indigo-500 px-1 py-4 text-sm font-medium text-indigo-600" aria-current="page">Models</Link>
                    <Link href="/admin/llm/providers" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Providers</Link>
                    <Link href="/admin/llm/prompt-chains" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Prompt Chains</Link>
                    <Link href="/admin/llm/responses" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Responses</Link>
                </nav>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">LLM Models Management</h2>
                <Link href="/admin/llm/models/create">
                    <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors border border-gray-300 dark:border-gray-600">
                        Create New LLM Model
                    </button>
                </Link>
            </div>
            <div className="mb-4">
                <FilterControls filterOptions={filterOptions} defaultFilterKey="name" placeholder="Search LLM models..." />
            </div>
            <div className="my-8"></div>
            <AdminTable
                headers={headers}
                data={processedLlmModels}
                cardTitleKey="name"
            />
            <PaginationControls
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalCount || 0}
            />
        </div>
    );
}