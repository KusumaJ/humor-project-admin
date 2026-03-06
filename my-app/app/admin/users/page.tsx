import { createClient } from '@/utils/supabase/server'

export default async function AdminUsersPage() {
    const supabase = createClient()

    const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_datetime_utc', { ascending: false })
        .limit(50)

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                User Management
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Superadmin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            In Study
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Joined
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users?.map((user) => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {user.first_name} {user.last_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {user.is_superadmin ? (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Admin</span>
                                ) : (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">User</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {user.is_in_study ? '✅' : '❌'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {new Date(user.created_datetime_utc).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}