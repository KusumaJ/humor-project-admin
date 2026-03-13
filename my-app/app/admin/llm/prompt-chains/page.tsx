import { createClient } from '@/utils/supabase/server';
import { AdminTable } from '@/components/AdminTable';
import { FilterControls, FilterOption } from '@/components/FilterControls';
import { PaginationControls } from '@/components/PaginationControls';
import Link from 'next/link';

const DEFAULT_PAGE_SIZE = 10;

export default async function AdminLlmPromptChainsPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const supabase = await createClient();

    const resolvedSearchParams = (await searchParams) || {};
    const currentPage = Number(resolvedSearchParams.page) || 1;
    const searchQuery = (resolvedSearchParams.q as string) || '';
    const filterBy = (resolvedSearchParams.filterBy as string) || 'caption_request_id'; // Default filter property
    const pageSize = DEFAULT_PAGE_SIZE;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize - 1;

    let query = supabase
        .from('llm_prompt_chains')
        .select('id, created_datetime_utc, caption_request_id', { count: 'exact' });

    if (searchQuery) {
        if (filterBy === 'id') {
            query = query.ilike('id', `%${searchQuery}%`);
        } else if (filterBy === 'caption_request_id') {
            query = query.ilike('caption_request_id', `%${searchQuery}%`);
        }
    }

    const { data: llmPromptChains, error, count: totalCount } = await query.range(start, end);

    if (error) {
        console.error('Error fetching LLM prompt chains:', JSON.stringify(error, null, 2));
        return <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-red-500">Error loading LLM prompt chains.</div>;
    }

    const processedLlmPromptChains = llmPromptChains?.map((chain) => ({
        ...chain,
        created_at_formatted: new Date(chain.created_datetime_utc).toLocaleDateString(),
    })) || [];

    const headers = [
        { key: 'id', label: 'ID' },
        { key: 'created_at_formatted', label: 'Created' },
        { key: 'caption_request_id', label: 'Caption Request ID' },
    ];

    const filterOptions: FilterOption[] = [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'caption_request_id', label: 'Caption Request ID', type: 'text' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            {/* Sub-navigation for LLM section */}
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <Link href="/admin/llm/models" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Models</Link>
                    <Link href="/admin/llm/providers" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Providers</Link>
                    <Link href="/admin/llm/prompt-chains" className="whitespace-nowrap border-b-2 border-indigo-500 px-1 py-4 text-sm font-medium text-indigo-600" aria-current="page">Prompt Chains</Link>
                    <Link href="/admin/llm/responses" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Responses</Link>
                </nav>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">LLM Prompt Chains</h2>
            <div className="mb-4">
                <FilterControls filterOptions={filterOptions} defaultFilterKey="caption_request_id" placeholder="Search prompt chains..." />
            </div>
            <div className="my-8"></div>
            <AdminTable
                headers={headers}
                data={processedLlmPromptChains}
                cardTitleKey="id"
            />
            <PaginationControls
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalCount || 0}
            />
        </div>
    );
}