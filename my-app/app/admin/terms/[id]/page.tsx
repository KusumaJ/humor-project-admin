import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';
import { CopyToClipboard } from '@/components/CopyToClipboard';

// Server Actions
async function updateTerm(formData: FormData) {
    'use server';

    const supabase = await createClient();
    const id = formData.get('id') as string;

    const { error } = await supabase
        .from('terms')
        .update({
            term: formData.get('term') as string,
            definition: formData.get('definition') as string,
            example: formData.get('example') as string,
            priority: formData.get('priority') ? Number(formData.get('priority')) : null,
            term_type_id: formData.get('term_type_id') ? Number(formData.get('term_type_id')) : null,
            modified_datetime_utc: new Date().toISOString(), // Update modified timestamp
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating term:', error);
    } else {
        redirect('/admin/terms'); // Redirect back to terms list after update
    }
}

async function deleteTerm(id: string) {
    'use server';

    const supabase = await createClient();

    const { error } = await supabase
        .from('terms')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting term:', error);
    } else {
        redirect('/admin/terms'); // Redirect back to terms list after delete
    }
}

export default async function TermDetailPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;

    const supabase = await createClient();
    const { data: term, error } = await supabase
        .from('terms')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

    if (error || !term) {
        console.error('Error fetching term:', error ? error.message : 'Term not found');
        notFound();
    }

    // Bind the ID to the delete action
    const boundDeleteTerm = deleteTerm.bind(null, String(term.id));

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Edit Term: <CopyToClipboard textToCopy={term.id}>{String(term.id).substring(0, 8)}...</CopyToClipboard></h2>

            <form action={updateTerm} className="space-y-6">
                <input type="hidden" name="id" value={term.id} />

                {/* Term */}
                <div>
                    <label htmlFor="term" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Term</label>
                    <input
                        type="text"
                        id="term"
                        name="term"
                        defaultValue={term.term || ''}
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
                        defaultValue={term.definition || ''}
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
                        defaultValue={term.example || ''}
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
                        defaultValue={term.priority || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Term Type ID */}
                <div>
                    <label htmlFor="term_type_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Term Type ID</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            id="term_type_id"
                            name="term_type_id"
                            defaultValue={term.term_type_id || ''}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
                        {term.term_type_id && <CopyToClipboard textToCopy={String(term.term_type_id)}>{String(term.term_type_id)}</CopyToClipboard>}

                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <SubmitButton formAction={updateTerm} pendingText="Updating...">Update Term</SubmitButton>
                    <SubmitButton formAction={boundDeleteTerm} pendingText="Deleting..." className="bg-red-600 hover:bg-red-700">Delete Term</SubmitButton>
                </div>
            </form>
        </div>
    );
}