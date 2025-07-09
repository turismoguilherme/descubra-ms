
// Request handlers for Delinha AI
import { corsHeaders, OPENAI_API_KEY } from "./config.ts";
import { RequestBody, ResponseBody } from "./types.ts";
import { processKnowledgeBase, formatKnowledgeContent } from "./knowledge.ts";
import { generateCATPrompt, generateTouristPrompt, formatSourcesContext } from "./prompts.ts";
import { callOpenAI } from "./openai.ts";
import { validateRequest, getClientIP } from "./validation.ts";

/**
 * Main request handler for all incoming requests
 */
export async function handleRequest(req: Request): Promise<Response> {
  // Check if API key exists
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not found in environment variables");
  }

  // Get client IP for rate limiting
  const clientIP = getClientIP(req);
  
  // Parse and validate request body
  const requestBody = await req.json();
  const validation = validateRequest(requestBody, clientIP);
  
  if (!validation.isValid) {
    return new Response(
      JSON.stringify({ 
        error: validation.error,
        code: "VALIDATION_ERROR"
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  const { prompt, knowledgeBase = [], userInfo, threadId, useOfficialSources = true } = validation.sanitizedBody!;
  
  // Handle ping test
  if (prompt === "ping") {
    return new Response(
      JSON.stringify({ response: "pong", status: "ok" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  console.log("Processing prompt:", prompt);
  console.log("Knowledge base received:", knowledgeBase.length, "items");
  
  // Process the knowledge base to get the most recent items
  const latestItems = processKnowledgeBase(knowledgeBase);
  
  // Format knowledge content for the AI
  let contextContent = formatKnowledgeContent(latestItems);
  
  // Add information about official sources
  contextContent += formatSourcesContext();

  // Build user context for personalization
  let userContext = "";
  if (userInfo) {
    userContext = `Informações sobre o visitante:\n`;
    if (userInfo.origem) userContext += `- O visitante é de ${userInfo.origem}\n`;
    if (userInfo.interesses && userInfo.interesses.length) 
      userContext += `- Tem interesse em: ${userInfo.interesses.join(", ")}\n`;
    if (userInfo.visitouAnteriormente !== undefined)
      userContext += `- ${userInfo.visitouAnteriormente ? "Já visitou MS antes" : "Nunca visitou MS antes"}\n`;
  }

  // Check if we are in CAT support mode or tourist mode
  const isCAT = userInfo?.origem === "CAT - Sistema de Atendimento";

  // Generate the appropriate system prompt
  const systemPrompt = isCAT 
    ? generateCATPrompt(contextContent, userContext)
    : generateTouristPrompt(contextContent, userContext);

  // Call OpenAI API
  const aiResponse = await callOpenAI(systemPrompt, prompt);

  // For CAT mode, try to extract the source
  let source = "Delinha";
  if (isCAT) {
    // Look for patterns like "Source:" or "Source :" at the end of the text
    const sourceMatch = aiResponse.match(/Fonte:?\s*([^(]*)(\(.*?\))?$/i);
    if (sourceMatch) {
      source = sourceMatch[1].trim();
    }
  }

  // Generate a thread ID if none exists
  const newThreadId = threadId || `thread-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Return formatted response
  return new Response(
    JSON.stringify({
      response: aiResponse,
      threadId: newThreadId,
      source: isCAT ? source : undefined // Only include source for CAT
    } as ResponseBody),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
