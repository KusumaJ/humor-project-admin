'use client';

import { useFormStatus } from 'react-dom';
import { type ComponentProps } from 'react';
import clsx from 'clsx'; // For conditional class names

type Props = ComponentProps<'button'> & {
  pendingText?: string;
};

export function SubmitButton({ children, pendingText, className, ...props }: Props) {
  const { pending, action } = useFormStatus();

  const isPending = pending && action === props.formAction;

  return (
    <button
      {...props}
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className={clsx(
        "px-4 py-2 rounded-md font-semibold text-white transition-colors", // Base styles
        {
          "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2": // Primary style
            !className?.includes('bg-red') && !className?.includes('bg-gray'), // Apply if not already a danger/secondary button
          "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2": className?.includes('bg-red'), // Danger style
          "opacity-70 cursor-not-allowed": pending, // Pending state opacity
        },
        className // Allow custom classes to override
      )}
    >
      {isPending ? pendingText : children}
    </button>
  );
}