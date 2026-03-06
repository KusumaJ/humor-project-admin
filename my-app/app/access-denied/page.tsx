import Link from 'next/link'

export default async function AccessDeniedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
            <div className="max-w-md w-full text-center p-8">
                <div className="mb-8">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Access Denied
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        You don't have permission to access the admin panel.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/auth/signin"
                        className="block w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors"
                    >
                        Log in with another email
                    </Link>

                </div>

                <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
                    If you believe this is a mistake, please contact an administrator.
                </p>
            </div>
        </div>
    )
}