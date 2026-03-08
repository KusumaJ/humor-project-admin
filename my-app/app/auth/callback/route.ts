// app/auth/callback/route.ts — Route: /auth/callback
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Successfully authenticated — redirect to admin
            return NextResponse.redirect(`${origin}/admin`)
        }
    }

    // On error, redirect back to sign-in
    return NextResponse.redirect(`${origin}/auth/signin`)
}