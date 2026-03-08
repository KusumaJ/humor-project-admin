'use client';

import React from 'react';
import Image from 'next/image';
import { ExpandableText } from './ExpandableText';
import Link from 'next/link'; // Import Link

interface ImageData {
    id: string; // The original ID string
    url: string;
    image_description: React.ReactNode; // Pre-rendered ExpandableText
    // No url_thumbnail here as it's not passed as a separate prop
    // No id_short here, as it's not desired to be displayed
}

interface ImageTableViewProps {
    images: ImageData[];
    basePath?: string; // New optional prop for link base path
}

export function ImageTableView({ images, basePath }: ImageTableViewProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {images.map((image) => (
                <Link key={image.id} href={`${basePath}/${image.id}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer">
                        {image.url && (
                            <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                <Image
                                    src={image.url}
                                    alt="Image"
                                    layout="fill"
                                    objectFit="contain"
                                    className="transition-transform duration-300 hover:scale-105"
                                />
                            </div>
                        )}
                        <div className="p-4 relative">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {image.image_description}
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}