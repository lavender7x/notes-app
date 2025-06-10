import React, { useEffect, useState } from 'react';
import { subscribeToUrlChange, unsubscribeFromUrlChange } from '../utils/url-listener';
import './search-result.scss';
import { Post } from '../../shared/post';
import { Routes } from '../../shared/routes';

export function SearchResult() {
    const [searchResults, setSearchResults] = useState<Post[]>([]);

    useEffect(() => {
        const cb = () => {
            const q = window.location.search.split('=')[1];
            fetch(`${Routes.Search}?q=${q}`)
                .then(res => res.json())
                .then(res => {
                    setSearchResults(res);
                });
        }

        subscribeToUrlChange(cb);

        return () => {
            unsubscribeFromUrlChange(cb);
        }
    }, []);

    return (
        <div className="search-result">
            <h1>Search result</h1>
            <div>
                {searchResults.map((result, index) => (
                    <div>
                        {(index + 1)}. <a href={`/${result.meta.id}`}>{result.meta.title}</a>
                    </div>
                ))}
            </div>

        </div>
    )
}
