import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
export function Textarea({ className, ...props }) {
    return (_jsx("textarea", { className: cn('flex min-h-24 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 resize-vertical', className), ...props }));
}
