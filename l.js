import axios from "axios";
import { load } from "cheerio";
import qs from 'qs';

const ytAud = async (url) => {
    try {
        let BASE_URL = "https://yt1d.com";

        let headers = {
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://yt1d.com",
            "Pragma": "no-cache",
            "Referer": "https://yt1d.com/en/",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            "X-Requested-With": "XMLHttpRequest",
        };

        const postData = qs.stringify({
            url: url,
            ajax: 1,
            lang: "en",
        });

        // First request
        const { data } = await axios.post(
            `${BASE_URL}/mates/en/analyze/ajax?retry=undefined&platform=youtube`,
            postData,
            { headers }
        );

        // Ensure data.result is defined
        if (!data.result) {
            throw new Error('Failed to get result from the first request');
        }

        let $ = load(data.result);
        const href = $('td.text-center a.btn.btn-sm.btn-success').attr('href');

        // Debug: Check if href is found
        console.log("Extracted href:", href);

        if (!href) {
            throw new Error('Download link not found');
        }

        // Second request
        const mp3Response = await axios.get(href, { headers });

        // Load the HTML
        $ = load(mp3Response.data);

      

        // Initialize audioData
        const audioData = {
            url: '',
            title: '',
            id: '',
            ext: '',
            note: '',
            format: '',
            ref: '',
            thumbnail: ''
        };

      
        // Extract all script tags
        $('script').each((i, elem) => {
            const scriptContent = $(elem).html();

            // Extract the specific variables using regex
            ['url', 'title', 'id', 'ext', 'note', 'format', 'ref', 'thumbnail'].forEach(key => {
                const match = new RegExp(`var\\s+${key}\\s*=\\s*'([^']*)';`).exec(scriptContent);
                if (match) {
                    audioData[key] = match[1];
                }
            });
        });

        const convData = qs.stringify({
            platform: "youtube",
            url: audioData.url,
            title: audioData.title,
            id: audioData.id,
            ext: audioData.ext,
            note: audioData.note,
            format: '',
        });

        headers = {
            ...headers,
            'X-Note': '128k',
        };

        await new Promise(resolve => setTimeout(resolve, 2000));
BASE_URL = "https://sss.instasaverpro.com"
      let mp3 = await axios.post(
            `${BASE_URL}/mates/en/convert?id=${audioData.id}`,
            convData,
            { headers: headers }
        );

        let status = await axios.post(
            `${BASE_URL}/mates/en/convert/status?id=${audioData.id}`,
            convData,
            { headers: headers }
        );

        let retries = 0;
        const maxRetries = 10;

        while ((mp3.data === null || mp3.data.status !== "success") && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log("Retrying...");

            status = await axios.post(
                `${BASE_URL}/mates/en/convert/status?id=${vidId}`,
                convData,
                { headers: headers }
            );

            mp3 = await axios.post(
                `${BASE_URL}/mates/en/convert?id=${vidId}`,
                convData,
                { headers: headers }
            );

            console.log(mp3.data);
            retries++;
        }

        if (retries === maxRetries) {
            console.log("Max retries reached, conversion failed.");
            return { success: false, data:  "Max retries reached, conversion failed."};
            return;
        }
        if(mp3.data.downloadUrlX) return { success: true, data: mp3.data.downloadUrlX }
    } catch (error) {
        console.error("An error occurred:", error.message);
        return { success: false, data: error.message };
    }
};

// Test the function
ytAud('https://youtube.com/shorts/4BC5hcz1UVM?si=VM_RH-M8leuh0Ti1');
