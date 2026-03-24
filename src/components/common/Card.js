import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
export function Card({ children, className }) {
    return _jsx("div", { className: cn('rounded-lg border border-gray-200 bg-white shadow-sm', className), children: children });
}
export function CardHeader({ children, className }) {
    return _jsx("div", { className: cn('border-b border-gray-200 px-6 py-4', className), children: children });
}
export function CardBody({ children, className }) {
    return _jsx("div", { className: cn('px-6 py-4', className), children: children });
}
export function CardFooter({ children, className }) {
    return _jsx("div", { className: cn('border-t border-gray-200 px-6 py-4', className), children: children });
}
