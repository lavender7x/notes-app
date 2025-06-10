import React, { useEffect, useState } from 'react';
import { BrowseTree } from './browse-tree/browse-tree';
import { Homepage } from './homepage/homepage.';
import './notes-app.scss';
import { PostView } from './post-view/post-view';
import { SearchResult } from './search-result/search-result';
import { Search } from './search/search';
import { registerUrlListener, subscribeToUrlChange } from './utils/url-listener';

registerUrlListener();

export function NotesApp() {
    const [page, setPage] = useState(<></>);
    const [version, setVersion] = useState('loading');

    function handleUrlChange() {
        const { pathname, search = '' } = window.location;

        if (pathname === '/' && search === '') {
            setPage(<Homepage />);
        } else if (search.startsWith('?q')) {
            setPage(<SearchResult />);
        } else {
            setPage(<PostView id={pathname.split('/').pop() || ''} />)
        }
    }

    useEffect(() => {
        handleUrlChange();
        subscribeToUrlChange(() => handleUrlChange());

        fetch('/api/version').then(res => res.text()).then(res => setVersion(res));
    }, []);

    return (
        <div className="notes-app">
            <div className="notes-app-header">
                <div className="version-number">
                    {version}
                </div>
                <Search />
            </div>

            <div className="notes-app-container">
                <div className="notes-app-tree">
                    <BrowseTree />
                </div>

                <div className="notes-app-content">
                    {page}
                </div>
            </div>
        </div>
    )
}