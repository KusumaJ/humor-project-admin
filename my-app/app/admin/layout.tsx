import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/access-denied')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_superadmin, email')
        .eq('id', user.id)
        .single()

    if (!profile?.is_superadmin) {
        redirect('/access-denied')
    }

    return { user, profile }
}

export default async function AdminLayout({
                                              children,
                                          }: {
    children: React.ReactNode
}) {
    const { profile } = await getUser()

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Admin Header */}
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-8">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                🛠️ Admin Panel
                            </h1>
                            <nav className="flex space-x-4">
                                <Link
                                    href="/admin"
                                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/admin/users"
                                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                >
                                    Users
                                </Link>
                                <Link
                                    href="/admin/images"
                                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                >
                                    Images
                                </Link>
                                <Link
                                    href="/admin/captions"
                                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                >
                                    Captions
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {profile.email}
              </span>
                            <Link
                                href="/"
                                className="text-sm text-blue-500 hover:text-blue-600"
                            >
                                View Site
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}