import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';

// Server Actions
async function updateLlmProvider(formData: FormData) {
    'use server';

    const supabase = await createClient();
    const id = formData.get('id') as string;

    const { error } = await supabase
        .from('llm_providers')
        .update({
            name: formData.get('name') as string,
            // created_datetime_utc is not updated
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating LLM provider:', error);
    } else {
        redirect('/admin/llm/providers'); // Redirect back to list after update
    }
}

async function deleteLlmProvider(id: string) {
    'use server';

    const supabase = await createClient();

    const { error } = await supabase
        .from('llm_providers')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting LLM provider:', error);
    } else {
        redirect('/admin/llm/providers'); // Redirect back to list after delete
    }
}

export default async function LlmProviderDetailPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;

    const supabase = await createClient();
    const { data: llmProvider, error } = await supabase
        .from('llm_providers')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

    if (error || !llmProvider) {
        console.error('Error fetching LLM provider:', error ? error.message : 'LLM Provider not found');
        notFound();
    }

    // Bind the ID to the delete action
    const boundDeleteLlmProvider = deleteLlmProvider.bind(null, String(llmProvider.id));

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Edit LLM Provider: {String(llmProvider.id).substring(0, 8)}...</h2>

            <form action={updateLlmProvider} className="space-y-6">
                <input type="hidden" name="id" value={llmProvider.id} />

                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        defaultValue={llmProvider.name || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div className="flex justify-between items-center">
                    <SubmitButton formAction={updateLlmProvider} pendingText="Updating...">Update LLM Provider</SubmitButton>
                    <SubmitButton formAction={boundDeleteLlmProvider} pendingText="Deleting..." className="bg-red-600 hover:bg-red-700">Delete LLM Provider</SubmitButton>
                </div>
            </form>
        </div>
    );
}