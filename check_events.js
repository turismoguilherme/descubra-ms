import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hvtrpkbjgbuypkskqcqm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub24iLCJpYXQiOjE3NTIwMzIzODgsImV4cCI6MjA2NzYwODM4OH0.gHxmJIedckwQxz89DUHx4odzTbPefFeadW3T7cYcW2Q'
);

async function checkEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, name, video_url, logo_evento, image_url, is_visible')
      .eq('is_visible', true)
      .limit(5);

    if (error) {
      console.error('Erro:', error);
    } else {
      console.log('Eventos encontrados:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Erro inesperado:', error);
  }
}

checkEvents();