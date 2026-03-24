import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
export function Modal({ open, onOpenChange, title, description, children, className }) {
    return (_jsx(Dialog.Root, { open: open, onOpenChange: onOpenChange, children: _jsxs(Dialog.Portal, { children: [_jsx(Dialog.Overlay, { className: "fixed inset-0 z-40 bg-black/50" }), _jsxs(Dialog.Content, { className: cn('fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-lg', className), children: [_jsxs("div", { className: "flex items-center justify-between border-b border-gray-200 p-6", children: [_jsxs("div", { children: [_jsx(Dialog.Title, { className: "text-lg font-semibold text-gray-900", children: title }), description && _jsx(Dialog.Description, { className: "mt-1 text-sm text-gray-600", children: description })] }), _jsx(Dialog.Close, { asChild: true, children: _jsx("button", { className: "rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900", children: _jsx(X, { className: "h-5 w-5" }) }) })] }), _jsx("div", { className: "p-6", children: children })] })] }) }));
}
