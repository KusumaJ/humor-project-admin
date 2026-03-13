import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';

// Server Actions
async function updateCaptionExample(formData: FormData) {
    'use server';

    const supabase = await createClient();
    const id = formData.get('id') as string;

    const { error } = await supabase
        .from('caption_examples')
        .update({
            image_description: formData.get('image_description') as string,
            caption: formData.get('caption') as string,
            explanation: formData.get('explanation') as string,
            priority: formData.get('priority') ? Number(formData.get('priority')) : 0,
            image_id: formData.get('image_id') as string,
            modified_datetime_utc: new Date().toISOString(), // Update modified timestamp
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating caption example:', error);
    } else {
        redirect('/admin/captions/examples'); // Redirect back to list after update
    }
}

async function deleteCaptionExample(id: string) {
    'use server';

    const supabase = await createClient();

    const { error } = await supabase
        .from('caption_examples')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting caption example:', error);
    } else {
        redirect('/admin/captions/examples'); // Redirect back to list after delete
    }
}

export default async function CaptionExampleDetailPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;

    const supabase = await createClient();
    const { data: captionExample, error } = await supabase
        .from('caption_examples')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

    if (error || !captionExample) {
        console.error('Error fetching caption example:', error ? error.message : 'Caption Example not found');
        notFound();
    }

    // Bind the ID to the delete action
    const boundDeleteCaptionExample = deleteCaptionExample.bind(null, String(captionExample.id));

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Edit Caption Example: {String(captionExample.id).substring(0, 8)}...</h2>

            <form action={updateCaptionExample} className="space-y-6">
                <input type="hidden" name="id" value={captionExample.id} />

                {/* Image Description */}
                <div>
                    <label htmlFor="image_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image Description</label>
                    <textarea
                        id="image_description"
                        name="image_description"
                        rows={3}
                        defaultValue={captionExample.image_description || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    ></textarea>
                </div>

                {/* Caption */}
                <div>
                    <label htmlFor="caption" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Caption</label>
                    <textarea
                        id="caption"
                        name="caption"
                        rows={3}
                        defaultValue={captionExample.caption || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    ></textarea>
                </div>

                {/* Explanation */}
                <div>
                    <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Explanation</label>
                    <textarea
                        id="explanation"
                        name="explanation"
                        rows={3}
                        defaultValue={captionExample.explanation || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    ></textarea>
                </div>

                {/* Priority */}
                <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                    <input
                        type="number"
                        id="priority"
                        name="priority"
                        defaultValue={captionExample.priority || ''}
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
                        defaultValue={captionExample.image_id || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div className="flex justify-between items-center">
                    <SubmitButton formAction={updateCaptionExample} pendingText="Updating...">Update Caption Example</SubmitButton>
                    <SubmitButton formAction={boundDeleteCaptionExample} pendingText="Deleting..." className="bg-red-600 hover:bg-red-700">Delete Caption Example</SubmitButton>
                </div>
            </form>
        </div>
    );
}