import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useStoryStore } from './stores/storyStore';
export default function App() {
    const { loadStories } = useStoryStore();
    useEffect(() => {
        // Load initial data on mount
        loadStories().catch((err) => console.error('Failed to load stories:', err));
    }, [loadStories]);
    return (_jsx("div", { className: "min-h-screen bg-gray-50", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "StoryEngine - Authoring Tool" }), _jsx("p", { className: "mt-2 text-gray-600", children: "Phase 1: Foundation Setup Complete" }), _jsxs("div", { className: "mt-8 p-6 bg-white rounded-lg shadow", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Project Status" }), _jsxs("ul", { className: "mt-4 space-y-2 text-gray-700", children: [_jsx("li", { children: "\u2705 Vite + React + TypeScript configured" }), _jsx("li", { children: "\u2705 TypeScript types defined (Story, Artefact, all 6 types)" }), _jsx("li", { children: "\u2705 Zod validation schemas created" }), _jsx("li", { children: "\u2705 IndexedDB initialized and CRUD operations ready" }), _jsx("li", { children: "\u2705 Zustand stores (story, asset, ui, preview) created" }), _jsx("li", { children: "\u2705 Utility functions (ID generation, defaults)" }), _jsx("li", { children: "\u23F3 Next: Phase 2 - Dashboard & Story Management" })] })] })] }) }));
}
