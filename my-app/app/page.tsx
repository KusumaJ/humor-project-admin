import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  console.log("1. Route hit, starting execution...");

  const supabase = await createClient();
  console.log("2. Supabase client created successfully.");

  console.log("3. Fetching user from Supabase...");
  const { data: { user } } = await supabase.auth.getUser();
  console.log("4. User fetched:", user?.email || "No user found");

  if (user) {
    console.log("5. Redirecting to /admin");
    redirect('/admin')
  } else {
    console.log("5. Redirecting to /auth/signin");
    redirect('/auth/signin')
  }
}