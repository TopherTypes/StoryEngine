import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeDB } from './db/indexedDB';
// Initialize IndexedDB
initializeDB().catch((err) => {
    console.error('Failed to initialize database:', err);
});
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
