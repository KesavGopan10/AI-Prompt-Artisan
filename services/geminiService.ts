import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { EnhancedPrompts } from '../types';
// @ts-ignore: No type definitions for crypto-js
import CryptoJS from 'crypto-js';

const API_KEY_STORAGE_KEY = 'geminiApiKey';
const API_KEY_ENCRYPTION_PASSPHRASE = 'artisan-static-passphrase'; // Change for more security

export function encryptApiKey(apiKey: string): string {
    return CryptoJS.AES.encrypt(apiKey, API_KEY_ENCRYPTION_PASSPHRASE).toString();
}

export function decryptApiKey(encrypted: string): string {
    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, API_KEY_ENCRYPTION_PASSPHRASE);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
        return '';
    }
}

export function getStoredApiKey(): string | null {
    const encrypted = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!encrypted) return null;
    return decryptApiKey(encrypted);
}

export function setStoredApiKey(apiKey: string) {
    const encrypted = encryptApiKey(apiKey);
    localStorage.setItem(API_KEY_STORAGE_KEY, encrypted);
}

function getGeminiAIInstance(): GoogleGenAI {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
        throw new Error("No Gemini API key set. Please add your key in settings.");
    }
    return new GoogleGenAI({ apiKey });
}

const PROMPT_ENHANCEMENT_SYSTEM_INSTRUCTION = `You are a world-class prompt engineering expert. Your task is to take a user's raw input and transform it into multiple, highly-optimized prompts for different AI models.
First, if the input is not in English, translate it to professional English.
Then, based on the translated and refined intent, generate a JSON object with the following structure:
{
  "generic": "A clear, well-structured, general-purpose prompt.Being clear and specific helps the model understand your needs and provide more accurate responses. ",
  "chatbot": "A prompt formatted as a conversational request or system instruction for a large language model like GPT or Gemini Chat.Prompt must be follow all guildlines and best practices.The prompt must be like role,context,do's and don'ts,output format.",
  "image_generation": "A highly descriptive, comma-separated prompt suitable for image generation models like DALL-E, Imagen, or Stable Diffusion, focusing on visual details, style, and composition."
}
Ensure the generated prompts are concise, clear, and follow best practices. Do not include the JSON in a markdown block.
`;

const IMAGE_DESCRIPTION_PROMPT = "Concisely describe this drawing in a short phrase or sentence. This description will be used as a basis for a new AI prompt.";

const CREATIVE_IDEA_PROMPT = `Generate a single, short, and creative prompt idea that would be interesting to visualize or explore. 
For example: 'A cyberpunk city during a neon rainstorm' or 'A magical forest library guarded by a wise owl'. 
Be concise and inspiring. Return only the idea as a string.`;

export const enhancePrompt = async (userInput: string): Promise<EnhancedPrompts> => {
    try {
        const ai = getGeminiAIInstance();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userInput,
            config: {
                systemInstruction: PROMPT_ENHANCEMENT_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
            },
        });

        let jsonStr = (response.text ?? '').trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const parsedData = JSON.parse(jsonStr);
        if (parsedData.generic && parsedData.chatbot && parsedData.image_generation) {
             return parsedData as EnhancedPrompts;
        } else {
            throw new Error("Invalid JSON structure received from API.");
        }
    } catch (error) {
        console.error("Error enhancing prompt:", error);
        throw new Error("Failed to enhance prompt. Please check your input and try again.");
    }
};

export const describeImage = async (base64Image: string): Promise<string> => {
    try {
        const ai = getGeminiAIInstance();
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            },
        };

        const textPart = {
            text: IMAGE_DESCRIPTION_PROMPT,
        };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-Pro",
            contents: { parts: [imagePart, textPart] },
        });
        
        return (response.text ?? '').trim();

    } catch (error) {
        console.error("Error describing image:", error);
        throw new Error("Failed to interpret drawing. Please try again.");
    }
};

export const generateCreativeIdea = async (): Promise<string> => {
    try {
        const ai = getGeminiAIInstance();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: CREATIVE_IDEA_PROMPT,
        });
        return (response.text ?? '').trim().replace(/"/g, ''); // Clean up quotes
    } catch (error) {
        console.error("Error generating creative idea:", error);
        throw new Error("Failed to generate an idea. Please try again.");
    }
}
