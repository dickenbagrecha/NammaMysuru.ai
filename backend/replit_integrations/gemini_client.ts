import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "dummy_api_key";
if (!process.env.GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Gemini AI features will fail until a valid key is provided in .env");
}

const genAI = new GoogleGenerativeAI(apiKey);

const textModelName = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

export const model = genAI.getGenerativeModel({ 
    model: textModelName,
    generationConfig: {
        temperature: 0.7,
        topP: 0.95,
    }
});

export const plainTextModel = genAI.getGenerativeModel({
    model: textModelName,
    generationConfig: { 
        responseMimeType: "text/plain",
        temperature: 0.7,
        topP: 0.95,
    }
});
