import { createClient } from '@/utils/supabase/server';
import { AdminTable } from '@/components/AdminTable';
import { FilterControls, FilterOption } from '@/components/FilterControls';
import { PaginationControls } from '@/components/PaginationControls';
import { ExpandableText } from '@/components/ExpandableText';
import Link from 'next/link';

const DEFAULT_PAGE_SIZE = 10;

export default async function AdminLlmModelResponsesPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const supabase = await createClient();

    const resolvedSearchParams = (await searchParams) || {};
    const currentPage = Number(resolvedSearchParams.page) || 1;
    const searchQuery = (resolvedSearchParams.q as string) || '';
    const filterBy = (resolvedSearchParams.filterBy as string) || 'llm_model_response'; // Default filter property
    const pageSize = DEFAULT_PAGE_SIZE;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize - 1;

    let query = supabase
        .from('llm_model_responses')
        .select('id, created_datetime_utc, llm_model_response, processing_time_seconds, llm_model_id, profile_id, caption_request_id, llm_system_prompt, llm_user_prompt, llm_temperature, humor_flavor_id, llm_prompt_chain_id, humor_flavor_step_id', { count: 'exact' });

    if (searchQuery) {
        if (filterBy === 'id') {
            query = query.ilike('id', `%${searchQuery}%`);
        } else if (filterBy === 'llm_model_response') {
            query = query.ilike('llm_model_response', `%${searchQuery}%`);
        } else if (filterBy === 'llm_model_id') {
            query = query.ilike('llm_model_id', `%${searchQuery}%`);
        } else if (filterBy === 'profile_id') {
            query = query.ilike('profile_id', `%${searchQuery}%`);
        } else if (filterBy === 'caption_request_id') {
            query = query.ilike('caption_request_id', `%${searchQuery}%`);
        } else if (filterBy === 'llm_system_prompt') {
            query = query.ilike('llm_system_prompt', `%${searchQuery}%`);
        } else if (filterBy === 'llm_user_prompt') {
            query = query.ilike('llm_user_prompt', `%${searchQuery}%`);
        } else if (filterBy === 'humor_flavor_id') {
            query = query.ilike('humor_flavor_id', `%${searchQuery}%`);
        } else if (filterBy === 'llm_prompt_chain_id') {
            query = query.ilike('llm_prompt_chain_id', `%${searchQuery}%`);
        } else if (filterBy === 'humor_flavor_step_id') {
            query = query.ilike('humor_flavor_step_id', `%${searchQuery}%`);
        }
    }

    const { data: llmModelResponses, error, count: totalCount } = await query.range(start, end);

    if (error) {
        console.error('Error fetching LLM model responses:', JSON.stringify(error, null, 2));
        return <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-red-500">Error loading LLM model responses.</div>;
    }

    const processedLlmModelResponses = llmModelResponses?.map((response) => ({
        ...response,
        id_short: <span title={response.id}>{String(response.id).substring(0, 8)}...</span>,
        created_at_formatted: new Date(response.created_datetime_utc).toLocaleDateString(),
        llm_model_response: <ExpandableText text={response.llm_model_response || ''} maxLength={100} />,
        llm_model_id_short: <span title={response.llm_model_id}>{String(response.llm_model_id).substring(0, 8)}...</span>,
        profile_id_short: <span title={response.profile_id}>{response.profile_id.substring(0, 8)}...</span>,
        caption_request_id_short: response.caption_request_id ? <span title={response.caption_request_id}>{String(response.caption_request_id).substring(0, 8)}...</span> : 'N/A',
        llm_system_prompt: <ExpandableText text={response.llm_system_prompt || ''} maxLength={100} />,
        llm_user_prompt: <ExpandableText text={response.llm_user_prompt || ''} maxLength={100} />,
        humor_flavor_id_short: response.humor_flavor_id ? <span title={response.humor_flavor_id}>{String(response.humor_flavor_id).substring(0, 8)}...</span> : 'N/A',
        llm_prompt_chain_id_short: response.llm_prompt_chain_id ? <span title={response.llm_prompt_chain_id}>{String(response.llm_prompt_chain_id).substring(0, 8)}...</span> : 'N/A',
        humor_flavor_step_id_short: response.humor_flavor_step_id ? <span title={response.humor_flavor_step_id}>{String(response.humor_flavor_step_id).substring(0, 8)}...</span> : 'N/A',
    })) || [];

    const headers = [
        { key: 'id_short', label: 'ID' },
        { key: 'created_at_formatted', label: 'Created' },
        { key: 'llm_model_response', label: 'Response' },
        { key: 'processing_time_seconds', label: 'Proc Time (s)' },
        { key: 'llm_model_id_short', label: 'Model ID' },
        { key: 'profile_id_short', label: 'Profile ID' },
        { key: 'caption_request_id_short', label: 'Req ID' },
        { key: 'llm_system_prompt', label: 'System Prompt' },
        { key: 'llm_user_prompt', label: 'User Prompt' },
        { key: 'llm_temperature', label: 'Temperature' },
        { key: 'humor_flavor_id_short', label: 'Flavor ID' },
        { key: 'llm_prompt_chain_id_short', label: 'Chain ID' },
        { key: 'humor_flavor_step_id_short', label: 'Step ID' },
    ];

    const filterOptions: FilterOption[] = [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'llm_model_response', label: 'Response', type: 'text' },
        { key: 'llm_model_id', label: 'Model ID', type: 'text' },
        { key: 'profile_id', label: 'Profile ID', type: 'text' },
        { key: 'caption_request_id', label: 'Request ID', type: 'text' },
        { key: 'llm_system_prompt', label: 'System Prompt', type: 'text' },
        { key: 'llm_user_prompt', label: 'User Prompt', type: 'text' },
        { key: 'humor_flavor_id', label: 'Flavor ID', type: 'text' },
        { key: 'llm_prompt_chain_id', label: 'Chain ID', type: 'text' },
        { key: 'humor_flavor_step_id', label: 'Step ID', type: 'text' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            {/* Sub-navigation for LLM section */}
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <Link href="/admin/llm/models" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Models</Link>
                    <Link href="/admin/llm/providers" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Providers</Link>
                    <Link href="/admin/llm/prompt-chains" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Prompt Chains</Link>
                    <Link href="/admin/llm/responses" className="whitespace-nowrap border-b-2 border-indigo-500 px-1 py-4 text-sm font-medium text-indigo-600" aria-current="page">Responses</Link>
                </nav>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">LLM Model Responses</h2>
            <div className="mb-4">
                <FilterControls filterOptions={filterOptions} defaultFilterKey="llm_model_response" placeholder="Search LLM responses..." />
            </div>
            <div className="my-8"></div>
            <AdminTable
                headers={headers}
                data={processedLlmModelResponses}
                cardTitleKey="llm_model_response"
            />
            <PaginationControls
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalCount || 0}
            />
        </div>
    );
}