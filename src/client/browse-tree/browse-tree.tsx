import React, { useCallback, useEffect, useState } from 'react';
import './browse-tree.scss';
import { subscribeToUrlChange } from '../utils/url-listener';
import { Post } from '../../shared/post';
import { Routes } from '../../shared/routes';

function getPostIdFromPath() {
    return window.location.pathname.split('/').pop() || '';
}

export function BrowseTree() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [openedPosts, setOpenedPosts] = useState<string[]>([]);

    const setOpenedPostsRecursively = useCallback((posts: Post[]) => {
        const id = getPostIdFromPath();
        const post = posts.find(p => p.meta.id === id);
        if (!post) {
            return;
        }

        let ancestors = [];
        let currentPost = post;
        while (currentPost) {
            const parentOfCurrentPost = posts.find(post => post.meta.id === currentPost.meta.parentId);
            if (parentOfCurrentPost) {
                currentPost = parentOfCurrentPost;
                ancestors.push(parentOfCurrentPost.meta.id)
            } else {
                break;
            }
        }

        setOpenedPosts([id, ...ancestors.filter(Boolean)])
    }, []);

    useEffect(() => {
        subscribeToUrlChange(() => {
            setOpenedPostsRecursively(posts);
        });
    }, [setOpenedPostsRecursively, posts]);

    useEffect(() => {
        fetch(Routes.BrowseTree).then(res => res.json()).then((res: Post[]) => {
            setPosts(res);
            setOpenedPostsRecursively(res);
        });
    }, [setOpenedPostsRecursively]);

    useEffect(() => {
        const header = document.querySelector('.notes-app-header');
        const headerDim = header?.getBoundingClientRect();
        const browseTree = document.querySelector('.browse-tree') as HTMLDivElement;
        if (headerDim && browseTree) {
            const h = window.innerHeight;
            browseTree.style.height = `calc(100vh - 40px)`;
            browseTree.style.overflowY = 'auto';
        }
    }, []);

    function toggleBrowseItem(postItem: Post) {
        if (openedPosts.includes(postItem.meta.id)) {
            setOpenedPosts(prev => prev.filter(id => id !== postItem.meta.id));
        } else {
            setOpenedPosts(prev => [...prev, postItem.meta.id]);
        }
    }

    function renderExpandButton(postItem: Post | undefined) {
        if (!postItem || !posts.find(p => p.meta.parentId === postItem.meta.id)) {
            return (
                <div className="icon-container">
                    <span className="dot"></span>
                </div>
            );
        }

        return (
            <div className="icon-container">
                <button className="expand-button" type="button" onClick={() => toggleBrowseItem(postItem)}>
                    <span className="material-symbols-rounded">
                        {openedPosts.includes(postItem.meta.id) ? 'expand_more' : 'chevron_right'}
                    </span>
                </button>
            </div>
        )
    }

    function renderPostItem(postItem: Post | undefined, level = 0) {
        let children = postItem
            ? posts.filter(post => post.meta.parentId === postItem.meta.id)
            : posts.filter(post => post.meta.parentId === '' || !post.meta.parentId);

        return (
            <div className={`browse-tree-item browse-tree-level-${level}`}>
                {(children || []).map(child => (
                    <div className="flex-container" key={child.meta.id} >

                        <div className={`item-flex ${getPostIdFromPath() === child.meta.id ? 'active' : ''}`}>
                            <div>
                                {renderExpandButton(child)}
                            </div>

                            <div>
                                <a
                                    href={`/${child.meta.id}`}
                                    onClick={e => {
                                        // e.stopPropagation();
                                        // e.preventDefault();
                                        // history.pushState({}, '', `/${child.meta.id}`);
                                    }}
                                >
                                    {child.meta.title}
                                </a>
                            </div>
                        </div>

                        {openedPosts.includes(child.meta.id) && renderPostItem(child, (level + 1))}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="browse-tree">
            {renderPostItem(undefined)}
        </div>
    )
}