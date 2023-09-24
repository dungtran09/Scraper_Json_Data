const scraperObject = {
  url: "https://www.xtmobile.vn/watch",
  async scraper(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    await page.goto(this.url);

    let scrapedData = [];

    // Wait for the required DOM to be rendered
    async function scrapeCurrentPage() {
      await page.waitForSelector("#List_Product");

      // Get the link to all the required books
      let urls = await page.$$eval(
        ".list_product_base > .product-base-grid",
        (links) => {
          // Extract the links from the data
          links = links.map(
            (el) => el.querySelector(".boxItem > .pic > a").href,
          );
          return links;
        },
      );

      console.log(urls);

      let pagePromise = (link) =>
        new Promise(async (resolve, reject) => {
          let newPage = await browser.newPage();
          await newPage.goto(link);

          // Wait for the required DOM to be rendered
          await newPage.waitForSelector("#divInfo");

          let dataObj = {};
          dataObj.title = await newPage.$eval(
            "h1.name-sp",
            (text) => text.textContent.split("(")[0],
          );

          dataObj.price = await newPage.$eval(".col-price-dt > span", (text) =>
            parseInt(text.textContent.split("đ")[0].split(".").join("")),
          );

          let configuration = await newPage.$$eval(
            ".option_focus > ul.parametdesc > li",
            (eles) => {
              configuration = eles.map((el) => {
                let name = el.querySelector("span").textContent;
                return {
                  [name]: el.querySelector("strong").textContent,
                };
              });
              return configuration;
            },
          );
          dataObj.configuration = configuration;

          dataObj.thumb = await newPage.$eval(
            ".owl-item > a > img",
            (image) => image.src,
          );

          try {
            dataObj.totalRatings = await newPage.$eval(
              ".rating-product > span.review-point",
              (text) =>
                parseFloat(text.textContent.split("/")[0].split("(")[1]),
            );
          } catch (error) {
            console.log("Tag element is not avaliable.");
          }

          let colors = [];
          try {
            colors = await newPage.$$eval(
              ".product-color > .color-list-show > a",
              (els) => {
                colors = els.map((el) => {
                  return {
                    name: el.querySelector("div > p").textContent,
                    image: el.querySelector("span > img").src,
                  };
                });

                return colors;
              },
            );
          } catch (error) {
            console.log("Colors not found.");
          }

          let storage_capacity = await newPage.$$eval(
            "div.box_capacity > a",
            (els) => {
              storage_capacity = els.map(
                (el) => el.querySelector("span").textContent,
              );
              return storage_capacity;
            },
          );

          dataObj.variants = [{ colors, storage_capacity }];

          try {
            dataObj.description = await newPage.$eval(
              "#danh-gia > .content-desc > h2 > strong",
              (text) => {
                return {
                  info: text.textContent,
                };
              },
            );
          } catch (error) {
            console.log("Descrtiption empty.");
          }

          resolve(dataObj);
          await newPage.close();
        });

      for (link in urls) {
        let currentPageData = await pagePromise(urls[link]);
        scrapedData.push(currentPageData);
        console.log(currentPageData);
      }
      // let nextButtonExist = false;
      // try {
      //   const nextButton = await page.$eval(
      //     ".pagination-more > form > a",
      //     (a) => a.textContent,
      //   );
      //   nextButtonExist = true;
      // } catch (err) {
      //   nextButtonExist = false;
      //   console.log("There is not next page.");
      // }
      // if (nextButtonExist) {
      //   await page.click(".pagination-more > form > a");
      //   return scrapeCurrentPage(); // Call this function recursively
      // }
      await page.close();
      return scrapedData;
    }
    let data = await scrapeCurrentPage();
    return data;
  },
};

module.exports = scraperObject;
