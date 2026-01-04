
import { GoogleGenAI, Type } from "@google/genai";
import { WeatherData } from "../types";

export const fetchWeatherWithGemini = async (location: { lat: number; lng: number } | string): Promise<WeatherData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const locationIdentifier = typeof location === 'string' 
    ? `the city of "${location}"` 
    : `coordinates ${location.lat}, ${location.lng}`;

  const prompt = `Provide a comprehensive weather report for ${locationIdentifier}. 
  You must use Google Search to get real-time, accurate information.
  Include:
  1. Current temperature in Celsius, Fahrenheit, and Kelvin.
  2. Wind speed in MPH, KPH, and Meters per second (m/s).
  3. Humidity percentage.
  4. Chance of rain today.
  5. Current Air Quality Index (AQI) for this exact location.
  6. Any active severe weather alerts.
  7. A concise 2-sentence summary of the conditions.
  8. Identify the specific city, state/province, and country.

  Return the data as a clean JSON block followed by a natural language summary.
  The JSON block must follow this structure EXACTLY:
  {
    "tempC": number,
    "tempF": number,
    "tempK": number,
    "condition": "string",
    "windSpeedMph": number,
    "windSpeedKph": number,
    "windSpeedMs": number,
    "humidity": number,
    "rainChance": number,
    "aqi": number,
    "aqiDescription": "string",
    "location": "string",
    "alerts": ["string"],
    "summary": "string"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract sources
    const sources = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || 'Weather Source',
        uri: chunk.web?.uri || '#'
      }));

    // Robust JSON extraction from the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse weather data from AI response.");
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    return {
      ...parsedData,
      sources,
      summary: parsedData.summary || text.split('}').pop()?.trim() || "No summary available."
    };
  } catch (error) {
    console.error("Gemini Weather Error:", error);
    throw error;
  }
};
