import fs from 'fs';
import showdown from 'showdown';
import { Post } from '../../shared/post';
import path, * as p from 'path';

interface ContentServiceConfig {
    contentDir: string;
}

export class ContentService {
    private postCache: Post[] = [];

    constructor(private config: ContentServiceConfig) {
        this.postCache = [];
    }

    getPosts(forceReload = false): Post[] {
        if (this.postCache.length > 0 && !forceReload) {
            return this.postCache;
        }


        this.postCache = [];
        this.loadPosts(this.config.contentDir);

        return this.postCache;
    }

    getPost(postId: string): Post | undefined {
        return this.getPosts().find(post => post.meta.id === postId);
    }

    loadPost(postId: string): Post {
        const cachedPosts = this.getPosts();
        const cachedPost = cachedPosts.find(cachedPost => cachedPost.meta.id === postId);
        if (!cachedPost) {
            throw new Error('no post was found')
        }

        const fileContent = fs.readFileSync(cachedPost.path).toString();
        const converter = new showdown.Converter({ metadata: true, tables: true, tasklists: true, simplifiedAutoLink: true });
        const content = converter.makeHtml(fileContent);
        const { id, lastModifiedDate, parent, publishedDate, title } = converter.getMetadata() as any;

        return {
            renderedHtml: this.formatContent(id, content),
            path: cachedPost.path,
            content: fileContent,
            meta: {
                id,
                lastModifiedDate,
                parentId: parent,
                publishedDate,
                prevId: '',
                tags: [],
                title,
            }
        }
    }

    private loadPosts(currentPath: string) {
        for (const dir of fs.readdirSync(currentPath)) {
            if (fs.lstatSync(path.join(currentPath, dir)).isDirectory()) {
                this.loadPosts(path.join(currentPath, dir))
            }

            if (!dir.endsWith('.md')) {
                continue;
            }

            const fileContent = fs.readFileSync(path.join(currentPath, dir)).toString();
            const converter = new showdown.Converter({ metadata: true, tables: true, tasklists: true, simplifiedAutoLink: true });
            const content = converter.makeHtml(fileContent);
            const { id, lastModifiedDate, parent, publishedDate, title } = converter.getMetadata() as any;

            const post: Post = {
                renderedHtml: this.formatContent(id, content),
                path: p.resolve(path.join(currentPath, dir)),
                content: fileContent,
                meta: {
                    id,
                    lastModifiedDate,
                    parentId: parent,
                    publishedDate,
                    prevId: '',
                    tags: [],
                    title,
                }
            }
            this.postCache.push(post);
        }
    }

    private formatContent(id: string, content: string): string {
        content = content.replace(/<pre><code(?:\s+class="([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g, this.injectCodeBlock);

        content = content.replace(/src="\./g, `src="/${id}`).replace(/href="\./g, `src="/${id}`);

        return content;
    }

    private injectCodeBlock(_: any, language: string, code: string): string {
        return fs.readFileSync('./templates/code-block.html').toString()
            .replace(`{{language}}`, language)
            .replace(`{{code}}`, code);
    };
}
