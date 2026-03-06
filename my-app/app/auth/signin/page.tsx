// app/auth/signin/page.tsx — Route: /auth/signin
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SignInButton from '@/components/SignInButton'

export default async function SignInPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Already logged in — send straight to admin
    // if (user) {
    //     redirect('/admin')
    // }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black">
            <div className="w-full max-w-md px-8 py-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center mb-4 text-black dark:text-white">
                    Admin Panel
                </h1>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                    Sign in to access the admin panel
                </p>
                <div className="flex justify-center">
                    <SignInButton />
                </div>
            </div>
        </div>
    )
}