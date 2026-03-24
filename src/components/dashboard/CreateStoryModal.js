import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { useStoryStore } from '../../stores/storyStore';
import { useUIStore } from '../../stores/uiStore';
export function CreateStoryModal({ open, onOpenChange }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [author, setAuthor] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { createStory } = useStoryStore();
    const { showToast } = useUIStore();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!title.trim()) {
            setError('Story title is required');
            return;
        }
        try {
            setIsLoading(true);
            await createStory({
                title: title.trim(),
                description: description.trim(),
                author: author.trim(),
            });
            showToast('success', 'Story created successfully!');
            onOpenChange(false);
            setTitle('');
            setDescription('');
            setAuthor('');
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create story';
            setError(message);
            showToast('error', message);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleOpenChange = (newOpen) => {
        if (!newOpen) {
            setTitle('');
            setDescription('');
            setAuthor('');
            setError(null);
        }
        onOpenChange(newOpen);
    };
    return (_jsx(Modal, { open: open, onOpenChange: handleOpenChange, title: "Create New Story", description: "Fill in the details to create a new story", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && _jsx("div", { className: "rounded-md bg-red-50 p-3 text-sm text-red-800", children: error }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-900", children: "Story Title *" }), _jsx(Input, { type: "text", placeholder: "Enter story title", value: title, onChange: (e) => setTitle(e.target.value), className: "mt-1", disabled: isLoading })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-900", children: "Description" }), _jsx(Textarea, { placeholder: "Brief description of your story", value: description, onChange: (e) => setDescription(e.target.value), className: "mt-1", disabled: isLoading })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-900", children: "Author" }), _jsx(Input, { type: "text", placeholder: "Your name", value: author, onChange: (e) => setAuthor(e.target.value), className: "mt-1", disabled: isLoading })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx(Button, { type: "submit", disabled: isLoading, children: isLoading ? 'Creating...' : 'Create Story' }), _jsx(Button, { type: "button", variant: "outline", onClick: () => handleOpenChange(false), disabled: isLoading, children: "Cancel" })] })] }) }));
}
