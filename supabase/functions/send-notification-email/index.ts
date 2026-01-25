import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Tipos de notificação
type NotificationType = 
  | 'event_approved'
  | 'event_rejected'
  | 'event_payment_confirmed'
  | 'event_refunded'
  | 'partner_approved'
  | 'partner_rejected'
  | 'partner_welcome'
  | 'stripe_connect_complete'
  | 'reservation_payment_received'
  | 'welcome'
  | 'welcome_subscription'
  | 'system_alert'
  | 'data_report_ready'
  | 'data_report_approved'
  | 'partner_notification';

interface EmailRequest {
  type: NotificationType;
  to: string;
  data: Record<string, any>;
  reply_to?: string; // Opcional: endereço para respostas
}

// Templates de email
const templates: Record<NotificationType, { subject: string | ((data: any) => string); html: (data: any) => string }> = {
  event_approved: {
    subject: '✅ Seu evento foi aprovado! - Descubra MS',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #1e3a5f, #2d8a8a); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Descubra MS</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #1e3a5f;">Parabéns! Seu evento foi aprovado! 🎉</h2>
          <p>Olá, <strong>${data.organizerName || 'Organizador'}</strong>!</p>
          <p>Temos o prazer de informar que o evento <strong>"${data.eventName}"</strong> foi aprovado e já está visível no calendário de eventos do Descubra MS.</p>
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>📅 Data:</strong> ${data.eventDate}</p>
            <p><strong>📍 Local:</strong> ${data.eventLocation}</p>
          </div>
          <a href="https://descubrams.com/descubrams/eventos/status/${data.eventId || ''}" 
             style="display: inline-block; background: #1e3a5f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Ver Status do Evento
          </a>
          <a href="https://descubramatogrossodosul.com.br/descubramatogrossodosul/eventos" 
             style="display: inline-block; background: #2d8a8a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 10px; margin-left: 10px;">
            Ver no Calendário
          </a>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Descubra Mato Grosso do Sul - Turismo e Cultura</p>
        </div>
      </div>
    `,
  },
  event_rejected: {
    subject: 'Sobre seu evento - Descubra MS',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a5f; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Descubra MS</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1e3a5f;">Sobre seu evento</h2>
          <p>Olá, <strong>${data.organizerName || 'Organizador'}</strong>!</p>
          <p>Infelizmente, o evento <strong>"${data.eventName}"</strong> não pôde ser aprovado no momento.</p>
          ${data.reason ? `<p><strong>Motivo:</strong> ${data.reason}</p>` : ''}
          <p>Você pode entrar em contato conosco para mais informações ou enviar um novo evento.</p>
          <a href="https://descubrams.com/descubrams/eventos/status/${data.eventId || ''}" 
             style="display: inline-block; background: #1e3a5f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Ver Status do Evento
          </a>
          <a href="https://descubramatogrossodosul.com.br/descubramatogrossodosul/cadastrar-evento" 
             style="display: inline-block; background: #2d8a8a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 10px; margin-left: 10px;">
            Cadastrar Novo Evento
          </a>
        </div>
      </div>
    `,
  },
  event_payment_confirmed: {
    subject: '💳 Pagamento confirmado - Evento Em Destaque! - Descubra MS',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #f59e0b, #f97316); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">⭐ Evento Em Destaque!</h1>
        </div>
        <div style="padding: 30px; background: #fffbeb;">
          <h2 style="color: #92400e;">Pagamento confirmado!</h2>
          <p>Olá, <strong>${data.organizerName || 'Organizador'}</strong>!</p>
          <p>O pagamento do seu evento <strong>"${data.eventName}"</strong> foi confirmado com sucesso!</p>
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #f59e0b;">
            <p><strong>🌟 Status:</strong> Em Destaque</p>
            <p><strong>📅 Válido até:</strong> ${data.validUntil}</p>
            <p><strong>💰 Valor:</strong> R$ 499,90</p>
          </div>
          <p>Seu evento agora aparece com destaque especial no calendário!</p>
          <a href="https://descubramatogrossodosul.com.br/descubramatogrossodosul/eventos" 
             style="display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Ver Meu Evento
          </a>
        </div>
      </div>
    `,
  },
  event_refunded: {
    subject: '💰 Reembolso processado - Descubra MS',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #dc2626, #ef4444); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Reembolso Processado</h1>
        </div>
        <div style="padding: 30px; background: #fef2f2;">
          <h2 style="color: #991b1b;">Reembolso do seu pagamento</h2>
          <p>Olá, <strong>${data.organizerName || 'Organizador'}</strong>!</p>
          <p>Informamos que o pagamento do evento <strong>"${data.eventName}"</strong> foi reembolsado.</p>
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #dc2626;">
            <p><strong>💰 Valor reembolsado:</strong> R$ ${data.refundAmount?.toFixed(2) || '479,57'}</p>
            <p className="text-xs text-gray-500 mt-1">* Valor líquido (taxa de processamento não reembolsada conforme política do Stripe)</p>
            ${data.reason ? `<p><strong>📝 Motivo:</strong> ${data.reason}</p>` : ''}
            <p><strong>⏰ Processado em:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          <p>O valor será creditado na sua conta em até 5-10 dias úteis, dependendo do método de pagamento utilizado.</p>
          <p>Se você tiver dúvidas sobre este reembolso, entre em contato conosco.</p>
          <a href="https://descubramatogrossodosul.com.br/contato" 
             style="display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Entrar em Contato
          </a>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Descubra Mato Grosso do Sul - Turismo e Cultura</p>
        </div>
      </div>
    `,
  },
  partner_approved: {
    subject: '🤝 Parceria aprovada! - Descubra MS',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #1e3a5f, #22c55e); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Bem-vindo, Parceiro!</h1>
        </div>
        <div style="padding: 30px; background: #f0fdf4;">
          <h2 style="color: #166534;">Sua parceria foi aprovada! 🎉</h2>
          <p>Olá!</p>
          <p>Temos o prazer de informar que <strong>"${data.partnerName}"</strong> agora faz parte da rede de parceiros do Descubra MS!</p>
          <p>Seu estabelecimento já está visível para milhares de turistas que visitam nossa plataforma.</p>
          <a href="https://descubramatogrossodosul.com.br/descubramatogrossodosul/parceiros" 
             style="display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Ver Minha Página
          </a>
        </div>
      </div>
    `,
  },
  partner_rejected: {
    subject: 'Sobre sua solicitação de parceria - Descubra MS',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a5f; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Descubra MS</h1>
        </div>
        <div style="padding: 30px;">
          <h2>Sobre sua solicitação</h2>
          <p>Olá!</p>
          <p>Infelizmente, a solicitação de parceria de <strong>"${data.partnerName}"</strong> não pôde ser aprovada no momento.</p>
          ${data.reason ? `<p><strong>Motivo:</strong> ${data.reason}</p>` : ''}
          <p>Você pode entrar em contato conosco para mais informações.</p>
        </div>
      </div>
    `,
  },
  welcome: {
    subject: 'Bem-vindo ao Descubra MS! 🌿',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #1e3a5f, #2d8a8a, #22c55e); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Descubra Mato Grosso do Sul</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1e3a5f;">Bem-vindo(a), ${data.userName || 'Viajante'}! 🌿</h2>
          <p>Estamos muito felizes em ter você conosco!</p>
          <p>O Descubra MS é sua porta de entrada para as maravilhas de Mato Grosso do Sul:</p>
          <ul>
            <li>🐆 Pantanal - A maior planície alagável do mundo</li>
            <li>💎 Bonito - Águas cristalinas e natureza preservada</li>
            <li>🏛️ História e Cultura de nossa gente</li>
          </ul>
          <a href="https://descubramatogrossodosul.com.br/descubramatogrossodosul" 
             style="display: inline-block; background: #1e3a5f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Começar a Explorar
          </a>
        </div>
      </div>
    `,
  },
  system_alert: {
    subject: '🚨 Alerta do Sistema - Descubra MS',
    html: (data: any) => {
      const severityColors: Record<string, string> = {
        critical: '#dc2626',
        high: '#ea580c',
        medium: '#f59e0b',
        low: '#3b82f6',
      };
      const severityColor = severityColors[data.severity] || '#6b7280';
      const alertIcon = data.alert_type === 'error' ? '🔴' : data.alert_type === 'warning' ? '⚠️' : 'ℹ️';
      
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${severityColor}; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">${alertIcon} Alerta do Sistema</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: ${severityColor}; margin-top: 0;">${data.service_name || 'Serviço'} - ${data.severity?.toUpperCase() || 'ALERTA'}</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${severityColor}; margin: 20px 0;">
              <p style="font-size: 16px; margin: 0;"><strong>${data.message || 'Alerta do sistema'}</strong></p>
            </div>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Serviço:</strong> ${data.service_name || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Tipo:</strong> ${data.alert_type || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Severidade:</strong> ${data.severity || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Data/Hora:</strong> ${data.timestamp ? new Date(data.timestamp).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')}</p>
            </div>
            <a href="https://descubramatogrossodosul.com.br/viajar/admin/system/health" 
               style="display: inline-block; background: ${severityColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
              Ver Detalhes no Painel Admin
            </a>
          </div>
          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px; background: #f9fafb;">
            <p>Este é um email automático do sistema de monitoramento do Descubra MS.</p>
            <p>Para gerenciar suas preferências de alertas, acesse o painel administrativo.</p>
          </div>
        </div>
      `;
    },
  },
  data_report_approved: {
    subject: '✅ Solicitação de Relatório Aprovada - ViajARTur',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #1e3a5f, #2d8a8a); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">ViajARTur</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #1e3a5f;">Sua solicitação foi aprovada! ✅</h2>
          <p>Olá, <strong>${data.requesterName || 'Cliente'}</strong>!</p>
          <p>Sua solicitação de relatório de dados de turismo foi aprovada e está pronta para pagamento.</p>
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <p><strong>📊 Tipo de Relatório:</strong> ${data.reportType === 'explanatory' ? 'Dados Tratados' : data.reportType === 'raw_data' ? 'Dados Brutos' : 'Tratados + Brutos'}</p>
            <p><strong>📅 Período:</strong> ${data.periodStart} a ${data.periodEnd}</p>
            <p><strong>💰 Valor:</strong> R$ ${data.price || '300,00'}</p>
          </div>
          <p>Para finalizar e receber seu relatório, clique no botão abaixo para realizar o pagamento:</p>
          ${data.checkoutUrl ? `
            <a href="${data.checkoutUrl}" 
               style="display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">
              💳 Realizar Pagamento
            </a>
          ` : ''}
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            Após o pagamento confirmado, seu relatório será gerado e enviado por email em até 24 horas.
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>ViajARTur - Plataforma de Inteligência Turística</p>
        </div>
      </div>
    `,
  },
  data_report_ready: {
    subject: '📊 Seu Relatório de Dados está Pronto! - ViajARTur',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #1e3a5f, #2d8a8a); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">ViajARTur</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #1e3a5f;">Seu relatório está pronto! 📊</h2>
          <p>Olá, <strong>${data.requesterName || 'Cliente'}</strong>!</p>
          <p>Seu relatório de dados de turismo foi gerado com sucesso e está disponível para download.</p>
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <p><strong>📊 Tipo de Relatório:</strong> ${data.reportType === 'explanatory' ? 'Dados Tratados' : data.reportType === 'raw_data' ? 'Dados Brutos' : 'Tratados + Brutos'}</p>
            <p><strong>📅 Período:</strong> ${data.periodStart} a ${data.periodEnd}</p>
            <p><strong>📈 Total de Registros:</strong> ${data.totalRecords?.toLocaleString('pt-BR') || 'N/A'}</p>
          </div>
          <div style="margin: 20px 0;">
            ${data.reportUrl ? `
              <a href="${data.reportUrl}" 
                 style="display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; font-weight: bold;">
                📄 Baixar Relatório Tratado (PDF)
              </a>
            ` : ''}
            ${data.rawDataUrl ? `
              <a href="${data.rawDataUrl}" 
                 style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; font-weight: bold;">
                📊 Baixar Dados Brutos (Excel)
              </a>
            ` : ''}
          </div>
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">
              <strong>⚠️ Importante:</strong> Este relatório contém dados reais e verificados, respeitando a LGPD. 
              Os links de download expiram em 30 dias por segurança.
            </p>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>ViajARTur - Plataforma de Inteligência Turística</p>
          <p style="margin-top: 10px; font-size: 11px; color: #999;">
            Dúvidas? Entre em contato: contato@viajartur.com.br
          </p>
        </div>
      </div>
    `,
  },
  partner_notification: {
    subject: (data: any) => `${data.title || 'Notificação'} - Descubra MS`,
    html: (data: any) => {
      const getIcon = (type: string) => {
        switch (type) {
          case 'new_reservation':
            return '📅';
          case 'payment_confirmed':
          case 'commission_paid':
            return '💰';
          case 'reservation_cancelled':
            return '⚠️';
          case 'subscription_expiring':
            return '⏰';
          case 'subscription_renewed':
            return '✅';
          case 'payout_completed':
            return '💳';
          default:
            return '🔔';
        }
      };

      return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #1e3a5f, #2d8a8a); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Descubra MS</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #1e3a5f;">${getIcon(data.type || '')} ${data.title || 'Notificação'}</h2>
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #1e3a5f;">
            <p style="color: #333; line-height: 1.6;">${data.message || 'Você tem uma nova notificação no seu dashboard.'}</p>
          </div>
          ${data.reservationId ? `
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; font-size: 13px; color: #1e40af;">
                <strong>Reserva:</strong> ${data.reservationId}
              </p>
            </div>
          ` : ''}
          <a href="https://descubramatogrossodosul.com.br/partner/dashboard" 
             style="display: inline-block; background: #1e3a5f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">
            Ver no Dashboard
          </a>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Descubra Mato Grosso do Sul - Área do Parceiro</p>
        </div>
      </div>
    `;
    },
  },
  partner_welcome: {
    subject: '🎉 Bem-vindo ao Descubra Mato Grosso do Sul!',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #1e3a5f, #2d8a8a, #3d9970); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Bem-vindo!</h1>
          <p style="color: white; margin-top: 10px;">Descubra Mato Grosso do Sul</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #1e3a5f;">Olá, ${data.partnerName || 'Parceiro'}!</h2>
          <p>Seu cadastro como parceiro do <strong>Descubra Mato Grosso do Sul</strong> foi recebido com sucesso!</p>
          
          <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <h3 style="color: #2e7d32; margin-top: 0;">✅ O que já foi feito:</h3>
            <ul style="color: #333; padding-left: 20px;">
              <li>Conta criada com sucesso</li>
              <li>Pagamento da assinatura confirmado</li>
              <li>Acesso ao dashboard liberado</li>
            </ul>
          </div>
          
          <div style="background: #fff3e0; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <h3 style="color: #e65100; margin-top: 0;">📋 Próximos passos:</h3>
            <ul style="color: #333; padding-left: 20px;">
              <li>Explore o dashboard e configure seu negócio</li>
              <li>Adicione mais fotos e informações</li>
              <li>Configure seus preços e disponibilidade</li>
              <li>Nossa equipe entrará em contato em até 48h</li>
            </ul>
          </div>
          
          <p>Enquanto aguarda a aprovação, você já pode explorar todas as funcionalidades do dashboard!</p>
          
          <a href="${data.dashboardUrl || 'https://viajartur.com/partner/dashboard'}" 
             style="display: inline-block; background: linear-gradient(to right, #1e3a5f, #2d8a8a); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">
            Acessar Dashboard
          </a>
          
          <p style="margin-top: 30px; color: #666;">
            <strong>Dúvidas?</strong> Nossa equipe está pronta para ajudar você a aproveitar ao máximo a plataforma!
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Descubra Mato Grosso do Sul - Turismo e Cultura</p>
        </div>
      </div>
    `,
  },
  stripe_connect_complete: {
    subject: '✅ Conta Stripe conectada com sucesso!',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #635BFF; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">✅ Stripe Conectado!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #1e3a5f;">Parabéns, ${data.partnerName || 'Parceiro'}!</h2>
          <p>Sua conta Stripe foi conectada com sucesso! Agora você pode receber pagamentos de reservas diretamente na sua conta.</p>
          
          <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <h3 style="color: #2e7d32; margin-top: 0;">💰 Como funciona:</h3>
            <ul style="color: #333; padding-left: 20px;">
              <li>Quando um turista fizer uma reserva, o pagamento é processado automaticamente</li>
              <li>Você recebe o valor diretamente na sua conta Stripe</li>
              <li>Uma pequena comissão é retida pela plataforma (10%)</li>
            </ul>
          </div>
          
          <a href="https://viajartur.com/partner/dashboard" 
             style="display: inline-block; background: #635BFF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">
            Acessar Dashboard
          </a>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Descubra Mato Grosso do Sul - Área do Parceiro</p>
        </div>
      </div>
    `,
  },
  reservation_payment_received: {
    subject: '💰 Pagamento de reserva recebido!',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #4caf50, #2e7d32); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">💰 Pagamento Recebido!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #1e3a5f;">Olá, ${data.partnerName || 'Parceiro'}!</h2>
          <p>Uma nova reserva foi paga e você receberá o valor diretamente na sua conta Stripe!</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #4caf50;">
            <h3 style="color: #2e7d32; margin-top: 0;">📋 Detalhes da Reserva:</h3>
            <p><strong>Reserva:</strong> #${data.reservationId || '---'}</p>
            <p><strong>Valor Total:</strong> R$ ${data.totalAmount || '0,00'}</p>
            <p><strong>Comissão da Plataforma:</strong> R$ ${data.platformFee || '0,00'}</p>
            <p style="font-size: 18px; color: #2e7d32;"><strong>Você Recebe:</strong> R$ ${data.partnerAmount || '0,00'}</p>
          </div>
          
          <p>O valor será transferido automaticamente para sua conta Stripe.</p>
          
          <a href="https://viajartur.com/partner/dashboard?tab=reservations" 
             style="display: inline-block; background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">
            Ver Reserva
          </a>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Descubra Mato Grosso do Sul - Área do Parceiro</p>
        </div>
      </div>
    `,
  },
  welcome_subscription: {
    subject: '🎉 Bem-vindo ao ViaJAR Tur!',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #1e3a5f, #2d8a8a); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Bem-vindo!</h1>
          <p style="color: white; margin-top: 10px;">ViaJAR Tur</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #1e3a5f;">Olá, ${data.userName || 'Usuário'}!</h2>
          <p>Sua assinatura do <strong>ViaJAR Tur</strong> foi confirmada com sucesso!</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #1e3a5f;">
            <p><strong>Plano:</strong> ${data.planName || 'Plano Profissional'}</p>
            <p><strong>Período:</strong> ${data.billingPeriod === 'annual' ? 'Anual' : 'Mensal'}</p>
            <p><strong>Valor:</strong> R$ ${data.amount || '0,00'}</p>
          </div>
          
          <a href="https://viajartur.com/viajar/dashboard" 
             style="display: inline-block; background: #1e3a5f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">
            Acessar Plataforma
          </a>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>ViaJAR Tur - Turismo Inteligente</p>
        </div>
      </div>
    `,
  },
};

// Função helper para substituir variáveis em templates
function replaceTemplateVariables(template: string, data: Record<string, any>): string {
  let result = template;
  
  // Substituir variáveis no formato {{variable}}
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value !== null && value !== undefined ? String(value) : '');
  }
  
  // Substituir condicionais simples {{#if variable}}...{{/if}}
  // Por enquanto, apenas remove se variável não existir ou for falsy
  result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, varName, content) => {
    if (data[varName]) {
      return content;
    }
    return '';
  });
  
  return result;
}

// Função para buscar template do banco
async function getTemplateFromDatabase(
  supabase: any,
  type: NotificationType
): Promise<{ subject: string; html: string } | null> {
  try {
    // Mapear tipos para nomes de templates
    const templateNameMap: Record<NotificationType, string> = {
      event_approved: 'Event Approved',
      event_rejected: 'Event Rejected',
      event_payment_confirmed: 'Event Payment Confirmed',
      partner_approved: 'Partner Approved',
      partner_rejected: 'Partner Rejected',
      partner_welcome: 'Partner Welcome',
      welcome: 'Welcome',
      welcome_subscription: 'Welcome Subscription',
      system_alert: 'System Alert',
      data_report_approved: 'Data Report Approved',
      data_report_ready: 'Data Report Ready',
      partner_notification: 'Partner Notification',
      stripe_connect_complete: 'Stripe Connect Complete',
      reservation_payment_received: 'Reservation Payment Received',
    };

    const templateName = templateNameMap[type];
    if (!templateName) return null;

    const { data, error } = await supabase
      .from('message_templates')
      .select('subject_template, body_template, is_active')
      .eq('name', templateName)
      .eq('channel', 'email')
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      console.log(`⚠️ [send-notification-email] Template "${templateName}" não encontrado no banco, usando fallback`);
      return null;
    }

    return {
      subject: data.subject_template || '',
      html: data.body_template || '',
    };
  } catch (error) {
    console.error('❌ [send-notification-email] Erro ao buscar template do banco:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let requestData: EmailRequest;
    try {
      // Usar req.json() diretamente como outras Edge Functions fazem
      requestData = await req.json() as EmailRequest;
      console.log('✅ [send-notification-email] Body parseado com sucesso:', {
        hasType: !!requestData.type,
        type: requestData.type,
        hasTo: !!requestData.to,
        to: requestData.to,
        hasData: !!requestData.data,
        dataKeys: requestData.data ? Object.keys(requestData.data) : [],
        fullRequestData: JSON.stringify(requestData).substring(0, 1000),
        requestDataType: typeof requestData,
        requestDataKeys: Object.keys(requestData || {})
      });
    } catch (parseError) {
      console.error('❌ [send-notification-email] Erro ao fazer parse do JSON:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: String(parseError) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extrair campos com valores padrão para evitar undefined
    const type = requestData?.type;
    const to = requestData?.to;
    const data = requestData?.data;

    console.log('📧 [send-notification-email] Campos extraídos após destructuring:', { 
      type, 
      to, 
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : [],
      fullData: JSON.stringify(data || {}).substring(0, 500),
      typeIsTruthy: !!type,
      toIsTruthy: !!to,
      typeValue: type,
      toValue: to
    });

    if (!type || !to) {
      console.error('❌ [send-notification-email] Campos obrigatórios faltando:', { 
        type: type || 'MISSING', 
        to: to || 'MISSING',
        requestData: JSON.stringify(requestData).substring(0, 500)
      });
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request: type and to are required',
          received: { type: type || null, to: to || null }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Tentar buscar template do banco primeiro
    const dbTemplate = await getTemplateFromDatabase(supabase, type);
    
    let subject: string;
    let htmlContent: string;

    if (dbTemplate) {
      // Usar template do banco
      console.log(`✅ [send-notification-email] Usando template do banco para tipo: ${type}`);
      subject = replaceTemplateVariables(dbTemplate.subject, data || {});
      htmlContent = replaceTemplateVariables(dbTemplate.html, data || {});
    } else {
      // Fallback para template hardcoded
      console.log(`⚠️ [send-notification-email] Usando template hardcoded (fallback) para tipo: ${type}`);
      
      if (!templates[type]) {
        console.error('❌ [send-notification-email] Tipo de template não encontrado:', {
          requestedType: type,
          availableTypes: Object.keys(templates),
          templatesCount: Object.keys(templates).length
        });
        return new Response(
          JSON.stringify({ 
            error: `Invalid template type: ${type}. Available: ${Object.keys(templates).join(', ')}`,
            requestedType: type,
            availableTypes: Object.keys(templates)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const template = templates[type];
      
      // Determinar subject (pode ser string ou função)
      if (typeof template.subject === 'function') {
        subject = template.subject(data);
      } else if (type === 'system_alert' && data?.service_name) {
        subject = `🚨 Alerta: ${data.service_name} - Descubra MS`;
      } else {
        subject = template.subject;
      }
      
      // Gerar HTML do template
      try {
        htmlContent = template.html(data || {});
        if (!htmlContent) {
          throw new Error('Template HTML retornou vazio');
        }
      } catch (htmlError: any) {
        console.error('❌ [send-notification-email] Erro ao gerar HTML do template:', htmlError);
        return new Response(
          JSON.stringify({ error: `Error generating email HTML: ${htmlError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }
    
    const emailContent = {
      to,
      subject,
      html: htmlContent,
    };

    console.log('📧 [send-notification-email] Conteúdo do email preparado:', { to, subject, htmlLength: htmlContent.length });

    // Verificar se Resend está configurado (aceita ambos os nomes)
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || Deno.env.get('RESEND_KEY');

    if (resendApiKey) {
      // Tentar usar domínio customizado primeiro, com fallback para domínio padrão do Resend
      // O domínio padrão do Resend é sempre verificado e pode ser usado sem configuração adicional
      const customDomain = Deno.env.get('RESEND_FROM_EMAIL') || 'Descubra MS <noreply@descubramatogrossodosul.com.br>';
      // Domínio padrão do Resend (sempre verificado - funciona mesmo sem verificar domínio customizado)
      const defaultDomain = Deno.env.get('RESEND_DEFAULT_FROM') || 'Descubra MS <onboarding@resend.dev>';
      
      // Função para tentar enviar com um domínio específico
      const trySendEmail = async (fromEmail: string, isRetry: boolean = false) => {
        // Determinar reply_to: usar do request, variável de ambiente, ou null
        const replyToEmail = requestData.reply_to || Deno.env.get('RESEND_REPLY_TO_EMAIL') || null;
        
        // Construir payload do Resend API
        const emailPayload: any = {
          from: fromEmail,
          to: [to],
          subject: emailContent.subject,
          html: emailContent.html,
        };
        
        // Adicionar reply_to apenas se especificado
        if (replyToEmail) {
          emailPayload.reply_to = replyToEmail;
        }

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      if (!resendResponse.ok) {
          let errorData: any;
          try {
            errorData = await resendResponse.json();
          } catch {
            errorData = { status: resendResponse.status, statusText: resendResponse.statusText };
          }
          
          // Se for erro 403 (domínio não verificado) e ainda não tentou o domínio padrão, tentar novamente
          if (resendResponse.status === 403 && !isRetry && fromEmail === customDomain) {
            console.warn('⚠️ [send-notification-email] Domínio customizado não verificado, tentando com domínio padrão do Resend...');
            return await trySendEmail(defaultDomain, true);
          }
          
          console.error('❌ [send-notification-email] Erro Resend:', {
            status: resendResponse.status,
            statusText: resendResponse.statusText,
            errorData,
            emailTo: to,
            emailSubject: emailContent.subject,
            fromEmail,
            isRetry
          });
          
          // Se for erro 403 de domínio não verificado, retornar sucesso mas com aviso
          if (resendResponse.status === 403 && errorData?.message?.includes('domain is not verified')) {
            console.warn('⚠️ [send-notification-email] Domínio não verificado no Resend. Email não enviado, mas retornando sucesso para não bloquear o fluxo.');
            return {
              success: true,
              pending: true,
              warning: 'Domínio não verificado no Resend. Verifique o domínio em resend.com/domains',
              errorData
            };
          }
          
          throw new Error(`Resend API error: ${resendResponse.status} - ${errorData?.message || resendResponse.statusText}`);
      }

      const result = await resendResponse.json();
        return { success: true, result, fromEmail, isRetry };
      };

      try {
        const emailResult = await trySendEmail(customDomain);
        
        if (emailResult.pending) {
          // Domínio não verificado - retornar sucesso com aviso
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Email não enviado - domínio não verificado no Resend',
              pending: true,
              warning: emailResult.warning,
              errorData: emailResult.errorData
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
        
        console.log('✅ [send-notification-email] Email enviado com sucesso:', {
          id: emailResult.result?.id,
          from: emailResult.fromEmail,
          to,
          usedDefaultDomain: emailResult.isRetry
        });

      return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Email enviado', 
            id: emailResult.result?.id,
            from: emailResult.fromEmail,
            usedDefaultDomain: emailResult.isRetry
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } catch (emailError: any) {
        console.error('❌ [send-notification-email] Erro ao enviar email:', emailError);
        // Retornar sucesso para não bloquear o fluxo, mas logar o erro
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Email não enviado (erro não crítico)',
            pending: true,
            error: emailError.message || 'Erro desconhecido'
          }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
      }

    } else {
      // Resend não configurado - registrar no banco para envio manual
      console.log('RESEND_API_KEY não configurada. Registrando email para envio manual.');

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Tentar registrar no banco, mas não falhar se a tabela não existir
      try {
        const { error: insertError } = await supabase.from('pending_emails').insert({
          to_email: to,
          subject: emailContent.subject,
          html_content: emailContent.html,
          type: type,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

        if (insertError) {
          console.warn('Não foi possível registrar email pendente (tabela pode não existir):', insertError);
        }
      } catch (dbError) {
        console.warn('Erro ao registrar email pendente:', dbError);
      }

      // Retornar sucesso mesmo sem Resend configurado (não é erro crítico)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email registrado para envio manual (RESEND_API_KEY não configurada)',
          pending: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

  } catch (error: any) {
    console.error('Erro ao processar email:', error);
    
    // SEMPRE retornar sucesso para não bloquear o fluxo de aprovação
    // O email não é crítico para a operação principal
    console.warn('Erro no envio de email, mas retornando sucesso para não bloquear o fluxo:', error.message || error);
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email não enviado (erro não crítico)',
        pending: true,
        error: error.message || 'Erro desconhecido'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
