import {Search} from './anime.js'
import axios from 'axios'
import * as cheerio from 'cheerio'
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
import chrome from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import _ from 'lodash';
import fs from 'fs'

import fakeUa from "fake-useragent";
const production = process.env.NODE_ENV === "production";

const autoComplete = new Map();

let autoComplete_q = async (query) => {
    let headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Origin': 'https://rule34.xxx',
        'Pragma': 'no-cache',
        'Referer': 'https://rule34.xxx/',
        'Sec-Ch-Ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    };

    let response = await axios.get(`https://rule34.xxx/autocomplete.php?q=${query}`, {  });
    let data = response.data;

  

    // Populate the autoComplete map with the fetched data
    data.forEach((sugg, index) => {
        autoComplete.set(index, {
            label: sugg.label,
            value: sugg.value,
            type: sugg.type
        });
    });

    // Find the first match in the array of values
    let match 
    let checkMatch =  Array.from(autoComplete.values()).find(a => a.value.match(new RegExp(query, 'i')));
   
    if(checkMatch){
        match = checkMatch
    }else{
        match = Array.from(autoComplete.values())[0].value
    }

    // Return the matched value if found, otherwise return null
    console.log(match.value)
    return match ? match.value : null;
};

const getCookie = async (pgUrl) => {
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
  
    
    await page.goto("https://www.youtube.com/", {
        waitUntil: "domcontentloaded",
        timeout: 30000,
    });
    await delay(3000);
    const cookies = await page.cookies();
    

/*     const html = await page.evaluate(
        () => document.querySelector("*").outerHTML,
    );
 */
    await browser.close();
    fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
    console.log(cookies)
    return cookies;
};


async function r34(params) {
    let pid = 42
 
    let sites = {
       gelbooru: "https://gelbooru.com/index.php?page=post&s=list&tags=",
       r34 : "https://rule34.xxx/index.php?page=post&s=list&tags=",
       xbooru:"https://xbooru.com/index.php?page=post&s=list&tags=",
       realbooru:"https://realbooru.com/index.php?page=post&s=list&tags=",
    }
    let data = await axios.get(
        `https://puppeteer-liard.vercel.app/scrappage?url=${encodeURIComponent(
          `https://realbooru.com/index.php?page=post&s=list&tags=${await autoComplete_q("raiden")}`
        )}`
      );
      
      

    console.log(data.config.url)
      
    const $ =  cheerio.load(data.data)
    let imageUrls = [];
    let imageUrls2 = []
    
    //R34
/* $('.image-list .thumb img').each((index, element) => {
    let imgUrl = $(element).attr('src');
    "https://wimg.rule34.xxx//images/2241/a9a5599a2e2d84828181ed26b0e149a8.png?11090428"
    let img = imgUrl.replace("thumbnails","/images").replace(".jpg",".jpeg").replace("thumbnail_","").replace("us.","wimg.").split("?")[0] //Some Imges are png as well and jpg as wll
    imageUrls2.push(img);
}); */


   //RealBooru
$('.col.thumb').each((index, element) => {
    const url = $(element).find('a').attr('href');
    const tags = $(element).find('img').attr('title');
    const src = $(element).find('img').attr('src');

    let img = src.replace("thumbnails","/images").replace(".jpg",".jpeg").replace("thumbnail_","")

    imageUrls.push(img);
});

 
    
console.log(imageUrls)
}

//r34()

//autoComplete_q("raiden")
 
getCookie()