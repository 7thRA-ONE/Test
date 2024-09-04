import * as Prodia from "prodia.js";
import fetch from "node-fetch";
import _ from "lodash";

// Define the API key
const apiKey = "ae9d60f9-8a5c-4a9c-895d-b6f2bcf70d86";

// Initialize the Prodia client with the provided API key
const prodiaClient = Prodia.Prodia(apiKey);

// Function to pick a random element from a list
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Main function to process the image
async function prodia() {
  try {
    // Fetch the models and samplers
    const models = await tryModule(() => prodiaClient.getModels(), getModels);
    const samplers = await tryModule(() => prodiaClient.getSamplers(), getSamplers);

    //console.log(samplers)
    console.log(models)

    if (!models || !samplers) {
      throw new Error("Failed to retrieve models or samplers");
    }

    const POS_PPT = `highly detailed, beautiful, well-proportioned, realistic, sharp focus, clear, high resolution, accurate anatomy, expressive eyes, elegant hands, symmetrical, balanced lighting, vibrant colors, well-defined features, harmonious composition, photorealistic, intricate details, dynamic poses, natural expressions, attractive face, ideal body shape, smooth skin, high-quality textures, precise lines, perfect hair, stylish clothing, 4k`;

    // URL of the image to be processed
    const fileUrl = "https://i.pinimg.com/564x/a6/5d/0a/a65d0ad7d8c34a85e116f0cf7e2961f8.jpg";

    // Prompt text for the image transformation
    const promptText = `Add anime type style and illustration to this image, ${POS_PPT}`;

    if (!promptText) {
      return console.log(
        "Please enter an effect request!\n*Example:*\n🖼️ `.img2img [number]|[request]`"
      );
    }

    // Create a list of models with their titles and IDs
    const modelsList = models.map((item) => ({
      title: item.replace(/[_-]/g, " ").replace(/\..*/, ""),
      id: item,
    }));
   // console.log(modelsList)

    // Determine model number and validate it
    const modelNumber = null; // Replace this with the actual model number input
    if (!modelNumber || isNaN(modelNumber) || modelNumber > modelsList.length) {
/*       return console.log(
        "Please enter a valid number from the list:\n" +
          modelsList.map(
            (item, index) => `"*${index + 1}.* ${item.title}",`
          ).join("\n")
      ); */
    }

    // Select the model based on the provided number
    const selectedModel = modelsList[modelNumber - 1]?.id;
    if (!selectedModel) {
      throw new Error("Invalid model selection");
    }

    const NEG_PPT = `poorly detailed, text on image, ugly, deformed, noisy, blurry, distorted, low quality, bad anatomy, extra limbs, extra fingers, poorly drawn hands, disfigured, tiling, mutated, low resolution, unrealistic proportions, inconsistent lighting, clipping, watermarks, text, signature, closed eyes, glitches, unattractive face, overweight, off-scene elements, incomplete details, open mouth, flawed facial features, defective physical characteristics, poorly rendered hair, clothing, or body parts`;

    // Set up the parameters for generating the image with HD resolution
    const generateImageParams = {
      imageUrl: fileUrl,
      prompt: encodeURIComponent(promptText),
      negative_prompt: NEG_PPT,
      denoising_strength: 0.9,
      model: selectedModel,
      sampler: pickRandom(samplers),
      style_preset: "anime",
      cfg_scale: 9,
      seed: -1,
      upscale: true,
      steps: 30,
      width: 512,
      height: 768,
    //   width: 720, // HD resolution width
    //   height: 1024, // HD resolution height
    };

    // Generate the image
    const openAIResponse = await generateImage(generateImageParams);

    if (openAIResponse) {
      console.log(openAIResponse);
    } else {
      console.log("No response from Prodia or an error occurred.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Function to generate the image
async function generateImage(params) {
  const generate = await prodiaClient.transform(params);
  while (generate.status !== "succeeded" && generate.status !== "failed") {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const job = await prodiaClient.getJob(generate.job);
    if (job.status === "succeeded") return job;
  }
  return null;
}

// Function to try using the primary module, fallback to an alternate if it fails
async function tryModule(primaryModuleFn, alternateFn) {
  try {
    return (await primaryModuleFn()) ?? (await alternateFn());
  } catch (error) {
    console.error("Error using primary module, trying alternate:", error);
    return await alternateFn();
  }
}

// Function to get models by scraping the Prodia documentation
async function getModels() {
  try {
    const response = await fetch("https://docs.prodia.com/reference/transform");
    const html = await response.text();
    const jsonRegex = /{&quot;[^{}]*}/g;
    const allJSON = (html.match(jsonRegex) || []).map((match) =>
      JSON.parse(match.replace(/&quot;/g, '"'))
    );
    return allJSON.filter((obj) => _.has(obj, "enum"));
  } catch (error) {
    console.error("Error fetching or filtering JSON:", error);
    return null;
  }
}

// Function to get samplers by scraping the Prodia documentation
async function getSamplers() {
  try {
    const response = await fetch("https://docs.prodia.com/reference/samplers");
    const html = await response.text();
    const jsonRegex = /{&quot;[^{}]*}/g;
    const allJSON = (html.match(jsonRegex) || []).map((match) =>
      JSON.parse(match.replace(/&quot;/g, '"'))
    );
    return allJSON;
  } catch (error) {
    console.error("Error fetching samplers:", error);
    return null;
  }
}

// Run the main function
prodia();
