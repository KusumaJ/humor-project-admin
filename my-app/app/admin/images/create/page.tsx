import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';
import { ImageUploader } from '@/components/ImageUploader'; // Import ImageUploader
import { v4 as uuidv4 } from 'uuid'; // For generating unique file names
import Image from 'next/image'; // For potential image preview

// Server Action for creating a new image
async function createImage(formData: FormData) {
    'use server';

    const supabase = await createClient();

    const { data: userResponse, error: userError } = await supabase.auth.getUser();
    if (userError || !userResponse.user) {
        console.error('Error getting user for image creation:', userError);
        redirect('/auth/signin');
    }
    const profileId = userResponse.user.id;

    let imageUrl: string | null = formData.get('url-input') as string | null; // Get URL from text input
    const imageFile = formData.get('url-file') as File | null; // Get file from file input

    if (imageFile && imageFile.size > 0) {
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `public/images/${fileName}`; // Define your bucket and path

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('images') // Use your actual bucket name
            .upload(filePath, imageFile, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Error uploading image to storage:', uploadError);
            // Handle upload error, maybe return an error message
            // For now, it will proceed without an image URL if upload fails
            imageUrl = null;
        } else {
            const { data: publicUrlData } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);
            imageUrl = publicUrlData.publicUrl;
        }
    }

    if (!imageUrl) {
        // If neither URL is provided nor file uploaded successfully
        console.error('No image URL or file provided/uploaded.');
        // You might want to return an error to the user or stop the action
        // For now, we will proceed with a null URL, which might cause DB issues if URL is required
    }


    const { error } = await supabase
        .from('images')
        .insert({
            url: imageUrl, // Use the uploaded file's URL or pasted URL
            is_common_use: formData.get('is_common_use') === 'on',
            profile_id: formData.get('profile_id') || profileId, // Use form value or current user's profile ID
            additional_context: formData.get('additional_context'),
            is_public: formData.get('is_public') === 'on',
            image_description: formData.get('image_description'),
            celebrity_recognition: formData.get('celebrity_recognition'),
            // created_datetime_utc and modified_datetime_utc default to now() in schema
        });

    if (error) {
        console.error('Error creating image record:', error);
        // In a real app, you might want to revalidate path or return an error state
    } else {
        redirect('/admin/images'); // Redirect back to images list after creation
    }
}


export default async function CreateImagePage() {
    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Create New Image</h2>

            <form action={createImage} className="space-y-6">
                {/* Image Uploader Component */}
                <ImageUploader name="url" /> {/* Use the ImageUploader */}

                {/* Image Description */}
                <div>
                    <label htmlFor="image_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image Description</label>
                    <textarea
                        id="image_description"
                        name="image_description"
                        rows={3}
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Profile ID */}
                <div>
                    <label htmlFor="profile_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile ID (Optional, defaults to current user)</label>
                    <input
                        type="text"
                        id="profile_id"
                        name="profile_id"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* is_common_use */}
                <div className="flex items-center">
                    <input
                        id="is_common_use"
                        name="is_common_use"
                        type="checkbox"
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
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Is Public</label>
                </div>

                <div className="flex justify-end">
                    <SubmitButton formAction={createImage} pendingText="Creating..." className="bg-indigo-600 hover:bg-indigo-700">Create Image</SubmitButton>
                </div>
            </form>
        </div>
    );
}