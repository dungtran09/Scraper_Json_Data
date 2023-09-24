const pageScraper = require("./pageScraper");
const fs = require("fs");

async function scraperAll(browserInstance) {
  try {
    let browser;

    browser = await browserInstance;
    let scrapedData = {};
    scrapedData = await pageScraper.scraper(browser);
    await browser.close();

    fs.writeFile(
      "data.json",
      JSON.stringify(scrapedData),
      "utf8",
      function (err) {
        if (err) {
          return console.log(err);
        }
        console.log(
          "The data has been scraped and saved successfully! View it at './data.json'",
        );
      },
    );
  } catch (error) {
    console.log("Could not resolve the browser instance => ", error);
  }
}

module.exports = (browserInstance) => scraperAll(browserInstance);
