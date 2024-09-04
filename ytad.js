import axios from "axios";
import { load } from "cheerio";
import qs from 'qs';

const ytAud = async (url) => {
    try {
        const BASE_URL = "https://yt1d.com";

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

        const PostData = qs.stringify({
            url: url,
            ajax: 1,
            lang: "en",
        });

        const vidId = url.split("v=")[1];
        const { data } = await axios.post(
            `${BASE_URL}/mates/en/analyze/ajax?retry=undefined&platform=youtube`,
            PostData,
            { headers: headers }
        );

        let $ = load(data.result);
   

        const href = $('td.text-center a.btn.btn-sm.btn-success').attr('href');

      let mp3 = await axios.get(href,{headers})
     

       $ = load(mp3.data)
       let mp3_url = $('#A_downloadUrl').attr('href');
       console.log(mp3_url)

      /*  
           const title = $("#video_title").text().trim();




        const button = $('button.btn-success');
      const onclickValue = button.attr('onclick');
        const params = onclickValue.match(/download\((.*)\)/)[1]
            .split(/,(?=(?:[^']*'[^']*')*[^']*$)/)
            .map(param => param.trim().replace(/^'|'$/g, ''));

        const extractedData = {
            videoURL: params[0],
            videoTitle: params[1],
            videoID: params[2],
            fileType: params[3],
            fileSize: params[4],
            quality: params[5],
            extraParam: params[6]
        };

        if (!title) {
            console.log("Failed to extract video title.");
            return;
        }

        const convData = qs.stringify({
            platform: "youtube",
            url: url,
            title: title,
            id: extractedData.videoID,
            ext: "mp3",
            note: "128k",
            format: '',
        });

        headers = {
            ...headers,
            'X-Note': '128k',
        };

        await new Promise(resolve => setTimeout(resolve, 2000));

      let mp3 = await axios.post(
            `${BASE_URL}/mates/en/convert?id=${vidId}`,
            convData,
            { headers: headers }
        );

        let status = await axios.post(
            `${BASE_URL}/mates/en/convert/status?id=${vidId}`,
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

        console.log("Conversion successful:", mp3.data);
        return { success: true, data: mp3.data.downloadUrlX }; */

    } catch (error) {
        console.error("An error occurred:", error.message);
        return { success: false, data: error.message };
    }
};

ytAud('https://youtube.com/shorts/4BC5hcz1UVM?si=VM_RH-M8leuh0Ti1');
