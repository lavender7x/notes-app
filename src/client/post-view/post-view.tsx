import React, { useCallback, useEffect, useState } from 'react';
import './post-view.scss';
import { Post } from '../../shared/post';
import { Routes } from '../../shared/routes';

interface PostViewProps {
    id: string;
}

export function PostView({ id }: PostViewProps) {
    const [post, setPost] = useState<Post | undefined>(undefined);

    useEffect(() => {
        fetch(`${Routes.Document}?id=${id}`)
            .then(res => res.json())
            .then(res => {
                setPost(res);
            });
    }, [id]);

    useEffect(() => {
        // markdown tasklist checkboxes
        document.querySelectorAll(`[data-checked]`).forEach(checkbox => {
            const state = String(checkbox.getAttribute('data-checked'));
            (checkbox as HTMLInputElement).checked = state === 'true';
        });

        // copy button
        window.addEventListener('click', e => {
            const element = (e.target as HTMLSpanElement);
            if (element?.classList?.contains('copy-button-icon')) {
                e.preventDefault();
                e.stopPropagation();
                const preContent = element.closest('.code-block')?.querySelector('.edit');
                if (preContent) {
                    const textcontent = (preContent.textContent || '').trim();
                    navigator.clipboard.writeText(textcontent);
                }
            }
        });
    }, [post]);

    const onDeleteClick = useCallback(() => {
        const confirmDelete = window.confirm('Are you sure you want to delete this post?');
        if (confirmDelete) {
            fetch(`${Routes.DeleteDocument}?id=${post?.meta.id}`, { method: 'DELETE' }).then(() => {
                window.location.href = '/';
            });
        }
    }, [post]);

    const onEditClick = useCallback(() => {
        window.location.href = `vscode://file/${post?.path}`;
    }, [post]);

    return (
        <div className="post-view">
            <div className="post-view-header">
                <div>
                    <h1>
                        {post?.meta?.title}
                    </h1>
                </div>

                <div className="post-view-header-actions">
                    <button className="default-button" onClick={onEditClick}>
                        Edit
                    </button>
                    {' '}
                    <button className="default-button" onClick={onDeleteClick}>
                        Delete
                    </button>
                </div>
            </div>
            <div dangerouslySetInnerHTML={{ __html: post?.renderedHtml || 'Loading ...' }}></div>
        </div>
    )
}