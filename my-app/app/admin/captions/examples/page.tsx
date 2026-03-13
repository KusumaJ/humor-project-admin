import { createClient } from '@/utils/supabase/server';
import { AdminTable } from '@/components/AdminTable';
import { FilterControls, FilterOption } from '@/components/FilterControls';
import { PaginationControls } from '@/components/PaginationControls';
import { ExpandableText } from '@/components/ExpandableText';
import Link from 'next/link';

const DEFAULT_PAGE_SIZE = 10;

export default async function AdminCaptionExamplesPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const supabase = await createClient();

    const resolvedSearchParams = (await searchParams) || {};
    const currentPage = Number(resolvedSearchParams.page) || 1;
    const searchQuery = (resolvedSearchParams.q as string) || '';
    const filterBy = (resolvedSearchParams.filterBy as string) || 'caption'; // Default filter property for caption_examples
    const pageSize = DEFAULT_PAGE_SIZE;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize - 1;

    let query = supabase
        .from('caption_examples')
        .select('id, created_datetime_utc, modified_datetime_utc, image_description, caption, explanation, priority, image_id', { count: 'exact' });

    if (searchQuery) {
        if (filterBy === 'id') {
            query = query.ilike('id', `%${searchQuery}%`);
        } else if (filterBy === 'image_description') {
            query = query.ilike('image_description', `%${searchQuery}%`);
        } else if (filterBy === 'caption') {
            query = query.ilike('caption', `%${searchQuery}%`);
        } else if (filterBy === 'explanation') {
            query = query.ilike('explanation', `%${searchQuery}%`);
        } else if (filterBy === 'priority') {
            query = query.ilike('priority', `%${searchQuery}%`);
        } else if (filterBy === 'image_id') {
            query = query.ilike('image_id', `%${searchQuery}%`);
        }
    }

    const { data: captionExamples, error, count: totalCount } = await query.range(start, end);

    if (error) {
        console.error('Error fetching caption examples:', JSON.stringify(error, null, 2));
        return <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-red-500">Error loading caption examples.</div>;
    }

    const processedCaptionExamples = captionExamples?.map((example) => ({
        ...example,
        id_short: <span title={example.id}>{String(example.id).substring(0, 8)}...</span>,
        created_at_formatted: new Date(example.created_datetime_utc).toLocaleDateString(),
        modified_at_formatted: example.modified_datetime_utc ? new Date(example.modified_datetime_utc).toLocaleDateString() : 'N/A',
        image_description: <ExpandableText text={example.image_description || ''} maxLength={50} />,
        caption: <ExpandableText text={example.caption || ''} maxLength={50} />,
        explanation: <ExpandableText text={example.explanation || ''} maxLength={50} />,
        image_id_short: example.image_id ? <span title={example.image_id}>{example.image_id.substring(0, 8)}...</span> : 'N/A',
        actions: (
            <div className="flex space-x-2">
                <Link
                    href={`/admin/captions/examples/${example.id}`}
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
        { key: 'modified_at_formatted', label: 'Modified' },
        { key: 'image_description', label: 'Image Description' },
        { key: 'caption', label: 'Caption' },
        { key: 'explanation', label: 'Explanation' },
        { key: 'priority', label: 'Priority' },
        { key: 'image_id_short', label: 'Image ID' },
        { key: 'actions', label: 'Actions' },
    ];

    const filterOptions: FilterOption[] = [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'image_description', label: 'Image Description', type: 'text' },
        { key: 'caption', label: 'Caption', type: 'text' },
        { key: 'explanation', label: 'Explanation', type: 'text' },
        { key: 'priority', label: 'Priority', type: 'text' },
        { key: 'image_id', label: 'Image ID', type: 'text' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            {/* Sub-navigation for Captions section */}
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <Link href="/admin/captions" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Captions</Link>
                    <Link href="/admin/captions/examples" className="whitespace-nowrap border-b-2 border-indigo-500 px-1 py-4 text-sm font-medium text-indigo-600" aria-current="page">Examples</Link>
                </nav>
            </div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Caption Examples Management</h2>
                <Link href="/admin/captions/examples/create">
                    <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors border border-gray-300 dark:border-gray-600">
                        Create New Caption Example
                    </button>
                </Link>
            </div>
            <div className="mb-4">
                <FilterControls filterOptions={filterOptions} defaultFilterKey="caption" placeholder="Search caption examples..." />
            </div>
            <div className="my-8"></div>
            <AdminTable
                headers={headers}
                data={processedCaptionExamples}
                cardTitleKey="caption"
            />
            <PaginationControls
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalCount || 0}
            />
        </div>
    );
}