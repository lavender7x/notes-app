import React, { useEffect, useState } from 'react';
import './search.scss';
import { Routes } from '../../shared/routes';

export function Search() {
    const [query, setQuery] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (query !== undefined) {
            let param = query ? `/?q=${encodeURIComponent(query)}` : '/';
            history.pushState({}, '', param);
        }
    }, [query]);

    return (
        <div className="main-search-container">
            <input
                type="text"
                className="main-search"
                placeholder="Search here"
                value={query || ''}
                onChange={e => setQuery(e.target.value)}
            />

            <div className="new-button create-new-button">
                <button type="button" className="default-button" onClick={() => {
                    const postTitle = window.prompt('Enter a title for the new document');
                    if (!postTitle) {
                        return;
                    }

                    const postId = postTitle.toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '');

                    fetch(Routes.CreateDocument, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            title: postTitle,
                            slug: postId
                        })
                    })
                        .then(res => res.json())
                        .then(res => {
                            window.location.href = `vscode://file/${res.path}`;
                            window.location.href = `/${postId}`;
                        })
                }}>
                    Create New
                </button>
            </div>
        </div>
    )
}