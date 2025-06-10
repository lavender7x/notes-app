import bodyParser from 'body-parser';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { ContentService } from './service/content.service.';
import { SearchService } from './service/search.service';
import { contentDir } from './utils';
import { Routes } from '../shared/routes';
import { getConfig } from './config';

const contentService = new ContentService({ contentDir: getConfig().contenDir });
const searchService = new SearchService(contentService);

searchService.buildSearchIndex();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/static', express.static(path.resolve('static')))

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

app.get(Routes.BrowseTree, (req, res) => {
    try {
        res.json(contentService.getPosts());
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get(Routes.Search, (req, res) => {
    try {
        const query = decodeURIComponent(req.query.q as string || '');
        if (!query || query.includes('..') || query.includes('/')) {
            throw new Error('Invalid query');
        }

        res.json(searchService.search(query));
    }
    catch (error) {
        res.sendStatus(500);
    }
});

app.post(Routes.CreateDocument, (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            throw new Error('Title is required');
        }

        const id = title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const directory = contentDir(id);
        fs.mkdirSync(directory, { recursive: true });

        const filePath = path.join(directory, `${id}.md`);
        fs.writeFileSync(filePath, `---\nid: ${id}\ntitle: ${title}\n---\n\n## New Document\n\nThis is a new document created with the notes app.\n\n`);

        // rebuild cache so post appears in browse tree
        contentService.getPosts(true);

        res.json({
            path: path.join(directory, `${id}.md`),
        })
    }
    catch (error) {
        res.sendStatus(500);
        return;
    }
});

app.delete(Routes.DeleteDocument, (req, res) => {
    try {
        const id = req.query.id as string;
        if (!id || id.includes('..') || id.includes('/')) {
            throw new Error('Invalid ID');
        }

        fs.rmdirSync(contentDir(id), { recursive: true });

        contentService.getPosts(true);

        res.sendStatus(200);
    }
    catch (error) {
        res.sendStatus(500);
    }
});

app.get(Routes.Version, (req, res) => {
    try {
        res.send(JSON.parse(fs.readFileSync('./package.json').toString()).version);
    }
    catch (error) {
        res.sendStatus(500);
    }
});

app.get(Routes.Document, (req, res) => {
    try {
        const postId = req.query.id as string;
        if (!postId || postId.includes('..') || postId.includes('/')) {
            throw new Error('Invalid ID');
        }

        res.json(contentService.loadPost(postId));
    }
    catch (error) {
        res.sendStatus(500);
    }
});

app.get('*', (req, res) => {
    try {
        if (req.path.includes('..')) {
            throw new Error('Invalid path');
        }
        
        const pathArr = req.path.split('/');
        if (pathArr.length < 3) {
            res.send(fs.readFileSync('./templates/public.html').toString());
            return;
        }

        const postId = req.path.split('/')?.[1];
        if (!postId) {
            throw new Error('Post ID is required');
        }

        const requiredFile = req.path
            .split('/')
            .slice(2)
            .join('/');

        const contentPath = contentService.getPost(postId)
            ?.path
            ?.split('/')
            ?.slice(0, -1)
            ?.join('/') || '';

        res.sendFile(`${contentPath}/${requiredFile}`);
        return;
    }
    catch (error) {
        res.sendStatus(404);
    }
});

const portNumber = getConfig().port;

app.listen(portNumber, '127.0.0.1', () => {
    console.log(`* notes app running on port ${portNumber} 😎`);
});
