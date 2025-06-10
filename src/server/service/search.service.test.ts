import { ContentService } from "./content.service.";
import { SearchService } from "./search.service";

test('calls onClick when clicked', () => {
    const contentService = new ContentService({ contentDir: './content-test' });


    const posts = contentService.getPosts();

    const searchService = new SearchService(contentService);
    searchService.buildSearchIndex();

    // const searchResult = searchService.search(`"dolor sit amet consectetur adipiscing elit"`);
    const searchResult = searchService.search(`"open your" connectivity`);

    console.log(searchResult.map(s => s.meta.title));

    expect(true).toEqual(false);
});


