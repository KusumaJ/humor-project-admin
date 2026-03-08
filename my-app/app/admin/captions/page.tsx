import { createClient } from '@/utils/supabase/server';
import { AdminTable } from '@/components/AdminTable';
import { FilterControls, FilterOption } from '@/components/FilterControls';
import { PaginationControls } from '@/components/PaginationControls';
import { ExpandableText } from '@/components/ExpandableText';

const DEFAULT_PAGE_SIZE = 10;

export default async function AdminCaptionsPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const supabase = await createClient();

    const resolvedSearchParams = (await searchParams) || {};
    const currentPage = Number(resolvedSearchParams.page) || 1;
    const searchQuery = (resolvedSearchParams.q as string) || '';
    const filterBy = (resolvedSearchParams.filterBy as string) || 'content'; // Default filter property
    const pageSize = DEFAULT_PAGE_SIZE;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize - 1;

    let query = supabase
        .from('captions')
        .select('id, created_datetime_utc, content, is_public, profile_id, image_id, like_count, is_featured', { count: 'exact' });

    if (searchQuery) {
        // Apply filter based on the selected property
        if (filterBy === 'id') {
            query = query.ilike('id', `%${searchQuery}%`);
        } else if (filterBy === 'content') {
            query = query.ilike('content', `%${searchQuery}%`);
        } else if (filterBy === 'profile_id') {
            query = query.ilike('profile_id', `%${searchQuery}%`);
        } else if (filterBy === 'image_id') {
            query = query.ilike('image_id', `%${searchQuery}%`);
        } else {
            // Fallback for default or unrecognized filterBy
            query = query.ilike('content', `%${searchQuery}%`);
        }
    }

    const { data: captions, error, count: totalCount } = await query.range(start, end);

    if (error) {
        console.error('Error fetching captions:', error);
        return <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-red-500">Error loading captions.</div>;
    }

    const processedCaptions = captions?.map((caption) => ({
        ...caption,
        id_short: <span title={caption.id}>{caption.id.substring(0, 8)}...</span>,
        created_formatted: new Date(caption.created_datetime_utc).toLocaleDateString(),
        content: <ExpandableText text={caption.content || ''} maxLength={100} />, // Wrap content with ExpandableText
        profile_id_short: <span title={caption.profile_id}>{caption.profile_id.substring(0, 8)}...</span>,
        image_id_short: <span title={caption.image_id}>{caption.image_id.substring(0, 8)}...</span>,
        is_public_formatted: caption.is_public ? 'Yes' : 'No',
        is_featured_formatted: caption.is_featured ? 'Yes' : 'No',
    })) || [];

    const headers = [
        { key: 'id_short', label: 'ID' },
        { key: 'created_formatted', label: 'Created' },
        { key: 'content', label: 'Content' },
        { key: 'is_public_formatted', label: 'Public' },
        { key: 'profile_id_short', label: 'Profile ID' },
        { key: 'image_id_short', label: 'Image ID' },
        { key: 'like_count', label: 'Likes' },
        { key: 'is_featured_formatted', label: 'Featured' },
    ];

    const captionFilterOptions: FilterOption[] = [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'content', label: 'Content', type: 'text' },
        { key: 'profile_id', label: 'Profile ID', type: 'text' },
        { key: 'image_id', label: 'Image ID', type: 'text' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Captions Management</h2>
            <FilterControls filterOptions={captionFilterOptions} defaultFilterKey="content" placeholder="Search captions..." />
            <div className="my-8"></div> {/* Explicit spacer div */}
            <AdminTable
                headers={headers}
                data={processedCaptions}
                cardTitleKey="content"
                // Removed pagination props
            />
            <PaginationControls
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalCount || 0}
            />
        </div>
    );
}