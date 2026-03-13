import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';

// Server Action
async function createCaptionRequest(formData: FormData) {
    'use server';

    const supabase = await createClient();

    const { error } = await supabase
        .from('caption_requests')
        .insert({
            profile_id: formData.get('profile_id') as string,
            image_id: formData.get('image_id') as string,
            // created_datetime_utc will default to now()
        });

    if (error) {
        console.error('Error creating caption request:', error);
    } else {
        redirect('/admin/captions/requests'); // Redirect back to list after creation
    }
}

export default async function CreateCaptionRequestPage() {
    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Create New Caption Request</h2>

            <form action={createCaptionRequest} className="space-y-6">
                {/* Profile ID */}
                <div>
                    <label htmlFor="profile_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile ID</label>
                    <input
                        type="text"
                        id="profile_id"
                        name="profile_id"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Image ID */}
                <div>
                    <label htmlFor="image_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image ID</label>
                    <input
                        type="text"
                        id="image_id"
                        name="image_id"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div className="flex justify-start">
                    <SubmitButton formAction={createCaptionRequest} pendingText="Creating...">Create Caption Request</SubmitButton>
                </div>
            </form>
        </div>
    );
}