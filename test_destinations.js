const SUPABASE_URL = "https://hvtrpkbjgbuypkskqcqm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHJwa2JqZ2J1eXBrc2txY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzIzODgsImV4cCI6MjA2NzYwODM4OH0.gHxmJIedckwQxz89DUHx4odzTbPefFeadW3T7cYcW2Q";

async function checkDestinations() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/destinations?select=id,name&limit=5`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Tabela destinations existe. Destinos encontrados:', data.length);
      console.log('Primeiros destinos:', data);
    } else {
      console.log('❌ Erro ao acessar tabela destinations:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Detalhes do erro:', errorText);
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
  }
}

checkDestinations();


























