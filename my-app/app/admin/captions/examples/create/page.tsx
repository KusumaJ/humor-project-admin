import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';

// Server Action
async function createCaptionExample(formData: FormData) {
    'use server';

    const supabase = await createClient();

    const { error } = await supabase
        .from('caption_examples')
        .insert({
            image_description: formData.get('image_description') as string,
            caption: formData.get('caption') as string,
            explanation: formData.get('explanation') as string,
            priority: formData.get('priority') ? Number(formData.get('priority')) : 0,
            image_id: formData.get('image_id') as string,
            // created_datetime_utc will default to now()
            // modified_datetime_utc will be null initially
        });

    if (error) {
        console.error('Error creating caption example:', error);
    } else {
        redirect('/admin/captions/examples'); // Redirect back to list after creation
    }
}

export default async function CreateCaptionExamplePage() {
    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Create New Caption Example</h2>

            <form action={createCaptionExample} className="space-y-6">
                {/* Image Description */}
                <div>
                    <label htmlFor="image_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image Description</label>
                    <textarea
                        id="image_description"
                        name="image_description"
                        rows={3}
                        required
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
                        required
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
                        required
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
                        defaultValue={0} // Default to 0
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div className="flex justify-start">
                    <SubmitButton formAction={createCaptionExample} pendingText="Creating...">Create Caption Example</SubmitButton>
                </div>
            </form>
        </div>
    );
}