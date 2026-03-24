import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useStoryStore } from '../stores/storyStore';
import { useUIStore } from '../stores/uiStore';
import { Button } from '../components/common/Button';
import { StoryCard } from '../components/dashboard/StoryCard';
import { CreateStoryModal } from '../components/dashboard/CreateStoryModal';
export function DashboardPage({ onEditStory }) {
    const { stories, deleteStory, loadStories } = useStoryStore();
    const { isCreateModalOpen, openCreateModal, closeCreateModal, showToast } = useUIStore();
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    useEffect(() => {
        loadStories().catch((err) => {
            console.error('Failed to load stories:', err);
            showToast('error', 'Failed to load stories');
        });
    }, [loadStories, showToast]);
    const storyList = Array.from(stories.values()).sort((a, b) => b.modified - a.modified);
    const handleDelete = async (storyId) => {
        setConfirmDelete(storyId);
    };
    const confirmDeleteStory = async () => {
        if (!confirmDelete)
            return;
        try {
            setIsDeleting(true);
            await deleteStory(confirmDelete);
            showToast('success', 'Story deleted successfully');
            setConfirmDelete(null);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete story';
            showToast('error', message);
        }
        finally {
            setIsDeleting(false);
        }
    };
    const handleEdit = (story) => {
        onEditStory(story.id);
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "border-b border-gray-200 bg-white shadow-sm", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 py-8", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Stories" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Create and manage your ARG stories" })] }), _jsx(Button, { size: "lg", onClick: openCreateModal, children: "+ New Story" })] }) }) }), _jsx("div", { className: "max-w-7xl mx-auto px-4 py-8", children: storyList.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("p", { className: "text-gray-600 text-lg", children: "No stories yet" }), _jsx("p", { className: "text-gray-500 mt-1", children: "Create your first story to get started" })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: storyList.map((story) => (_jsx(StoryCard, { story: story, onEdit: handleEdit, onDelete: handleDelete }, story.id))) })) }), _jsx(CreateStoryModal, { open: isCreateModalOpen, onOpenChange: closeCreateModal }), confirmDelete && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Delete Story?" }), _jsx("p", { className: "text-gray-600 mt-2", children: "This action cannot be undone. All artefacts and assets will be deleted." }), _jsxs("div", { className: "flex gap-3 mt-6", children: [_jsx(Button, { variant: "destructive", className: "flex-1", onClick: confirmDeleteStory, disabled: isDeleting, children: isDeleting ? 'Deleting...' : 'Delete' }), _jsx(Button, { variant: "outline", className: "flex-1", onClick: () => setConfirmDelete(null), disabled: isDeleting, children: "Cancel" })] })] }) }))] }));
}
