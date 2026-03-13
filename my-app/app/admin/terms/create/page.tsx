import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';

// Server Action
async function createTerm(formData: FormData) {
    'use server';

    const supabase = await createClient();

    const { error } = await supabase
        .from('terms')
        .insert({
            term: formData.get('term') as string,
            definition: formData.get('definition') as string,
            example: formData.get('example') as string,
            priority: formData.get('priority') ? Number(formData.get('priority')) : 0, // Default to 0 if null
            term_type_id: formData.get('term_type_id') ? Number(formData.get('term_type_id')) : null,
            // created_datetime_utc will default to now()
            // modified_datetime_utc will be null initially
        });

    if (error) {
        console.error('Error creating term:', error);
    } else {
        redirect('/admin/terms'); // Redirect back to terms list after creation
    }
}

export default async function CreateTermPage() {
    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Create New Term</h2>

            <form action={createTerm} className="space-y-6">
                {/* Term */}
                <div>
                    <label htmlFor="term" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Term</label>
                    <input
                        type="text"
                        id="term"
                        name="term"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Definition */}
                <div>
                    <label htmlFor="definition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Definition</label>
                    <textarea
                        id="definition"
                        name="definition"
                        rows={3}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    ></textarea>
                </div>

                {/* Example */}
                <div>
                    <label htmlFor="example" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Example</label>
                    <textarea
                        id="example"
                        name="example"
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

                {/* Term Type ID */}
                <div>
                    <label htmlFor="term_type_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Term Type ID</label>
                    <input
                        type="number"
                        id="term_type_id"
                        name="term_type_id"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div className="flex justify-start">
                    <SubmitButton formAction={createTerm} pendingText="Creating...">Create Term</SubmitButton>
                </div>
            </form>
        </div>
    );
}