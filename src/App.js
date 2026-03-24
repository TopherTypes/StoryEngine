import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { DashboardPage } from './pages/DashboardPage';
import { StoryEditorPage } from './pages/StoryEditorPage';
export default function App() {
    const [editingStoryId, setEditingStoryId] = useState(null);
    if (editingStoryId) {
        return _jsx(StoryEditorPage, { storyId: editingStoryId, onClose: () => setEditingStoryId(null) });
    }
    return _jsx(DashboardPage, { onEditStory: (id) => setEditingStoryId(id) });
}
