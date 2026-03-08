'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
    name: string; // The name for the hidden input that will hold the URL or file data
    initialUrl?: string; // For existing images
}

export function ImageUploader({ name, initialUrl = '' }: ImageUploaderProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(initialUrl);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        setFile(selectedFile || null);
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setImageUrl(null);
        }
    };

    const handleUrlInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const url = event.target.value;
        setImageUrl(url);
        setFile(null); // Clear file selection if URL is entered
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Clear file input
        }
    };

    return (
        <div>
            <label htmlFor={`${name}-url-input`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL (paste or upload)</label>
            <input
                type="text"
                id={`${name}-url-input`}
                name={`${name}-url`} // This input will carry the URL if pasted
                defaultValue={initialUrl}
                onChange={handleUrlInputChange}
                placeholder="Paste image URL here"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />

            <div className="my-4 text-center text-gray-500 dark:text-gray-400">
                — OR —
            </div>

            <label htmlFor={`${name}-file-input`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Image File</label>
            <input
                type="file"
                id={`${name}-file-input`}
                name={`${name}-file`} // This input will carry the file data
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300 dark:hover:file:bg-indigo-800"
            />

            {imageUrl && (
                <div className="mt-4 flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image Preview</label>
                    <Image src={imageUrl} alt="Image Preview" width={200} height={200} className="rounded-md object-cover border border-gray-300 dark:border-gray-600" />
                </div>
            )}

            {/* Hidden input to pass the selected file as a base64 string to the server action,
                or a blob URL for client-side preview. For FormData, the file input name itself is sufficient. */}
            {/* If you need to pass dataURL of the image or another hidden field for the file itself,
                you might need to adjust the server action to handle base64 if not directly uploading FormData file. */}
        </div>
    );
}
