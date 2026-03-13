import { createClient } from '@/utils/supabase/server';
import { AdminTable } from '@/components/AdminTable';
import { FilterControls, FilterOption } from '@/components/FilterControls';
import { PaginationControls } from '@/components/PaginationControls';
import { ExpandableText } from '@/components/ExpandableText';
import { CopyToClipboard } from '@/components/CopyToClipboard';
import Link from 'next/link';

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
    const requestStatus = (resolvedSearchParams.request_status as string) || 'all';

    let query = supabase
        .from('captions')
        .select('id, created_datetime_utc, content, is_public, profile_id, image_id, like_count, is_featured, caption_request_id, caption_requests(id, created_datetime_utc, profile_id, image_id)', { count: 'exact' });

    if (requestStatus === 'has_request') {
        query = query.not('caption_request_id', 'is', null);
    } else if (requestStatus === 'no_request') {
        query = query.is('caption_request_id', null);
    }

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
        } else if (filterBy === 'caption_request_id') {
            query = query.ilike('caption_requests.id', `%${searchQuery}%`);
        } else if (filterBy === 'caption_request_profile_id') {
            query = query.ilike('caption_requests.profile_id', `%${searchQuery}%`);
        } else if (filterBy === 'caption_request_image_id') {
            query = query.ilike('caption_requests.image_id', `%${searchQuery}%`);
        } else {
            // Fallback for default or unrecognized filterBy
            query = query.ilike('content', `%${searchQuery}%`);
        }
    }

    const { data: captions, error, count: totalCount } = await query.range(start, end);

    type CaptionWithRequest = {
        id: string;
        created_datetime_utc: string;
        content: string;
        is_public: boolean;
        profile_id: string;
        image_id: string;
        like_count: number;
        is_featured: boolean;
        caption_request_id: string | null;
        caption_requests: {
            id: string;
            created_datetime_utc: string;
            profile_id: string;
            image_id: string;
        } | null;
    };

    const typedCaptions = captions as CaptionWithRequest[] | null;


    if (error) {
        console.error('Error fetching captions:', error);
        return <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-red-500">Error loading captions.</div>;
    }

    const processedCaptions = typedCaptions?.map((caption) => ({
        ...caption,
        id_short: <span title={caption.id}>{caption.id.substring(0, 8)}...</span>,
        created_formatted: new Date(caption.created_datetime_utc).toLocaleDateString(),
        content: <ExpandableText text={caption.content || ''} maxLength={100} />, // Wrap content with ExpandableText
        profile_id_short: <span title={caption.profile_id}>{caption.profile_id.substring(0, 8)}...</span>,
        image_id_short: <span title={caption.image_id}>{caption.image_id.substring(0, 8)}...</span>,
        is_public_formatted: caption.is_public ? 'Yes' : 'No',
        is_featured_formatted: caption.is_featured ? 'Yes' : 'No',
        caption_request_id_short: caption.caption_requests ? <span title={caption.caption_requests.id}>{String(caption.caption_requests.id).substring(0, 8)}...</span> : 'N/A',
        caption_request_created_formatted: caption.caption_requests?.created_datetime_utc ? new Date(caption.caption_requests.created_datetime_utc).toLocaleDateString() : 'N/A',
        caption_request_profile_id_short: caption.caption_requests?.profile_id ? <span title={caption.caption_requests.profile_id}>{caption.caption_requests.profile_id.substring(0, 8)}...</span> : 'N/A',
        caption_request_image_id_short: caption.caption_requests?.image_id ? <span title={caption.caption_requests.image_id}>{caption.caption_requests.image_id.substring(0, 8)}...</span> : 'N/A',
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
        { key: 'caption_request_id_short', label: 'Req ID' },
        { key: 'caption_request_created_formatted', label: 'Req Created' },
        { key: 'caption_request_profile_id_short', label: 'Req Profile ID' },
        { key: 'caption_request_image_id_short', label: 'Req Image ID' },
    ];

    const captionFilterOptions: FilterOption[] = [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'content', label: 'Content', type: 'text' },
        { key: 'profile_id', label: 'Profile ID', type: 'text' },
        { key: 'image_id', label: 'Image ID', type: 'text' },
        { key: 'caption_request_id', label: 'Request ID', type: 'text' },
        { key: 'caption_request_profile_id', label: 'Request Profile ID', type: 'text' },
        { key: 'caption_request_image_id', label: 'Request Image ID', type: 'text' },
        {
            key: 'request_status',
            label: 'Request Status',
            type: 'select',
            options: [
                { value: 'all', label: 'All' },
                { value: 'has_request', label: 'Has Request' },
                { value: 'no_request', label: 'No Request' },
            ],
        },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            {/* Sub-navigation for Captions section */}
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <Link href="/admin/captions" className="whitespace-nowrap border-b-2 border-indigo-500 px-1 py-4 text-sm font-medium text-indigo-600" aria-current="page">Captions</Link>
                    <Link href="/admin/captions/examples" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Examples</Link>
                </nav>
            </div>
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