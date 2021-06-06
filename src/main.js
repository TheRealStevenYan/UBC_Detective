import UBCScraper from './scrapeUBC.js';

let scraper = new UBCScraper();

await scraper.scrapeSections();
scraper.saveSectionURLs();
