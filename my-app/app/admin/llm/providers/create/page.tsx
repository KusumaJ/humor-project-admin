import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';

// Server Action
async function createLlmProvider(formData: FormData) {
    'use server';

    const supabase = await createClient();

    const { error } = await supabase
        .from('llm_providers')
        .insert({
            name: formData.get('name') as string,
            // created_datetime_utc will default to now()
        });

    if (error) {
        console.error('Error creating LLM provider:', error);
    } else {
        redirect('/admin/llm/providers'); // Redirect back to list after creation
    }
}

export default async function CreateLlmProviderPage() {
    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Create New LLM Provider</h2>

            <form action={createLlmProvider} className="space-y-6">
                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div className="flex justify-start">
                    <SubmitButton formAction={createLlmProvider} pendingText="Creating...">Create LLM Provider</SubmitButton>
                </div>
            </form>
        </div>
    );
}