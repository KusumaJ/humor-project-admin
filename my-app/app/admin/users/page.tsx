import { createClient } from '@/utils/supabase/server';
import { AdminTable } from '@/components/AdminTable';
import { FilterControls, FilterOption } from '@/components/FilterControls';
import { PaginationControls } from '@/components/PaginationControls';
import { CopyToClipboard } from '@/components/CopyToClipboard'; // Import CopyToClipboard

const DEFAULT_PAGE_SIZE = 10;

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const supabase = await createClient();

    const resolvedSearchParams = (await searchParams) || {};
    const currentPage = Number(resolvedSearchParams.page) || 1;
    const searchQuery = (resolvedSearchParams.q as string) || '';
    const filterBy = (resolvedSearchParams.filterBy as string) || 'email'; // Default filter property
    const pageSize = DEFAULT_PAGE_SIZE;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize - 1;

    let query = supabase
        .from('profiles')
        .select('id, created_datetime_utc, first_name, last_name, email, is_superadmin, is_in_study, is_matrix_admin', { count: 'exact' });

    // Apply text search filter
    if (searchQuery) {
        if (filterBy === 'id') {
            query = query.ilike('id', `%${searchQuery}%`);
        } else if (filterBy === 'email') {
            query = query.ilike('email', `%${searchQuery}%`);
        } else if (filterBy === 'first_name') {
            query = query.ilike('first_name', `%${searchQuery}%`);
        } else if (filterBy === 'last_name') {
            query = query.ilike('last_name', `%${searchQuery}%`);
        }
    }

    // Apply boolean filters
    if (resolvedSearchParams.is_superadmin === 'true') {
        query = query.eq('is_superadmin', true);
    } else if (resolvedSearchParams.is_superadmin === 'false') {
        query = query.eq('is_superadmin', false);
    }

    if (resolvedSearchParams.is_in_study === 'true') {
        query = query.eq('is_in_study', true);
    } else if (resolvedSearchParams.is_in_study === 'false') {
        query = query.eq('is_in_study', false);
    }

    if (resolvedSearchParams.is_matrix_admin === 'true') {
        query = query.eq('is_matrix_admin', true);
    } else if (resolvedSearchParams.is_matrix_admin === 'false') {
        query = query.eq('is_matrix_admin', false);
    }


    const { data: profiles, error, count: totalCount } = await query.range(start, end);

    if (error) {
        console.error('Error fetching profiles:', error);
        return <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-red-500">Error loading profiles.</div>;
    }

    const processedProfiles = profiles?.map((profile) => ({
        ...profile,
        id_short: (
            <CopyToClipboard key={`copy-id-${profile.id}`} textToCopy={profile.id}>
                <span title={profile.id} className="font-mono text-xs text-gray-500 dark:text-gray-400 hover:underline">
                    {profile.id.substring(0, 8)}...
                </span>
            </CopyToClipboard>
        ),
        created_formatted: new Date(profile.created_datetime_utc).toLocaleDateString(),
        name: `${profile.first_name || ''} ${profile.last_name || ''}`,
        is_superadmin_formatted: profile.is_superadmin ? 'Yes' : 'No',
        is_in_study_formatted: profile.is_in_study ? 'Yes' : 'No',
        is_matrix_admin_formatted: profile.is_matrix_admin ? 'Yes' : 'No',
    })) || [];

    const headers = [
        { key: 'id_short', label: 'ID' },
        { key: 'created_formatted', label: 'Created' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'is_superadmin_formatted', label: 'Superadmin' },
        { key: 'is_in_study_formatted', label: 'In Study' },
        { key: 'is_matrix_admin_formatted', label: 'Matrix Admin' },
    ];

    const userFilterOptions: FilterOption[] = [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'first_name', label: 'First Name', type: 'text' },
        { key: 'last_name', type: 'text', label: 'Last Name' },
        { key: 'is_superadmin', label: 'Superadmin', type: 'boolean' },
        { key: 'is_in_study', label: 'In Study', type: 'boolean' },
        { key: 'is_matrix_admin', label: 'Matrix Admin', type: 'boolean' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Users/Profiles Management</h2>
            <FilterControls filterOptions={userFilterOptions} defaultFilterKey="email" placeholder="Search users..." />
            <div className="my-8"></div> {/* Explicit spacer div */}
            <AdminTable
                headers={headers}
                data={processedProfiles}
                cardTitleKey="email"
            />
            <PaginationControls
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalCount || 0}
            />
        </div>
    );
}