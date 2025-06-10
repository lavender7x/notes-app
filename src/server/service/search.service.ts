import { Post } from '../../shared/post';
import { ContentService } from './content.service.';

interface SearchBucket {
    positions: number[];
}

export class SearchService {
    private searchIndex = new Map<string, Map<string, SearchBucket>>();

    constructor(private contentService: ContentService) { }

    search(query: string): Post[] {
        const exactQueries = query
            .match(/(\".*?\")/g)
            ?.map(m => m.replace(/\"/g, ''))
            ?.map(m => m.toLocaleLowerCase()) || [];

        const regularQueries = query
            .replace(/(\".*?\")/g, '')
            .toLocaleLowerCase()
            .split(' ')
            .filter(token => token.length > 2);

        return [
            ...this.getExactMatches(exactQueries),
            ...this.getRegularResults(regularQueries),
        ]
            .filter(Boolean)
            .filter((val, index, arr) => index === arr.indexOf(val))
            .map(post => ({
                ...post,
                content: '',
            })) as Post[];
    }

    buildSearchIndex() {
        for (const post of this.contentService.getPosts()) {
            let position = 0;
            for (const rawWord of post.content.split(/\s+/)) {
                const word = rawWord.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

                position++;

                // if (word.length < 3) {
                //     continue;
                // }

                if (!this.searchIndex.has(word)) {
                    this.searchIndex.set(word, new Map());
                }

                const documentBuckets = this.searchIndex.get(word)!;
                if (!documentBuckets.has(post.meta.id)) {
                    documentBuckets.set(post.meta.id, { positions: [] });
                }


                const documentBucket = documentBuckets.get(post.meta.id)!;
                documentBucket.positions.push(position);
            }
        }
    }

    private getExactMatches(exactQueries: string[]) {
        const results: (Post | undefined)[] = [];

        for (const exactQuery of exactQueries) {
            const words = exactQuery
                .split(/\s+/)
                .map(word => word.replace(/[^a-zA-Z0-9]/g, ''))
                .map(word => word.toLocaleLowerCase());

            const firstWordBucket = this.searchIndex.get(words[0]);
            if (!firstWordBucket) {
                continue;
            }

            for (const [postId, entry] of firstWordBucket) {
                const positionArr = [entry.positions];
                let hasMatchInDocument = true;
                for (let i = 1; i < words.length; i++) {
                    const document = this.searchIndex.get(words[i])?.get(postId);
                    if (document) {
                        positionArr.push(document.positions);
                    } else {
                        hasMatchInDocument = false;
                        break;
                    }
                }

                if (!hasMatchInDocument) {
                    continue
                }

                // now let's check the order of the words
                for (let i = 0; i < positionArr[0].length; i++) {
                    let hasMatchingPositions = true;
                    const currPos = positionArr[0][i];
                    for (let j = 1; j < positionArr.length; j++) {
                        if (!positionArr[j].includes(currPos + j)) {
                            hasMatchingPositions = false;
                            break;
                        }
                    }

                    if (hasMatchingPositions) {
                        results.push(this.contentService.getPost(postId))
                    }
                }
            }
        }

        return results;
    }

    private getRegularResults(words: string[]) {
        const results: (Post | undefined)[] = [];

        for (const word of words) {
            if (this.searchIndex.has(word)) {
                for (const postId of (this.searchIndex.get(word)?.keys() || [])) {
                    results.push(this.contentService.getPost(postId));
                }
            }
        }

        return results;
    }
}
