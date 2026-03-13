import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
// import SignOutButton from "@/app/me/signOutButton"; // Import the SignOutButton
import { Profile } from '@/types'

export default async function Navbar() {
  console.log('Navbar component rendering...');
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, is_superadmin')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      // Handle error appropriately, e.g., redirect to an error page or show a message
    } else {
      profile = data
    }
  }

  // Redirect to sign-in if no user or not superadmin for admin routes
  if (!user && (
      // Check if current route is an admin route
      typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
  )) {
    redirect('/auth/signin')
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="shrink-0 flex items-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                Humor Project
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* Current: "border-indigo-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
              <Link
                href="/"
                className="border-indigo-500 text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              {profile?.is_superadmin && (
                <>
                  <Link
                    href="/admin"
                    className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-50 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Admin
                  </Link>
                  <Link
                    href="/admin/captions"
                    className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-50 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Captions
                  </Link>
                  <Link
                    href="/admin/flavor"
                    className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-50 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Flavor
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 dark:text-gray-300">
                  Hello, {profile?.username || user.email}!
                </span>
                <form action="/auth/signout" method="post">
                  <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                    Sign Out
                  </button>
                </form>
                {/* Removed SignOutButton */}
                {/* <SignOutButton /> */}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
