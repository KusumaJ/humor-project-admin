import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';
import Link from 'next/link';

// Server Actions
async function updateHumorFlavorMix(formData: FormData) {
    'use server';

    const supabase = await createClient();
    const id = formData.get('id') as string;

    const { error } = await supabase
        .from('humor_flavor_mix')
        .update({
            humor_flavor_id: formData.get('humor_flavor_id') ? Number(formData.get('humor_flavor_id')) : null,
            caption_count: formData.get('caption_count') ? Number(formData.get('caption_count')) : null,
            modified_datetime_utc: new Date().toISOString(), // Assuming this column exists in the schema
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating humor_flavor_mix:', error);
        // In a real app, you might want to revalidate path or return an error state
    } else {
        redirect('/admin/flavor/mix'); // Redirect back to mix list after update
    }
}

async function deleteHumorFlavorMix(id: string) {
    'use server';

    const supabase = await createClient();

    const { error } = await supabase
        .from('humor_flavor_mix')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting humor_flavor_mix:', error);
    } else {
        redirect('/admin/flavor/mix'); // Redirect back to mix list after delete
    }
}

export default async function HumorFlavorMixDetailPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;

    const supabase = await createClient();
    const { data: humorFlavorMix, error } = await supabase
        .from('humor_flavor_mix')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

    if (error || !humorFlavorMix) {
        console.error('Error fetching humor_flavor_mix:', error ? error.message : 'Humor Flavor Mix not found');
        notFound();
    }

    // Bind the ID to the delete action
    const boundDeleteHumorFlavorMixAction = deleteHumorFlavorMix.bind(null, String(humorFlavorMix.id));

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
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Edit Humor Flavor Mix:</h2>

            <form action={updateHumorFlavorMix} className="space-y-6">
                <input type="hidden" name="id" value={humorFlavorMix.id} />

                {/* Humor Flavor ID */}
                <div>
                    <label htmlFor="humor_flavor_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Humor Flavor ID</label>
                    <input
                        type="number" // Assuming it's a number
                        id="humor_flavor_id"
                        name="humor_flavor_id"
                        defaultValue={humorFlavorMix.humor_flavor_id || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Caption Count */}
                <div>
                    <label htmlFor="caption_count" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Caption Count</label>
                    <input
                        type="number" // Assuming it's a number
                        id="caption_count"
                        name="caption_count"
                        defaultValue={humorFlavorMix.caption_count || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div className="flex justify-between items-center">
                    <SubmitButton formAction={updateHumorFlavorMix} pendingText="Updating...">Update Humor Flavor Mix</SubmitButton>
                    <SubmitButton formAction={boundDeleteHumorFlavorMixAction} pendingText="Deleting..." className="bg-red-600 hover:bg-red-700">Delete Humor Flavor Mix</SubmitButton>
                </div>
            </form>
        </div>
    );
}