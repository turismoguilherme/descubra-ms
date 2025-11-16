
// Delinha AI - Edge Function for processing tourism queries
// Main entry point that coordinates all modules

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleRequest } from "./handlers.ts";
import { corsHeaders } from "./config.ts";

// Handle all requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    return await handleRequest(req);
  } catch (error) {
    console.error("Unhandled error in Delinha AI:", error);
    
    return new Response(
      JSON.stringify({ 
      error: `Erro ao processar sua solicitação: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error instanceof Error ? error.toString() : String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
