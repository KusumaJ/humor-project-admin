// app/admin/page.tsx — Route: /admin
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/signin')

    return (
        <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Admin Dashboard</h1>
                <form action="/auth/signout" method="post">
                    <button type="submit" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                        Sign Out
                    </button>
                </form>
            </div>
            <p>Logged in as: {user.email}</p>
        </main>
    )
}