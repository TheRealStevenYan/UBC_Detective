import UBCScraper from './scrapeUBC.js';

let scraper = new UBCScraper();

//await scraper.scrapeSections();
//scraper.saveSectionURLs();

await scraper.loadSectionURLs();

scraper.print();