import { createClient } from '@/utils/supabase/server';
import { AdminTable } from '@/components/AdminTable';
import { FilterControls, FilterOption, ViewOption } from '@/components/FilterControls';
import { ExpandableText } from '@/components/ExpandableText';
import { ImageTableView } from '@/components/ImageTableView';
import { PaginationControls } from '@/components/PaginationControls';
import Image from 'next/image';
import Link from 'next/link';

const DEFAULT_PAGE_SIZE = 10;

export default async function AdminImagesPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const supabase = await createClient();

    const resolvedSearchParams = (await searchParams) || {};
    const currentPage = Number(resolvedSearchParams.page) || 1;
    const searchQuery = (resolvedSearchParams.q as string) || '';
    const filterBy = (resolvedSearchParams.filterBy as string) || 'image_description'; // Default filter property
    const currentView = (resolvedSearchParams.view as string) || 'list'; // Default view is 'list'
    const pageSize = DEFAULT_PAGE_SIZE;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize - 1;

    let query = supabase
        .from('images')
        .select('id, created_datetime_utc, modified_datetime_utc, url, is_common_use, profile_id, additional_context, is_public, image_description, celebrity_recognition', { count: 'exact' });

    // Apply text search filter
    if (searchQuery) {
        if (filterBy === 'id') {
            query = query.ilike('id', `%${searchQuery}%`);
        } else if (filterBy === 'url') {
            query = query.ilike('url', `%${searchQuery}%`);
        } else if (filterBy === 'profile_id') {
            // Changed to eq for UUIDs
            // If partial matching for UUIDs is desired, it requires casting the column to text in the DB
            query = query.eq('profile_id', searchQuery);
        } else if (filterBy === 'additional_context') {
            query = query.ilike('additional_context', `%${searchQuery}%`);
        } else if (filterBy === 'image_description') {
            query = query.ilike('image_description', `%${searchQuery}%`);
        } else if (filterBy === 'celebrity_recognition') {
            query = query.ilike('celebrity_recognition', `%${searchQuery}%`);
        }
    }

    // Apply boolean filters
    if (resolvedSearchParams.is_common_use === 'true') {
        query = query.eq('is_common_use', true);
    } else if (resolvedSearchParams.is_common_use === 'false') {
        query = query.eq('is_common_use', false);
    }

    if (resolvedSearchParams.is_public === 'true') {
        query = query.eq('is_public', true);
    } else if (resolvedSearchParams.is_public === 'false') {
        query = query.eq('is_public', false);
    }


    const { data: images, error, count: totalCount } = await query.range(start, end);

    if (error) {
        console.error('Error fetching images:', error);
        return <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-red-500">Error loading images.</div>;
    }

    const processedImages = images?.map((image) => ({
        ...image,
        id_short: <span key={`id-${image.id}`} title={image.id}>{image.id.substring(0, 8)}...</span>,
        created_formatted: new Date(image.created_datetime_utc).toLocaleDateString(),
        url_thumbnail: image.url ? (
            <Link key={`thumb-link-${image.id}`} href={`/admin/images/${image.id}`}>
                <Image key={`thumb-${image.id}`} src={image.url} alt="thumbnail" width={100} height={100} className="rounded-md object-cover" />
            </Link>
        ) : <span key={`thumb-na-${image.id}`}>N/A</span>,
        profile_id_short: image.profile_id ? <span key={`profile-${image.id}`} title={image.profile_id}>{image.profile_id.substring(0, 8)}...</span> : <span key={`profile-na-${image.id}`}>N/A</span>,
        additional_context: <ExpandableText key={`context-${image.id}`} text={image.additional_context || ''} maxLength={50} />,
        image_description: <ExpandableText key={`desc-${image.id}`} text={image.image_description || ''} maxLength={100} />,
        celebrity_recognition: <ExpandableText key={`celeb-${image.id}`} text={image.celebrity_recognition || ''} maxLength={50} />,
        is_common_use_formatted: image.is_common_use ? 'Yes' : 'No',
        is_public_formatted: image.is_public ? 'Yes' : 'No',
    })) || [];

    const headers = [
        { key: 'url_thumbnail', label: 'Thumbnail' },
        { key: 'id_short', label: 'ID' },
        { key: 'created_formatted', label: 'Created' },
        { key: 'image_description', label: 'Description' },
        { key: 'is_public_formatted', label: 'Public' },
        { key: 'is_common_use_formatted', label: 'Common Use' },
        { key: 'profile_id_short', label: 'Uploader ID' },
        { key: 'additional_context', label: 'Context' },
        { key: 'celebrity_recognition', label: 'Celebrities' },
    ];

    const imageFilterOptions: FilterOption[] = [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'url', label: 'URL', type: 'text' },
        { key: 'profile_id', label: 'Uploader ID', type: 'text' },
        { key: 'additional_context', label: 'Additional Context', type: 'text' },
        { key: 'image_description', label: 'Image Description', type: 'text' },
        { key: 'celebrity_recognition', label: 'Celebrity Recognition', type: 'text' },
        { key: 'is_common_use', label: 'Common Use', type: 'boolean' },
        { key: 'is_public', label: 'Public', type: 'boolean' },
    ];

    const imageViewOptions: ViewOption[] = [
        { key: 'list', label: 'List View' },
        { key: 'table', label: 'Image View' },
    ];


    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Images Management</h2>
                <Link href="/admin/images/create">
                    <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors border border-gray-300 dark:border-gray-600">
                        Create New Image
                    </button>
                </Link>
            </div>
            <FilterControls
                filterOptions={imageFilterOptions}
                defaultFilterKey="image_description"
                placeholder="Search images..."
                viewOptions={imageViewOptions}
                defaultViewKey="list"
            />
            <div className="my-8"></div> {/* Explicit spacer div */}
            {currentView === 'list' ? (
                <AdminTable
                    headers={headers}
                    data={processedImages}
                    cardTitleKey="image_description"
                    basePath="/admin/images"
                />
            ) : (
                <ImageTableView images={processedImages} basePath="/admin/images" />
            )}
            <PaginationControls
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalCount || 0}
            />
        </div>
    );
}