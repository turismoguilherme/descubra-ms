import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Mock da API do HubSpot para demonstração
const mockHubSpotAPI = {
  createContact: async (contactData: any) => {
    // Simular criação de contato
    return {
      id: `mock_contact_${Date.now()}`,
      properties: contactData.properties,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },
  
  createDeal: async (dealData: any) => {
    // Simular criação de deal
    return {
      id: `mock_deal_${Date.now()}`,
      properties: dealData.properties,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },
  
  updateDeal: async (dealId: string, dealData: any) => {
    // Simular atualização de deal
    return {
      id: dealId,
      properties: dealData.properties,
      updatedAt: new Date().toISOString()
    };
  },
  
  getContacts: async () => {
    // Simular busca de contatos
    return [
      {
        id: 'mock_contact_1',
        properties: {
          email: 'secretaria.turismo@ms.gov.br',
          firstname: 'Secretaria',
          lastname: 'de Turismo MS',
          company: 'Governo de Mato Grosso do Sul',
          phone: '(67) 3318-9000',
          dealstage: 'qualified',
          amount: '10000'
        }
      },
      {
        id: 'mock_contact_2',
        properties: {
          email: 'turismo@mt.gov.br',
          firstname: 'Secretaria',
          lastname: 'de Turismo MT',
          company: 'Governo de Mato Grosso',
          phone: '(65) 3613-9000',
          dealstage: 'proposal',
          amount: '5000'
        }
      }
    ];
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    let result;
    
    switch (action) {
      case 'create_contact':
        result = await createHubSpotContact(data);
        break;
      case 'create_deal':
        result = await createHubSpotDeal(data);
        break;
      case 'update_deal':
        result = await updateHubSpotDeal(data);
        break;
      case 'sync_contacts':
        result = await syncContactsFromHubSpot(supabase);
        break;
      case 'sync_deals':
        result = await syncDealsFromHubSpot(supabase);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Ação não reconhecida' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error: any) {
    console.error('Erro na Edge Function hubspot-sync:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Funções de manipulação do HubSpot
async function createHubSpotContact(contactData: any) {
  try {
    // Em produção: usar API real do HubSpot
    // const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(contactData)
    // });
    
    const contact = await mockHubSpotAPI.createContact(contactData);
    
    return {
      success: true,
      message: 'Contato criado com sucesso no HubSpot',
      contact: contact
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao criar contato: ${error.message}`,
      error: error
    };
  }
}

async function createHubSpotDeal(dealData: any) {
  try {
    // Em produção: usar API real do HubSpot
    const deal = await mockHubSpotAPI.createDeal(dealData);
    
    return {
      success: true,
      message: 'Deal criado com sucesso no HubSpot',
      deal: deal
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao criar deal: ${error.message}`,
      error: error
    };
  }
}

async function updateHubSpotDeal(dealData: any) {
  try {
    const { dealId, properties } = dealData;
    
    // Em produção: usar API real do HubSpot
    const deal = await mockHubSpotAPI.updateDeal(dealId, { properties });
    
    return {
      success: true,
      message: 'Deal atualizado com sucesso no HubSpot',
      deal: deal
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao atualizar deal: ${error.message}`,
      error: error
    };
  }
}

async function syncContactsFromHubSpot(supabase: any) {
  try {
    // Em produção: buscar contatos reais do HubSpot
    const contacts = await mockHubSpotAPI.getContacts();
    
    // Sincronizar com o Supabase
    const syncResults = [];
    
    for (const contact of contacts) {
      try {
        // Verificar se o contato já existe
        const { data: existingContact } = await supabase
          .from('master_clients')
          .select('id')
          .eq('hubspot_contact_id', contact.id)
          .single();
        
        if (existingContact) {
          // Atualizar contato existente
          const { error } = await supabase
            .from('master_clients')
            .update({
              client_name: `${contact.properties.firstname} ${contact.properties.lastname}`,
              contact_email: contact.properties.email,
              contact_phone: contact.properties.phone,
              company_name: contact.properties.company,
              deal_stage: contact.properties.dealstage,
              deal_amount: parseFloat(contact.properties.amount) || 0,
              updated_at: new Date().toISOString()
            })
            .eq('hubspot_contact_id', contact.id);
          
          if (error) {
            syncResults.push({ contact_id: contact.id, status: 'error', message: error.message });
          } else {
            syncResults.push({ contact_id: contact.id, status: 'updated' });
          }
        } else {
          // Criar novo contato
          const { error } = await supabase
            .from('master_clients')
            .insert({
              hubspot_contact_id: contact.id,
              client_name: `${contact.properties.firstname} ${contact.properties.lastname}`,
              contact_email: contact.properties.email,
              contact_phone: contact.properties.phone,
              company_name: contact.properties.company,
              deal_stage: contact.properties.dealstage,
              deal_amount: parseFloat(contact.properties.amount) || 0,
              status: 'prospect',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (error) {
            syncResults.push({ contact_id: contact.id, status: 'error', message: error.message });
          } else {
            syncResults.push({ contact_id: contact.id, status: 'created' });
          }
        }
      } catch (error: any) {
        syncResults.push({ contact_id: contact.id, status: 'error', message: error.message });
      }
    }
    
    return {
      success: true,
      message: 'Sincronização de contatos concluída',
      results: syncResults,
      total_contacts: contacts.length
    };
    
  } catch (error: any) {
    return {
      success: false,
      message: `Erro na sincronização: ${error.message}`,
      error: error
    };
  }
}

async function syncDealsFromHubSpot(supabase: any) {
  try {
    // Em produção: buscar deals reais do HubSpot
    const contacts = await mockHubSpotAPI.getContacts();
    
    // Simular deals baseados nos contatos
    const deals = contacts.map(contact => ({
      id: `deal_${contact.id}`,
      contact_id: contact.id,
      properties: {
        dealname: `Proposta para ${contact.properties.company}`,
        dealstage: contact.properties.dealstage,
        amount: contact.properties.amount,
        closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
      }
    }));
    
    // Sincronizar deals com o Supabase
    const syncResults = [];
    
    for (const deal of deals) {
      try {
        // Verificar se o deal já existe
        const { data: existingDeal } = await supabase
          .from('master_deals')
          .select('id')
          .eq('hubspot_deal_id', deal.id)
          .single();
        
        if (existingDeal) {
          // Atualizar deal existente
          const { error } = await supabase
            .from('master_deals')
            .update({
              deal_name: deal.properties.dealname,
              deal_stage: deal.properties.dealstage,
              deal_amount: parseFloat(deal.properties.amount) || 0,
              close_date: deal.properties.closedate,
              updated_at: new Date().toISOString()
            })
            .eq('hubspot_deal_id', deal.id);
          
          if (error) {
            syncResults.push({ deal_id: deal.id, status: 'error', message: error.message });
          } else {
            syncResults.push({ deal_id: deal.id, status: 'updated' });
          }
        } else {
          // Criar novo deal
          const { error } = await supabase
            .from('master_deals')
            .insert({
              hubspot_deal_id: deal.id,
              hubspot_contact_id: deal.contact_id,
              deal_name: deal.properties.dealname,
              deal_stage: deal.properties.dealstage,
              deal_amount: parseFloat(deal.properties.amount) || 0,
              close_date: deal.properties.closedate,
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (error) {
            syncResults.push({ deal_id: deal.id, status: 'error', message: error.message });
          } else {
            syncResults.push({ deal_id: deal.id, status: 'created' });
          }
        }
      } catch (error: any) {
        syncResults.push({ deal_id: deal.id, status: 'error', message: error.message });
      }
    }
    
    return {
      success: true,
      message: 'Sincronização de deals concluída',
      results: syncResults,
      total_deals: deals.length
    };
    
  } catch (error: any) {
    return {
      success: false,
      message: `Erro na sincronização de deals: ${error.message}`,
      error: error
    };
  }
}

