import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SubmitButton } from '@/components/SubmitButton';

// Server Action
async function createFlavorMix(formData: FormData) {
    'use server';

    const supabase = await createClient();

    const { error } = await supabase
        .from('humor_flavor_mix')
        .insert({
            humor_flavor_id: formData.get('humor_flavor_id'),
            caption_count: formData.get('caption_count') ? Number(formData.get('caption_count')) : null,
            created_datetime_utc: new Date().toISOString(),
        });

    if (error) {
        console.error('Error creating flavor mix:', error);
        // In a real app, you might want to return an error state
    } else {
        redirect('/admin/flavor/mix'); // Redirect back to mix management after creation
    }
}

export default async function CreateFlavorMixPage() {
    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
            {/* Sub-navigation for Flavor section */}
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <Link href="/admin/flavor" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Flavors</Link>
                    <Link href="/admin/flavor/mix" className="whitespace-nowrap border-b-2 border-indigo-500 px-1 py-4 text-sm font-medium text-indigo-600" aria-current="page">Mixes</Link>
                    <Link href="/admin/flavor/steps" className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">Steps</Link>
                </nav>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create New Flavor Mix</h2>

            <form action={createFlavorMix} className="space-y-4">
                <div>
                    <label htmlFor="humor_flavor_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Humor Flavor ID</label>
                    <input
                        type="text"
                        id="humor_flavor_id"
                        name="humor_flavor_id"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <div>
                    <label htmlFor="caption_count" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Caption Count</label>
                    <input
                        type="number"
                        id="caption_count"
                        name="caption_count"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <SubmitButton formAction={createFlavorMix} pendingText="Creating...">Create Flavor Mix</SubmitButton>
            </form>
        </div>
    );
}