import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';

// Server Actions
async function updateCaptionRequest(formData: FormData) {
    'use server';

    const supabase = await createClient();
    const id = formData.get('id') as string;

    const { error } = await supabase
        .from('caption_requests')
        .update({
            profile_id: formData.get('profile_id') as string,
            image_id: formData.get('image_id') as string,
            // created_datetime_utc is not updated
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating caption request:', error);
    } else {
        redirect('/admin/captions/requests'); // Redirect back to list after update
    }
}

async function deleteCaptionRequest(id: string) {
    'use server';

    const supabase = await createClient();

    const { error } = await supabase
        .from('caption_requests')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting caption request:', error);
    } else {
        redirect('/admin/captions/requests'); // Redirect back to list after delete
    }
}

export default async function CaptionRequestDetailPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;

    const supabase = await createClient();
    const { data: captionRequest, error } = await supabase
        .from('caption_requests')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

    if (error || !captionRequest) {
        console.error('Error fetching caption request:', error ? error.message : 'Caption Request not found');
        notFound();
    }

    // Bind the ID to the delete action
    const boundDeleteCaptionRequest = deleteCaptionRequest.bind(null, String(captionRequest.id));

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Edit Caption Request: {String(captionRequest.id).substring(0, 8)}...</h2>

            <form action={updateCaptionRequest} className="space-y-6">
                <input type="hidden" name="id" value={captionRequest.id} />

                {/* Profile ID */}
                <div>
                    <label htmlFor="profile_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile ID</label>
                    <input
                        type="text"
                        id="profile_id"
                        name="profile_id"
                        defaultValue={captionRequest.profile_id || ''}
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
                        defaultValue={captionRequest.image_id || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div className="flex justify-between items-center">
                    <SubmitButton formAction={updateCaptionRequest} pendingText="Updating...">Update Caption Request</SubmitButton>
                    <SubmitButton formAction={boundDeleteCaptionRequest} pendingText="Deleting..." className="bg-red-600 hover:bg-red-700">Delete Caption Request</SubmitButton>
                </div>
            </form>
        </div>
    );
}