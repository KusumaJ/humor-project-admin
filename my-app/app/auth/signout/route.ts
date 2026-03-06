// app/auth/signout/route.ts
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/signin')
}