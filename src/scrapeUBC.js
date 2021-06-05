import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');
import RMPScraper from "./scrapeRMP.js";



export default class UBCScraper {
    constructor() {
        this.data = new Map();
    }

    // Visits a new page with puppeteer.
    // Modifies this.page. Call this before doing any scraping as it changes which page we scrape from.
    // MUST initialise this.browser with puppeteer.launch() before calling.
    async newPage(url) {
        this.page = await this.browser.newPage();
        await this.page.goto(url, {waitUntil: 'load'});
    }

    async scrape() {
        let root_url = 'https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-all-departments';

        // Initialise puppeteer browser
        this.browser = await puppeteer.launch();
        //let subjectURLs = await this.scrapeLinks(root_url);
        console.log('a')
        //let courseURLs = await this.scrapeMultipleLinks(subjectURLs);
        console.log('b')
        let courseURLs = ['https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-course&dept=WRDS&course=150B',
                          'https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-course&dept=WRDS&course=350',
                          'https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-course&dept=ZOOL&course=500A',
                          'https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-course&dept=ZOOL&course=500B',
                          'https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-course&dept=ZOOL&course=500D',
                          'https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-course&dept=ZOOL&course=503',
                          'https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-course&dept=ZOOL&course=549',
                          'https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-course&dept=ZOOL&course=554',
                          'https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-course&dept=ZOOL&course=649']
        let sectionURLs = await this.scrapeMultipleLinks(courseURLs);

        for (let i = 0; i < sectionURLs.length; i++) {
            console.log(sectionURLs[i]);
        }
        console.log(sectionURLs.length);

        await this.browser.close();

        return this.data;
    }

    async scrapeMultipleLinks(urls) {
        let links = [];
        for (let i = 0; i < urls.length; i++) {
            console.log(urls[i]);
            let url = urls[i];
            links.push.apply(links, await this.scrapeLinks(url));
        }
        return links;
    }

    async scrapeLinks(url) {
        await this.newPage(url);

        let urls = await this.page.evaluate(() => {
            let links = [];

            let table = document.getElementById('mainTable');
            let tags = table.getElementsByTagName('a');

            for (let i = 0; i < tags.length; i++) {
                let subjectURL = 'https://courses.students.ubc.ca' + tags[i].getAttribute('href');
                links.push(subjectURL);
            }

            return links;
        });

        return urls;
    }
}

