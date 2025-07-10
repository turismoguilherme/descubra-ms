import { SupabaseClient, createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// TODO: Use Deno's .env functionality to load these from a .env file
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const openAIApiKey = Deno.env.get('OPENAI_API_KEY') ?? '';

export async function mainRequestHandler(req: Request) {
  const { prompt } = await req.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Prompt is required' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: req.headers.get('Authorization')! },
    },
  });

  const { data: interactions, error } = await supabaseClient
    .from('user_interactions')
    .select('*')
    .limit(10)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching interactions:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch interaction data' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
  
  // TODO: Implement actual OpenAI call
  // This is a mocked response for now.
  const mockedResponse = {
    content: `Com base nos dados de interação recentes, notei um forte engajamento com destinos na região de Bonito. A sua pergunta foi: "${prompt}". A análise sugere que campanhas focadas em ecoturismo nessa área podem ter um ótimo retorno.`
  };

  return new Response(JSON.stringify(mockedResponse), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
} 