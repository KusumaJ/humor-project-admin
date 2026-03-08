'use client';

import React, { useState } from 'react';

interface ExpandableTextProps {
    text: string;
    maxLength?: number;
}

export function ExpandableText({ text, maxLength = 50 }: ExpandableTextProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text || text.length <= maxLength) {
        return <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">{text}</div>;
    }

    const displayedText = isExpanded ? text : text.substring(0, maxLength);

    return (
        <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
            {displayedText}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="ml-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500 text-sm font-medium focus:outline-none"
                    style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }} // Minimal styling
                >
                    ...
                </button>
            )}
            {isExpanded && (
                <button
                    onClick={() => setIsExpanded(false)}
                    className="ml-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500 text-sm font-medium focus:outline-none"
                    style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }} // Minimal styling
                >
                    [Less]
                </button>
            )}
        </div>
    );
}