import { jsx as _jsx } from "react/jsx-runtime";
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
const buttonVariants = cva('inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed', {
    variants: {
        variant: {
            default: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600',
            secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-200',
            destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
            outline: 'border border-gray-300 bg-white hover:bg-gray-50 focus-visible:ring-gray-300',
            ghost: 'hover:bg-gray-100 focus-visible:ring-gray-300',
        },
        size: {
            sm: 'h-8 px-3',
            md: 'h-10 px-4',
            lg: 'h-12 px-6',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'md',
    },
});
export function Button({ className, variant, size, ...props }) {
    return _jsx("button", { className: cn(buttonVariants({ variant, size }), className), ...props });
}
