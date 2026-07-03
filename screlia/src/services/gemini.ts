import { GoogleGenAI } from "@google/genai";

// Function to get AI instance with dynamic key
export const getAI = (apiKey?: string) => {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("API Key is missing. Please add it in Settings.");
  }
  return new GoogleGenAI({ apiKey: key });
};

// Keep a default instance for backward compatibility if needed, but prefer getAI
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' });

export const MODELS = {
  search: "gemini-3-flash-preview",
  maps: "gemini-2.5-flash",
  chat: "gemini-3.1-pro-preview",
  fast: "gemini-2.5-flash-lite",
  imageGen: "gemini-3-pro-image-preview",
  vision: "gemini-3.1-pro-preview",
  voice: "gemini-2.5-flash-native-audio-preview-09-2025",
};
