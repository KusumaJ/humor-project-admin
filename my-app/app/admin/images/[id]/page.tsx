import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import { SubmitButton } from '@/components/SubmitButton';
// import { experimental_useFormStatus as useFormStatus } from 'react-dom'; // This import is not needed in a Server Component

// Server Actions
async function updateImage(formData: FormData) {
    'use server';

    const supabase = await createClient();
    const id = formData.get('id') as string;

    const { error } = await supabase
        .from('images')
        .update({
            url: formData.get('url'),
            is_common_use: formData.get('is_common_use') === 'on',
            profile_id: formData.get('profile_id'),
            additional_context: formData.get('additional_context'),
            is_public: formData.get('is_public') === 'on',
            image_description: formData.get('image_description'),
            celebrity_recognition: formData.get('celebrity_recognition'),
            modified_datetime_utc: new Date().toISOString(),
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating image:', error);
        // In a real app, you might want to revalidate path or return an error state
    } else {
        redirect('/admin/images'); // Redirect back to images list after update
    }
}

async function deleteImageAction(id: string) { // Renamed to avoid conflict and accept id directly
    'use server';

    const supabase = await createClient();

    const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting image:', error);
    } else {
        redirect('/admin/images'); // Redirect back to images list after delete
    }
}


export default async function ImageDetailPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;

    // UUID validation regex (standard format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!resolvedParams.id || !uuidRegex.test(resolvedParams.id)) {
        console.error('Invalid image ID provided:', resolvedParams.id);
        notFound();
    }

    const supabase = await createClient();
    const { data: image, error } = await supabase
        .from('images')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

    if (error || !image) {
        console.error('Error fetching image:', error ? error.message : 'Image not found');
        notFound();
    }

    // Bind the image ID to the delete action
    const boundDeleteImageAction = deleteImageAction.bind(null, image.id);


    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Edit Image: {image.id.substring(0, 8)}...</h2>

            <form action={updateImage} className="space-y-6">
                <input type="hidden" name="id" value={image.id} />

                {/* Image URL Display */}
                {image.url && (
                    <div className="flex flex-col items-center">
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Image</label>
                        <Image src={image.url} alt="Current Image" width={200} height={200} className="rounded-md object-cover border border-gray-300 dark:border-gray-600" />
                    </div>
                )}

                {/* URL */}
                <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL</label>
                    <input
                        type="text"
                        id="url"
                        name="url"
                        defaultValue={image.url || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Image Description */}
                <div>
                    <label htmlFor="image_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image Description</label>
                    <textarea
                        id="image_description"
                        name="image_description"
                        rows={3}
                        defaultValue={image.image_description || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    ></textarea>
                </div>

                {/* Additional Context */}
                <div>
                    <label htmlFor="additional_context" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Additional Context</label>
                    <textarea
                        id="additional_context"
                        name="additional_context"
                        rows={3}
                        defaultValue={image.additional_context || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    ></textarea>
                </div>

                {/* Celebrity Recognition */}
                <div>
                    <label htmlFor="celebrity_recognition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Celebrity Recognition</label>
                    <input
                        type="text"
                        id="celebrity_recognition"
                        name="celebrity_recognition"
                        defaultValue={image.celebrity_recognition || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Profile ID */}
                <div>
                    <label htmlFor="profile_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile ID</label>
                    <input
                        type="text"
                        id="profile_id"
                        name="profile_id"
                        defaultValue={image.profile_id || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* is_common_use */}
                <div className="flex items-center">
                    <input
                        id="is_common_use"
                        name="is_common_use"
                        type="checkbox"
                        defaultChecked={image.is_common_use}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="is_common_use" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Is Common Use</label>
                </div>

                {/* is_public */}
                <div className="flex items-center">
                    <input
                        id="is_public"
                        name="is_public"
                        type="checkbox"
                        defaultChecked={image.is_public}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Is Public</label>
                </div>

                <div className="flex justify-between items-center">
                    <SubmitButton formAction={updateImage} pendingText="Updating...">Update Image</SubmitButton>
                    <SubmitButton formAction={boundDeleteImageAction} pendingText="Deleting..." className="bg-red-600 hover:bg-red-700">Delete Image</SubmitButton>
                </div>
            </form>
        </div>
    );
}
