# UBC Detective

---

An external program used to gather data to be used in my WhosMyProfessor Google Chrome extension.

Data is scraped and saved into JSON, before it is plugged into the extension and used.

Does the following:

- Scrapes the UBC course webpage across every course and every course section
- Gets the professor from each section and scrapes their information on RateMyProfessor
- Serialises this information into a JSON file

Written in JavaScript, compiled in Node.js

## How to use:

Simply do ```npm install``` to install all Node.js dependencies, then run with ```npm start```.

The JSON file will be saved at ```src/json/data.json```.