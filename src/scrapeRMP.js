import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');



export default class RMPScraper {
    /*
    This class serves to scrape RateMyProfessor for professor data by doing the following:
    Searches the RateMyProfessor website under UBC's school ID with a given professor name.
    If a professor that attends UBC is detected, RMP information data is then scraped and saved onto this.data
     */
    constructor(name) {
        this.name = name;
        this.data = {
            name      : this.name,
            quality   : 'No Data',
            difficulty: 'No Data',
            takeAgain : 'No Data',
            numRatings: 'No Data'
        }
    }

    // Searches RMP for the prof with the given name.
    // Sets the prof data if the prof exists on RMP. Does nothing otherwise.
    // Returns the prof data after the search and scraping complete (or fail).
    async search() {
        let search_url = 'https://www.ratemyprofessors.com/search/teachers?query=' + this.name + '&sid=U2Nob29sLTE0MTM=';

        const browser = await puppeteer.launch();
        this.page = await browser.newPage();

        await this.page.goto(search_url);

        if (await this.rmpHasProf()) {
            await this.getProfData();
        }

        await browser.close();

        return this.data;
    }

    // Gets all applicable info about the prof.
    async getProfData() {
        await this.getQuality();
        await this.getDifficulty();
        await this.getTakeAgain();
        await this.getNumRatings();
    }

    // Gets the overall quality rating of the professor.
    async getQuality() {
        let elementArray = await this.getSomething('.joEEbw');
        if (elementArray) {
            this.data.quality = elementArray[0].substring(7, 10);
        }
    }

    // Gets the difficulty rating of the professor.
    async getDifficulty() {
        let elementArray = await this.getSomething('.hroXqf');
        if (elementArray) {
            this.data.difficulty = elementArray[1];
        }
    }

    // Gets the percentage of people who would take the given professor again.
    async getTakeAgain() {
        let elementArray = await this.getSomething('.hroXqf');
        if (elementArray) {
            this.data.takeAgain = elementArray[0];
        }
    }

    // Gets the number of ratings for the given professor.
    async getNumRatings() {
        let elementArray = await this.getSomething('.jMRwbg');
        if (elementArray) {
            this.data.numRatings = elementArray[0];
        }
    }

    // Returns true if RMP has the prof info for the given prof, false otherwise
    async rmpHasProf() {
        let schoolNames = await this.getSomething('.iDlVGM');
        if (schoolNames)
            if (schoolNames[0] == 'University of British Columbia') return true;

        return false;
    }

    // Returns an array of something taken from the RMP web page, given a CSS selector.
    async getSomething(cssSelector) {
        // Wait for DOM containing the css selector to be rendered
        await this.page.waitForSelector(cssSelector)
            .catch(() => {
                return false;
            });

        let content = await this.page.$$eval(cssSelector, (elements) => {
            let textContent = [];
            elements.forEach((element) => {
                textContent.push(element.textContent);
            })
            return textContent;
        });

        return content;
    }
}