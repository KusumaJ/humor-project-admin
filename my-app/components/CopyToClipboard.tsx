'use client';

import React, { useState } from 'react';

interface CopyToClipboardProps {
    textToCopy: string;
    children: React.ReactNode;
    className?: string;
}

export function CopyToClipboard({ textToCopy, children, className }: CopyToClipboardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset "Copied!" message after 2 seconds
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // Optionally provide error feedback to the user
        }
    };

    return (
        <span
            onClick={handleCopy}
            className={`relative cursor-pointer group ${className || ''}`}
            title="Click to copy"
        >
            {children}
            {copied && (
                <span className="absolute left-1/2 -top-full -translate-x-1/2 mt-2 px-2 py-1 bg-gray-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300">
                    Copied!
                </span>
            )}
        </span>
    );
}
