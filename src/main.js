import UBCScraper from './scrapeUBC.js';
import ProfScraper from './scrapeProfs.js';


await main();


async function main() {
    let ubcScraper = new UBCScraper();
    await ubcScraper.scrapeSections();
    ubcScraper.saveSectionURLs();
    //ubcScraper.loadSectionURLs();
    let profScraper = new ProfScraper(ubcScraper.sectionURLs);
    await profScraper.scrapeAllProfNames();
    await profScraper.save('names.json');
    //profScraper.load('names.json');
    await profScraper.scrapeAllProfInfo();
    profScraper.save('data.json');
}