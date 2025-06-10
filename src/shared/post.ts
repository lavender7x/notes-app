export interface Post {
    meta: {
        id: string;
        prevId: string;
        parentId: string;
        title: string;
        tags: string[];
        lastModifiedDate: string;
        publishedDate: string;
    },
    renderedHtml: string;
    content: string;
    path: string;
}
