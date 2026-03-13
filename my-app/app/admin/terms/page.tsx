import { createClient } from '@/utils/supabase/server';
import { AdminTable } from '@/components/AdminTable';
import { FilterControls, FilterOption } from '@/components/FilterControls';
import { PaginationControls } from '@/components/PaginationControls';
import { CopyToClipboard } from '@/components/CopyToClipboard';
import Link from 'next/link';

const DEFAULT_PAGE_SIZE = 10;

export default async function AdminTermsPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const supabase = await createClient();

    const resolvedSearchParams = (await searchParams) || {};
    const currentPage = Number(resolvedSearchParams.page) || 1;
    const searchQuery = (resolvedSearchParams.q as string) || '';
    const filterBy = (resolvedSearchParams.filterBy as string) || 'term'; // Default filter property for terms
    const pageSize = DEFAULT_PAGE_SIZE;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize - 1;

    // Fetch terms
    let termsQuery = supabase
        .from('terms')
        .select('id, created_datetime_utc, modified_datetime_utc, term, definition, example, priority, term_type_id', { count: 'exact' });

    if (searchQuery) {
        if (filterBy === 'id') {
            termsQuery = termsQuery.ilike('id', `%${searchQuery}%`);
        } else if (filterBy === 'term') {
            termsQuery = termsQuery.ilike('term', `%${searchQuery}%`);
        } else if (filterBy === 'definition') {
            termsQuery = termsQuery.ilike('definition', `%${searchQuery}%`);
        } else if (filterBy === 'example') {
            termsQuery = termsQuery.ilike('example', `%${searchQuery}%`);
        } else if (filterBy === 'priority') {
            termsQuery = termsQuery.ilike('priority', `%${searchQuery}%`);
        } else if (filterBy === 'term_type_id') {
            termsQuery = termsQuery.ilike('term_type_id', `%${searchQuery}%`);
        }
    }

    const { data: terms, error, count: totalTermsCount } = await termsQuery.range(start, end);

    if (error) {
        console.error('Error fetching terms:', JSON.stringify(error, null, 2));
        return <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-red-500">Error loading terms.</div>;
    }

    const processedTerms = terms?.map((termItem) => ({
        ...termItem,
        id_short: <CopyToClipboard textToCopy={termItem.id}><span title={termItem.id}>{String(termItem.id).substring(0, 8)}...</span></CopyToClipboard>,
        created_at_formatted: new Date(termItem.created_datetime_utc).toLocaleDateString(),
        modified_at_formatted: termItem.modified_datetime_utc ? new Date(termItem.modified_datetime_utc).toLocaleDateString() : 'N/A',
        term_type_id_short: termItem.term_type_id ? <CopyToClipboard textToCopy={termItem.term_type_id}><span title={termItem.term_type_id}>{String(termItem.term_type_id).substring(0, 8)}...</span></CopyToClipboard> : 'N/A',
        actions: (
            <div className="flex space-x-2">
                <Link
                    href={`/admin/terms/${termItem.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                >
                    Edit
                </Link>
                {/* Delete functionality will be on the edit page for confirmation */}
            </div>
        ),
    })) || [];

    const termsHeaders = [
        { key: 'id_short', label: 'ID' },
        { key: 'created_at_formatted', label: 'Created' },
        { key: 'modified_at_formatted', label: 'Modified' },
        { key: 'term', label: 'Term' },
        { key: 'definition', label: 'Definition' },
        { key: 'example', label: 'Example' },
        { key: 'priority', label: 'Priority' },
        { key: 'term_type_id_short', label: 'Term Type ID' },
        { key: 'actions', label: 'Actions' },
    ];

    const termsFilterOptions: FilterOption[] = [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'term', label: 'Term', type: 'text' },
        { key: 'definition', label: 'Definition', type: 'text' },
        { key: 'example', label: 'Example', type: 'text' },
        { key: 'priority', label: 'Priority', type: 'text' },
        { key: 'term_type_id', label: 'Term Type ID', type: 'text' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Terms Management</h2>
                <Link href="/admin/terms/create">
                    <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors border border-gray-300 dark:border-gray-600">
                        Create New Term
                    </button>
                </Link>
            </div>
            <div className="mb-4">
                <FilterControls filterOptions={termsFilterOptions} defaultFilterKey="term" placeholder="Search terms..." />
            </div>
            <div className="my-8"></div>
            <AdminTable
                headers={termsHeaders}
                data={processedTerms}
                cardTitleKey="term"
            />
            <PaginationControls
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalTermsCount || 0}
            />
        </div>
    );
}