import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/signin')

    const { count: profilesCount, error: profilesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

    const { count: captionsCount, error: captionsError } = await supabase
        .from('captions')
        .select('*', { count: 'exact' });

    if (profilesError || captionsError) {
        console.error('Error fetching dashboard counts:', profilesError || captionsError);
        return (
            <main className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-red-500">
                    Error loading dashboard data.
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <form action="/auth/signout" method="post">
                    <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                        Sign Out
                    </button>
                </form>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-8">Logged in as: <span className="font-semibold">{user.email}</span></p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Users</h2>
                    <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{profilesCount}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Captions</h2>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400">{captionsCount}</p>
                </div>

                {/* Add more dashboard items here */}
            </div>
        </main>
    )
}
