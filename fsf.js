const chrome = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");
const production = process.env.NODE_ENV === "production";
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const cheerio = require("cheerio");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
//const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fakeUa = require("fake-useragent");
//puppeteer.use(StealthPlugin());

const savefrom = require("./save-f-mp4.js");
const y2mate = require("./y2mate-mp3.js");
const scrapPage2 = async (pgUrl, videoUrl) => {
    const browser = await puppeteer.launch(
        production
            ? {
                  args:  [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-web-security",
                    "--disable-features=IsolateOrigins",
                    "--disable-site-isolation-trials",
                ],
                  defaultViewport: chrome.defaultViewport,
                  executablePath: await chrome.executablePath(),
                  headless: "new",
                  ignoreHTTPSErrors: true,
              }
            : {
                  headless: "new",
                  executablePath:
                      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
              },
    );
    const page = await browser.newPage();
    await page.goto(pgUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
    });
    await delay(3000);

    // Insert the video URL into the specific input field
    await page.type("#sf_url", videoUrl);

    // Click the submit button
    await page.click("#sf_submit");

    // Optionally, wait for the page to load the results after the form submission
    await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    const html = await page.evaluate(
        () => document.querySelector("*").outerHTML,
    );

    await browser.close();

    return html;
};

const scrapPage = async (pgUrl) => {
    const browser = await puppeteer.launch(
        production
            ? {
                  args: chrome.args,
                  defaultViewport: chrome.defaultViewport,
                  executablePath: await chrome.executablePath(),
                  headless: "new",
                  ignoreHTTPSErrors: true,
              }
            : {
                  headless: "new",
                  executablePath:
                  await chrome.executablePath(),
              },
    );
    const page = await browser.newPage();
    await page.setUserAgent(fakeUa());
    await page.goto(pgUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
    });
    await delay(3000);
    const html = await page.evaluate(
        () => document.querySelector("*").outerHTML,
    );

    await browser.close();

    return html;
};

const getPage = async (cardId) => {
    const browser = await puppeteer.launch(
        production
            ? {
                  args: chrome.args,
                  defaultViewport: chrome.defaultViewport,
                  executablePath: await chrome.executablePath(),
                  headless: "new",
                  ignoreHTTPSErrors: true,
              }
            : {
                  headless: "new",
                  executablePath:
                      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
              },
    );
    const page = await browser.newPage();
    await page.goto(`https://shoob.gg/cards/info/${cardId}`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
    });
    await delay(3000);
    const html = await page.evaluate(
        () => document.querySelector("*").outerHTML,
    );

    await browser.close();

    return html;
};

// Function to extract card data from HTML using Cheerio
async function extractCardData(html) {
    const $ = cheerio.load(html);
    const cardDataElements = $(".cardData"); // Select all elements with class "cardData"
    const cardData = [];
    const itemIDs = [];

    // Extract item IDs
    $('li[itemprop="itemListElement"] a[itemprop="item"]').each(
        (index, element) => {
            const itemID = $(element).attr("itemid");
            itemIDs.push(itemID);
        },
    );

    console.log(itemIDs);

    // Initialize variables
    let tier = "";
    let id = "";
    let source = "";

    // Loop through each cardData element and extract the necessary data
    cardDataElements.each((index, element) => {
        id = $(
            'li[itemprop="itemListElement"] a[itemprop="item"][itemid*="info"]',
        )
            .attr("itemid")
            .replace("https://shoob.gg/cards/info/", "")
            .trim();

        // Extract the inner HTML of each cardData element
        const innerHTML = $(element).html();
        // Extract the src attribute value of the video element
        const videoSrc = $(innerHTML).attr("src");
        // Extract the title attribute value of the video element
        const title = $(innerHTML).attr("title");
        // Extract the tier value
        tier = $(
            'li[itemprop="itemListElement"] a[itemprop="item"][href*="category"] span[itemprop="name"]',
        )
            .text()
            .replace("Tier", "")
            .trim();

        source = $(
            'li[itemprop="itemListElement"] a[itemprop="item"][href*="category"] span[itemprop="name"]',
        )
            .text()

            .trim();

        // Push the extracted data to the cardData array
        cardData.push({ id, videoSrc, title, tier });
    });

    console.log(cardData);
    return { cardData, tier, id, source };
}

