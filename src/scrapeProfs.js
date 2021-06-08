import { createRequire } from 'module';
import {readFileSync, writeFileSync} from "fs";
import RMPScraper from "./scrapeRMP.js";
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');



export default class ProfScraper {
    /*
    This class takes in the sectionURLs scraped by the UBCScraper class, and scrapes the professor names off every
    section via scrapeAllProfNames(). Prof names are saved into this.profNames.
    Call scrapeAllProfInfo() to scrape the professor's RateMyProfessors info once the prof names have been scraped.
    There are also save(src) and load(src) methods to save time on scraping if previous scrapes have been done.
    this.data represents a collection of key:value pairs with the professor's name and RMP information.
     */
    constructor(sectionURLs) {
        this.data = {};
        this.profNames = [];
        this.sectionURLs = sectionURLs;
    }

    // Loads data from the given src into the ProfScraper object.
    // Use this in conjunction with load(src) to avoid really long waits while scraping.
    // Acceptable srcs: 'names.sjon' or 'data.json'
    load(src) {
        if (src != 'names.json' && src != 'data.json') throw new Error("Invalid src: specify 'names.json' or 'data.json'");

        let json = readFileSync('src/json/' + src, 'utf8', (err) => {
            if (err) {
                console.log(err);
                return;
            }
        });

        if (src == 'names.json') {
            this.profNames = JSON.parse(json);
            return;
        }

        this.data = JSON.parse(json);
    }

    // Saves the section URLs to src/json/sections.json
    // Use this in conjunction with loadSectionURLs() to avoid the 20+ minutes it takes to scrape each section URL.
    save(src) {
        if (src != 'names.json' && src != 'data.json') throw new Error("Invalid src: specify 'names.json' or 'data.json'");

        let json = JSON.stringify(this.data, null, '\t');
        if (src == 'names.json') json = JSON.stringify(this.profNames, null, '\t');

        writeFileSync('src/json/' + src, json, (err) => {
            if (err) console.log(err);
        })
    }

    // Scrapes all profs' info from RateMyProfessors
    // Uses this.profNames to determine
    async scrapeAllProfInfo() {
        for (let i = 0; i < this.profNames.length; i++) {
            let name = this.profNames[i];

            let scraper = new RMPScraper(name);
            let profData = await scraper.search();
            if (profData) this.data[name] = profData;

            console.log(this.data);
            console.log(profData);
            console.log('Iteration: ' + i + '\nName checked: ' + name);
        }
    }

    // Scrapes all prof names from each section URL in this.sectionURLs.
    // Prof names are saved into this.profNames.
    async scrapeAllProfNames() {
        this.browser = await puppeteer.launch();

        // Use a set to prevent duplicate prof names.
        let profNames = new Set();

        for (let i = 0; i < this.sectionURLs.length; i++) {
            let url = this.sectionURLs[i];
            let names = await this.scrapeProfNames(url);

            if (names) names.forEach((name) => {
                profNames.add(name);
            });

            console.log(profNames);
            console.log('Iteration: ' + i);
        }

        this.profNames = Array.from(profNames);

        await this.browser.close();
    }

    // Scrapes all prof names from the given section URL.
    // Returns an array of prof names.
    async scrapeProfNames(url) {
        const page = await this.browser.newPage();
        await page.goto(url, {waitUntil: 'load'});

        let names = await page.evaluate(() => {
            let instructorTable = document.getElementsByTagName('table')[2]
            if (instructorTable.textContent == 'Instructor:  TBA') return;

            let noMoreProfs;
            let instructorNames = [];

            for (let i = 0; i < instructorTable.rows.length; i++) {
                if (noMoreProfs) break;

                let row = instructorTable.rows[i];

                for (let j = 0; j < row.cells.length; j++) {
                    let cell = row.cells[j];

                    // Stops adding more names to the list of instructor names once it detects a list of TA's.
                    if (cell.textContent.replace(/\s/g, '') == 'TA:') {
                        noMoreProfs = true;
                        break;
                    }

                    // Professor names are always represented in upper case with a last name, a comma, and a first name.
                    // If it doesn't have a comma or has a lower case letter, it's not a professor name.
                    if (!cell.textContent.includes(',') || /[a-z]/.test(cell.textContent)) continue;

                    instructorNames.push(cell.textContent);
                }
            }
            return instructorNames;
        });

        await page.close();

        return names;
    }
}