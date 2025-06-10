import React from 'react';
import ReactDOM from "react-dom/client";
import { NotesApp } from './notes-app';

const rootElement = document.querySelector('#root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);

    root.render(
        <NotesApp />
    );
}