// Main function to perform web scraping
const scrapeCardData = async (cardId) => {
    try {
        const url = `https://shoob.gg/cards/info/${cardId}`;
        console.log("Scraping URL:", url);

        const browser = await puppeteer.launch(
            production
                ? {
                      args: chrome.args,
                      defaultViewport: chrome.defaultViewport,
                      executablePath: await chrome.executablePath(),
                      headless: "new",
                      ignoreHTTPSErrors: true,
                  }
                : {
                      headless: "new",
                      executablePath:
                          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                  },
        );

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        console.log("Page loaded successfully");

        // Wait for either a video or image to load
        await page.waitForSelector(".cardData video, .cardData img", {
            timeout: 20000,
        });
        const html = await page.evaluate(
            () => document.querySelector("*").outerHTML,
        );

        const { cardData, tier, id, source } = await extractCardData(html);

        const series = await page.evaluate(() => {
            const seriesElement = document.querySelector(
                ".padded20.user_purchased h1.nice span.fff",
            );
            return seriesElement ? seriesElement.textContent : null;
        });
        const cardDataFromPage = await page.evaluate(
            (tier, id) => {
                const videoElement = document.querySelector(".cardData video");
                const imgElement = document.querySelector(".cardData img");

                if (videoElement) {
                    return {
                        type: "video",
                        src: videoElement.getAttribute("src"),
                        title: videoElement.getAttribute("alt"),
                        tier: tier,
                        id: id,
                    };
                } else if (imgElement) {
                    return {
                        type: "image",
                        src: imgElement.getAttribute("src"),
                        title: imgElement.getAttribute("title"),
                        tier: tier,
                        id: id,
                    };
                } else {
                    return null;
                }
            },
            tier,
            id,
        );

        const seriesInfo = await page.evaluate(() => {
            const cards = Array.from(
                document.querySelectorAll(".card-series-container .card-main"),
            );
            return cards
                .map((card) => {
                    const videoElement = card.querySelector(".cardData video");
                    const imgElement = card.querySelector(".cardData img");

                    if (videoElement) {
                        return {
                            type: "video",
                            src: videoElement.getAttribute("src"),
                            title: videoElement.getAttribute("alt"),
                        };
                    } else if (imgElement) {
                        return {
                            type: "image",
                            src: imgElement.getAttribute("src"),
                            title: imgElement.getAttribute("title"),
                        };
                    } else {
                        return null;
                    }
                })
                .filter(Boolean);
        });

        await browser.close();
        console.log("Browser closed");

        const data = { cardData: cardDataFromPage, series, seriesInfo };
        return data;
        console.log("Scraped data:", data);
    } catch (error) {
        console.error("Error while scraping:", error);
    }
};

app.get("/card", async (req, res) => {
    try {
        let cardId = req.query.cardid;
        let data = await scrapeCardData(cardId);
        res.status(200).json(data);
    } catch (e) {
        console.log(e);
    }
});
app.get("/scrap", async (req, res) => {
    let cardId = req.query.cardId;
    let page = await getPage(cardId);

    res.setHeader("Content-Type", "text/plain");
    res.status(200).end(page);
});
app.get("/scrappage", async (req, res) => {
    let pgUrl2 = req.query.url;
    const url =   decodeURIComponent(pgUrl2);
    let page = await scrapPage(url);
    res.setHeader("Content-Type", "text/plain");
    res.status(200).end(page);
});

app.get("/scrappage2", async (req, res) => {
    const pgUrl = req.query.url;
    const videoUrl = req.query.videourl;
    if (!pgUrl || !videoUrl) {
        return res.status(400).send("Missing url or videoUrl parameter");
    }
    try {
        const html = await scrapPage2(pgUrl, videoUrl);
        res.setHeader("Content-Type", "text/plain");
        res.send(html);
    } catch (error) {
        res.status(500).send(`Error: ${error}`);
    }

    // res.status(200).end(page);
});

app.use("/savefrom", savefrom);
app.use("/y2mate", y2mate);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});