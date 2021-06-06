import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');
import RMPScraper from "./scrapeRMP.js";
import {readFileSync, writeFile} from "fs";




export default class UBCScraper {
    constructor() {
        this.sectionURLs = []
        this.data = new Map();
    }

    // Visits a new page with puppeteer.
    // Modifies this.page. Call this before doing any scraping as it changes which page we scrape from.
    // MUST initialise this.browser with puppeteer.launch() before calling.
    async scrapeSections() {
        let root_url = 'https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-all-departments';

        // Initialise a browser instance to load pages into
        this.browser = await puppeteer.launch();

        let subjectURLs = await this.scrapeLinks(root_url);
        let courseURLs = await this.scrapeMultipleLinks(subjectURLs)
        this.sectionURLs = await this.scrapeMultipleLinks(courseURLs);

        await this.browser.close();
    }

    // debugging purposes only
    print() {
        for (let i = 0; i < this.sectionURLs.length; i++) {
            console.log(this.sectionURLs[i]);
        }
        console.log(this.sectionURLs.length);
    }

    // Loads the section URLs from src/sections.json to this.sectionURLs
    // Use this in conjunction with loadSectionURLs() to avoid the 20+ minutes it takes to scrape each section URL.
    async loadSectionURLs() {
        let json = readFileSync('src/sections.json', 'utf8', (err) => {
            if (err) {
                console.log(err);
                return;
            }
        });
        this.sectionURLs = JSON.parse(json);
    }

    // Saves the section URLs to src/sections.json
    // Use this in conjunction with loadSectionURLs() to avoid the 20+ minutes it takes to scrape each section URL.
    saveSectionURLs() {
        let json = JSON.stringify(this.sectionURLs);
        writeFile('src/sections.json', json, (err) => {
            if (err) console.log(err);
        })
    }

    // Scrape every link on every URL in the given array of URLs.
    // Returns the link as a single, massive array.
    async scrapeMultipleLinks(urls) {
        let links = [];
        for (let i = 0; i < urls.length; i++) {
            let url = urls[i];
            links.push.apply(links, await this.scrapeLinks(url));
            console.log(links.length)
        }
        return links;
    }

    // Scrapes every link off any of UBC's course pages. Just give it a URL and it will return any links on
    // the page corresponding to that URL.
    async scrapeLinks(url) {
        const page = await this.browser.newPage();
        await page.goto(url, {waitUntil: 'load'});

        let urls = await page.evaluate(() => {
            let links = [];

            let table = document.getElementById('mainTable');

            if (table == null) {
                let elements = document.getElementsByClassName('table');
                table = elements[1];
            }

            let tags = table.getElementsByTagName('a');

            for (let i = 0; i < tags.length; i++) {
                let subjectURL = 'https://courses.students.ubc.ca' + tags[i].getAttribute('href');
                links.push(subjectURL);
            }

            return links;
        });

        await page.close();

        return urls;
    }
}

