import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';

// Server Actions
async function updateLlmModel(formData: FormData) {
    'use server';

    const supabase = await createClient();
    const id = formData.get('id') as string;

    const { error } = await supabase
        .from('llm_models')
        .update({
            name: formData.get('name') as string,
            llm_provider_id: formData.get('llm_provider_id') ? Number(formData.get('llm_provider_id')) : null,
            provider_model_id: formData.get('provider_model_id') as string,
            is_temperature_supported: formData.get('is_temperature_supported') === 'on',
            // created_datetime_utc is not updated
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating LLM model:', error);
    } else {
        redirect('/admin/llm/models'); // Redirect back to list after update
    }
}

async function deleteLlmModel(id: string) {
    'use server';

    const supabase = await createClient();

    const { error } = await supabase
        .from('llm_models')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting LLM model:', error);
    } else {
        redirect('/admin/llm/models'); // Redirect back to list after delete
    }
}

export default async function LlmModelDetailPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;

    const supabase = await createClient();
    const { data: llmModel, error } = await supabase
        .from('llm_models')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

    if (error || !llmModel) {
        console.error('Error fetching LLM model:', error ? error.message : 'LLM Model not found');
        notFound();
    }

    // Bind the ID to the delete action
    const boundDeleteLlmModel = deleteLlmModel.bind(null, String(llmModel.id));

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Edit LLM Model: {String(llmModel.id).substring(0, 8)}...</h2>

            <form action={updateLlmModel} className="space-y-6">
                <input type="hidden" name="id" value={llmModel.id} />

                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        defaultValue={llmModel.name || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* LLM Provider ID */}
                <div>
                    <label htmlFor="llm_provider_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LLM Provider ID</label>
                    <input
                        type="number"
                        id="llm_provider_id"
                        name="llm_provider_id"
                        defaultValue={llmModel.llm_provider_id || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Provider Model ID */}
                <div>
                    <label htmlFor="provider_model_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Provider Model ID</label>
                    <input
                        type="text"
                        id="provider_model_id"
                        name="provider_model_id"
                        defaultValue={llmModel.provider_model_id || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Is Temperature Supported */}
                <div className="flex items-center">
                    <input
                        id="is_temperature_supported"
                        name="is_temperature_supported"
                        type="checkbox"
                        defaultChecked={llmModel.is_temperature_supported}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="is_temperature_supported" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Is Temperature Supported</label>
                </div>

                <div className="flex justify-between items-center">
                    <SubmitButton formAction={updateLlmModel} pendingText="Updating...">Update LLM Model</SubmitButton>
                    <SubmitButton formAction={boundDeleteLlmModel} pendingText="Deleting..." className="bg-red-600 hover:bg-red-700">Delete LLM Model</SubmitButton>
                </div>
            </form>
        </div>
    );
}