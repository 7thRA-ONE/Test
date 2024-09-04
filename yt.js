 

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
import yts from "yt-search";
import axios from "axios";
/**
* Scraped By Kaviaann
* Protected By MIT LICENSE
* Whoever caught removing wm will be sued
* @description Any Request? Contact me : vielynian@gmail.com
* @author Kaviaann 2024
* @copyright https://whatsapp.com/channel/0029Vac0YNgAjPXNKPXCvE2e
*/
export function youtube(data) {
  return __awaiter(this, void 0, void 0, function* () {
      return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
          var _a;
          try {
              data = data.trim();
              !data &&
                  (() => {
                      return reject("Enter either a youtube link for downloading, or query for searching");
                  })();
              const yt = /youtu(\.)?be/gi.test(data);
              if (!yt) {
                  const d = yield yts(data).then((v) => v.videos);
                  return resolve({
                      type: "search",
                      query: data,
                      total: d.length || 0,
                      videos: d.map(({ videoId, views, url, title, description, image, thumbnail, seconds, timestamp, ago, author, }) => {
                          return {
                              title,
                              id: videoId,
                              url,
                              media: {
                                  thumbnail: thumbnail || "",
                                  image: image,
                              },
                              description,
                              duration: {
                                  seconds,
                                  timestamp,
                              },
                              published: ago,
                              views,
                              author,
                          };
                      }),
                  });
              }
              else {
                  const id = ((_a = /(?:youtu\.be\/|youtube\.com(?:\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/|embed\/|v\/|m\/|watch\?(?:[^=]+=[^&]+&)*?v=))([^"&?\/\s]{11})/gm.exec(data)) === null || _a === void 0 ? void 0 : _a[1]) || "";
                  if (!id)
                      return reject("Enter valid youtube video link!");
                  const { title, description, url, videoId, seconds, timestamp, views, genre, uploadDate, ago, image, thumbnail, author, } = yield yts({
                      videoId: id,
                  });
                  return resolve({
                      type: "download",
                      download: {
                          title,
                          description,
                          url,
                          id: videoId,
                          duration: {
                              seconds,
                              timestamp,
                          },
                          views,
                          genre,
                          releaseDate: uploadDate,
                          published: ago,
                          media: {
                              thumbnail,
                              image,
                          },
                          author,
                          video: (...args_1) => __awaiter(this, [...args_1], void 0, function* (quality = "") {
                              return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                                  try {
                                      yield axios
                                          .post("https://api.cobalt.tools/api/json", {
                                          url: "https://youtube.com/watch?v=" + id,
                                          filenamePattern: "basic",
                                          vQuality: quality,
                                      }, {
                                          headers: {
                                              Accept: "application/json",
                                              origin: "https://cobalt.tools",
                                              referer: "https://cobalt.tools/",
                                              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                                          },
                                      })
                                          .then((v) => v.data)
                                          .then((v) => __awaiter(this, void 0, void 0, function* () {
                                          if (v.status !== "stream")
                                              return rej("Fail to get stream for the audio!");
                                          const _ = yield axios
                                              .get(v.url +
                                              "&" +
                                              new URLSearchParams({
                                                  p: "1",
                                              }))
                                              .then((v) => v.data);
                                          if (_.status !== "continue")
                                              return rej("Fail to check the audio stream");
                                          return res(v.url);
                                      }));
                                  }
                                  catch (e) {
                                      return rej(e);
                                  }
                              }));
                          }),
                          audio: (...args_2) => __awaiter(this, [...args_2], void 0, function* (format = "ogg") {
                              return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                                  try {
                                      yield axios
                                          .post("https://api.cobalt.tools/api/json", {
                                          url: "https://youtube.com/watch?v=" + id,
                                          filenamePattern: "basic",
                                          aFormat: format,
                                          isAudioOnly: "true",
                                      }, {
                                          headers: {
                                              Accept: "application/json",
                                              origin: "https://cobalt.tools",
                                              referer: "https://cobalt.tools/",
                                              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                                          },
                                      })
                                          .then((v) => v.data)
                                          .then((v) => __awaiter(this, void 0, void 0, function* () {
                                          if (v.status !== "stream")
                                              return rej("Fail to get stream for the audio!");
                                          const _ = yield axios
                                              .get(v.url +
                                              "&" +
                                              new URLSearchParams({
                                                  p: "1",
                                              }))
                                              .then((v) => v.data);
                                          if (_.status !== "continue")
                                              return rej("Fail to check the audio stream");
                                          return res(v.url);
                                      }));
                                  }
                                  catch (e) {
                                      return rej(e);
                                  }
                              }));
                          }),
                      },
                  });
              }
          }
          catch (e) {
              return reject(e);
          }
      }));
  });
}


 

(async () => {

  // ? Youtube Search
  console.log(await youtube(
      "free fire old theme"
    ));

  // ? Youtube Download

  let yt = await youtube("free fire old theme").then(async audio=>{
    return  await audio.download.audio("mp3")}
  )
 
  console.log(yt)
 
 // console.log(await youtube.download.video('https://youtu.be/ujPDRl1q-dw?si=j8ilHBBpwymfCM74'))
 /*  await youtube(
    "https://youtu.be/ujPDRl1q-dw?si=j8ilHBBpwymfCM74"
  ).then(async v => {
     // ? Show all
     console.log(v)

     // ? Show Metadata
     console.log(v.download)

     // ? Show video url & you can input custom resolution
     console.log(await v.download.video('720p'))

     // ? Show audio url & you can input custom format
     console.log(await v.download.audio('ogg'))
  }) */
})();
 


 "https://realbooru.com//images/76/d7/76d7aa61675af92ec6124d150370246c.jpeg"


 