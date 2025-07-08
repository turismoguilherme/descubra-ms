
// OpenAI integration
import { OPENAI_API_KEY } from "./config.ts";
import { AI_CONFIG } from "./config.ts";

/**
 * Call OpenAI API with the given system prompt and user prompt
 */
export async function callOpenAI(systemPrompt: string, userPrompt: string) {
  // Ensure API key is available
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not found in environment variables");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokens
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Error from OpenAI API:", errorData);
    throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
