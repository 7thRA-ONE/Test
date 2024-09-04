import yts from "yt-search";
import axios from "axios";

// Helper function for extracting YouTube video ID from URL
function extractVideoId(url) {
    const regex = /(?:youtu\.be\/|youtube\.com(?:\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/|embed\/|v\/|m\/|watch\?(?:[^=]+=[^&]+&)*?v=))([^"&?\/\s]{11})/gm;
    const match = regex.exec(url);
    return match ? match[1] : null;
  }
  
  // Main function to search or download from YouTube
  async function youtube(data) {
    return new Promise(async (resolve, reject) => {
      try {
        data = data.trim();
  
        if (!data) {
          return reject("Please provide a YouTube link or a search query.");
        }
  
        const isYouTubeLink = /youtu(\.)?be/gi.test(data);
  
        if (!isYouTubeLink) {
          // Search Mode
          const results = await yts(data);
          const videos = results.videos.map(video => ({
            title: video.title,
            id: video.videoId,
            url: video.url,
            media: {
              thumbnail: video.thumbnail || "",
              image: video.image,
            },
            description: video.description,
            duration: {
              seconds: video.seconds,
              timestamp: video.timestamp,
            },
            published: video.ago,
            views: video.views,
            author: video.author,
          }));
  
          return resolve({
            type: "search",
            query: data,
            total: videos.length,
            videos,
          });
        } else {
          // Download Mode
          const videoId = extractVideoId(data);
  
          if (!videoId) {
            return reject("Invalid YouTube video link!");
          }
  
          const videoInfo = await yts({ videoId });
  
          const downloadMethods = {
            video: async (quality = "") => {
              return await downloadMedia(videoId, false, quality);
            },
            audio: async (format = "ogg") => {
              return await downloadMedia(videoId, true, format);
            },
          };
  
          return resolve({
            type: "download",
            download: {
              ...videoInfo,
              media: {
                thumbnail: videoInfo.thumbnail,
                image: videoInfo.image,
              },
              author: videoInfo.author,
              video: downloadMethods.video,
              audio: downloadMethods.audio,
            },
          });
        }
      } catch (error) {
        return reject(error.message || "An error occurred during processing.");
      }
    });
  }
  
  // Helper function for downloading media
  async function downloadMedia(id, isAudioOnly, formatOrQuality) {
    try {
      const payload = {
        url: `https://youtube.com/watch?v=${id}`,
        filenamePattern: "basic",
        ...(isAudioOnly ? { aFormat: formatOrQuality, isAudioOnly: "true" } : { vQuality: formatOrQuality }),
      };
  
      const response = await axios.post("https://api.cobalt.tools/api/json", payload, {
        headers: {
          Accept: "application/json",
          origin: "https://cobalt.tools",
          referer: "https://cobalt.tools/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        },
      });
  
      if (response.data.status !== "stream") {
        throw new Error("Failed to get stream for the media!");
      }
  
      const checkResponse = await axios.get(response.data.url + "&" + new URLSearchParams({ p: "1" }));
  
      if (checkResponse.data.status !== "continue") {
        throw new Error("Failed to verify the media stream");
      }
  
      return response.data.url;
    } catch (error) {
      throw new Error(error.message || "An error occurred during media download.");
    }
  }

  youtube
  ("https://youtube.com/watch?v=n5dfzbZt4S0").then(async (result) => {
    if (result.type === "download") {
      const videoUrl = await result.download.video("720p"); // Download video at 720p
      const audioUrl = await result.download.audio("mp3");  // Download audio as mp3
      console.log("Video URL:", videoUrl);
      console.log("Audio URL:", audioUrl);
    }
  }).catch(console.error);
  