import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';
import Link from 'next/link';

// Server Actions for Whitelist Email Addresses
async function createWhitelistEmail(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const email_address = formData.get('email_address') as string;

    const { error } = await supabase
        .from('whitelist_email_addresses')
        .insert({ email_address, created_datetime_utc: new Date().toISOString() });

    if (error) {
        console.error('Error creating whitelist email:', error);
        // In a real app, you might want to return an error state
    }
    revalidatePath('/admin/access-controls'); // Revalidate the page to show updated data
}

async function updateWhitelistEmail(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const id = formData.get('id') as string;
    const email_address = formData.get('email_address') as string;

    const { error } = await supabase
        .from('whitelist_email_addresses')
        .update({ email_address, modified_datetime_utc: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        console.error('Error updating whitelist email:', error);
    }
    revalidatePath('/admin/access-controls');
}

async function deleteWhitelistEmail(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const id = formData.get('id') as string;

    const { error } = await supabase
        .from('whitelist_email_addresses')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting whitelist email:', error);
    }
    revalidatePath('/admin/access-controls');
}

// Server Actions for Allowed Signup Domains
async function createAllowedSignupDomain(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const apex_domain = formData.get('apex_domain') as string;

    const { error } = await supabase
        .from('allowed_signup_domains')
        .insert({ apex_domain, created_datetime_utc: new Date().toISOString() });

    if (error) {
        console.error('Error creating allowed signup domain:', error);
    }
    revalidatePath('/admin/access-controls');
}

async function updateAllowedSignupDomain(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const id = formData.get('id') as string;
    const apex_domain = formData.get('apex_domain') as string;

    const { error } = await supabase
        .from('allowed_signup_domains')
        .update({ apex_domain }) // No modified_datetime_utc for this table
        .eq('id', id);

    if (error) {
        console.error('Error updating allowed signup domain:', error);
    }
    revalidatePath('/admin/access-controls');
}

async function deleteAllowedSignupDomain(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const id = formData.get('id') as string;

    const { error } = await supabase
        .from('allowed_signup_domains')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting allowed signup domain:', error);
    }
    revalidatePath('/admin/access-controls');
}


export default async function AccessControlsPage() {
    const supabase = await createClient();

    // Fetch Whitelist Email Addresses
    const { data: whitelistEmails, error: emailsError } = await supabase
        .from('whitelist_email_addresses')
        .select('id, created_datetime_utc, modified_datetime_utc, email_address')
        .order('created_datetime_utc', { ascending: false });

    if (emailsError) {
        console.error('Error fetching whitelist emails:', emailsError);
        return <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-red-500">Error loading whitelist emails.</div>;
    }

    // Fetch Allowed Signup Domains
    const { data: signupDomains, error: domainsError } = await supabase
        .from('allowed_signup_domains')
        .select('id, created_datetime_utc, apex_domain')
        .order('created_datetime_utc', { ascending: false });

    if (domainsError) {
        console.error('Error fetching signup domains:', domainsError);
        return <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-red-500">Error loading allowed signup domains.</div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Access Controls</h2>

            {/* Whitelist Email Addresses */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Whitelist Email Addresses</h3>
                    <form action={createWhitelistEmail}>
                        <input type="email" name="email_address" placeholder="New Email" required
                            className="mr-2 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                        <SubmitButton pendingText="Adding..." className="px-3 py-1 text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors border border-gray-300 dark:border-gray-600">
                            Add Email
                        </SubmitButton>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email Address</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Modified</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {whitelistEmails?.map((email) => (
                                <tr key={email.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                        <form action={updateWhitelistEmail}>
                                            <input type="hidden" name="id" value={email.id} />
                                            <input type="email" name="email_address" defaultValue={email.email_address} required
                                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                                        </form>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(email.created_datetime_utc).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {email.modified_datetime_utc ? new Date(email.modified_datetime_utc).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <form action={updateWhitelistEmail}>
                                                <input type="hidden" name="id" value={email.id} />
                                                <input type="hidden" name="email_address" value={email.email_address} /> {/* Keep existing value for update */}
                                                <SubmitButton pendingText="Saving..." className="text-indigo-600 hover:text-indigo-900 px-2 py-1">Save</SubmitButton>
                                            </form>
                                            <form action={deleteWhitelistEmail}>
                                                <input type="hidden" name="id" value={email.id} />
                                                <SubmitButton pendingText="Deleting..." className="text-red-600 hover:text-red-900 px-2 py-1">Delete</SubmitButton>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Allowed Signup Domains */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Allowed Signup Domains</h3>
                    <form action={createAllowedSignupDomain}>
                        <input type="text" name="apex_domain" placeholder="New Domain" required
                            className="mr-2 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                        <SubmitButton pendingText="Adding..." className="px-3 py-1 text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors border border-gray-300 dark:border-gray-600">
                            Add Domain
                        </SubmitButton>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Apex Domain</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {signupDomains?.map((domain) => (
                                <tr key={domain.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                        <form action={updateAllowedSignupDomain}>
                                            <input type="hidden" name="id" value={domain.id} />
                                            <input type="text" name="apex_domain" defaultValue={domain.apex_domain} required
                                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                                        </form>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(domain.created_datetime_utc).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <form action={updateAllowedSignupDomain}>
                                                <input type="hidden" name="id" value={domain.id} />
                                                <input type="hidden" name="apex_domain" value={domain.apex_domain} /> {/* Keep existing value for update */}
                                                <SubmitButton pendingText="Saving..." className="text-indigo-600 hover:text-indigo-900 px-2 py-1">Save</SubmitButton>
                                            </form>
                                            <form action={deleteAllowedSignupDomain}>
                                                <input type="hidden" name="id" value={domain.id} />
                                                <SubmitButton pendingText="Deleting..." className="text-red-600 hover:text-red-900 px-2 py-1">Delete</SubmitButton>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Helper to revalidate path - usually imported from 'next/cache'
import { revalidatePath } from 'next/cache';