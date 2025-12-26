-- Migration: Migrar templates de email hardcoded para message_templates
-- Descrição: Migra todos os templates da Edge Function para a tabela message_templates
-- Data: 2025-01-20

-- ============================================
-- MIGRAR TEMPLATES PARA message_templates
-- ============================================

-- Template 1: Event Approved
INSERT INTO message_templates (name, channel, subject_template, body_template, purpose, variables_json, is_active)
VALUES (
  'Event Approved',
  'email',
  '✅ Seu evento foi aprovado! - Descubra MS',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(to right, #1e3a5f, #2d8a8a); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">Descubra MS</h1>
    </div>
    <div style="padding: 30px; background: #f9f9f9;">
      <h2 style="color: #1e3a5f;">Parabéns! Seu evento foi aprovado! 🎉</h2>
      <p>Olá, <strong>{{organizerName}}</strong>!</p>
      <p>Temos o prazer de informar que o evento <strong>"{{eventName}}"</strong> foi aprovado e já está visível no calendário de eventos do Descubra MS.</p>
      <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <p><strong>📅 Data:</strong> {{eventDate}}</p>
        <p><strong>📍 Local:</strong> {{eventLocation}}</p>
      </div>
      <a href="https://descubramatogrossodosul.com.br/descubramatogrossodosul/eventos" 
         style="display: inline-block; background: #1e3a5f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
        Ver no Calendário
      </a>
    </div>
    <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
      <p>Descubra Mato Grosso do Sul - Turismo e Cultura</p>
    </div>
  </div>',
  'Notificação de aprovação de evento',
  '{"organizerName": "string", "eventName": "string", "eventDate": "string", "eventLocation": "string"}'::jsonb,
  true
) ON CONFLICT (name) DO NOTHING;

-- Template 2: Event Rejected
INSERT INTO message_templates (name, channel, subject_template, body_template, purpose, variables_json, is_active)
VALUES (
  'Event Rejected',
  'email',
  'Sobre seu evento - Descubra MS',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #1e3a5f; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">Descubra MS</h1>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #1e3a5f;">Sobre seu evento</h2>
      <p>Olá, <strong>{{organizerName}}</strong>!</p>
      <p>Infelizmente, o evento <strong>"{{eventName}}"</strong> não pôde ser aprovado no momento.</p>
      {{#if reason}}<p><strong>Motivo:</strong> {{reason}}</p>{{/if}}
      <p>Você pode entrar em contato conosco para mais informações ou enviar um novo evento.</p>
      <a href="https://descubramatogrossodosul.com.br/descubramatogrossodosul/cadastrar-evento" 
         style="display: inline-block; background: #1e3a5f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
        Cadastrar Novo Evento
      </a>
    </div>
  </div>',
  'Notificação de rejeição de evento',
  '{"organizerName": "string", "eventName": "string", "reason": "string"}'::jsonb,
  true
) ON CONFLICT (name) DO NOTHING;

-- Template 3: Event Payment Confirmed
INSERT INTO message_templates (name, channel, subject_template, body_template, purpose, variables_json, is_active)
VALUES (
  'Event Payment Confirmed',
  'email',
  '💳 Pagamento confirmado - Evento Em Destaque! - Descubra MS',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(to right, #f59e0b, #f97316); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">⭐ Evento Em Destaque!</h1>
    </div>
    <div style="padding: 30px; background: #fffbeb;">
      <h2 style="color: #92400e;">Pagamento confirmado!</h2>
      <p>Olá, <strong>{{organizerName}}</strong>!</p>
      <p>O pagamento do seu evento <strong>"{{eventName}}"</strong> foi confirmado com sucesso!</p>
      <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #f59e0b;">
        <p><strong>🌟 Status:</strong> Em Destaque</p>
        <p><strong>📅 Válido até:</strong> {{validUntil}}</p>
        <p><strong>💰 Valor:</strong> R$ 499,90</p>
      </div>
      <p>Seu evento agora aparece com destaque especial no calendário!</p>
      <a href="https://descubramatogrossodosul.com.br/descubramatogrossodosul/eventos" 
         style="display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
        Ver Meu Evento
      </a>
    </div>
  </div>',
  'Confirmação de pagamento de evento em destaque',
  '{"organizerName": "string", "eventName": "string", "validUntil": "string"}'::jsonb,
  true
) ON CONFLICT (name) DO NOTHING;

-- Template 4: Partner Approved
INSERT INTO message_templates (name, channel, subject_template, body_template, purpose, variables_json, is_active)
VALUES (
  'Partner Approved',
  'email',
  '🤝 Parceria aprovada! - Descubra MS',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(to right, #1e3a5f, #22c55e); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">Bem-vindo, Parceiro!</h1>
    </div>
    <div style="padding: 30px; background: #f0fdf4;">
      <h2 style="color: #166534;">Sua parceria foi aprovada! 🎉</h2>
      <p>Olá!</p>
      <p>Temos o prazer de informar que <strong>"{{partnerName}}"</strong> agora faz parte da rede de parceiros do Descubra MS!</p>
      <p>Seu estabelecimento já está visível para milhares de turistas que visitam nossa plataforma.</p>
      <a href="https://descubramatogrossodosul.com.br/descubramatogrossodosul/parceiros" 
         style="display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
        Ver Minha Página
      </a>
    </div>
  </div>',
  'Notificação de aprovação de parceiro',
  '{"partnerName": "string"}'::jsonb,
  true
) ON CONFLICT (name) DO NOTHING;

-- Template 5: Partner Rejected
INSERT INTO message_templates (name, channel, subject_template, body_template, purpose, variables_json, is_active)
VALUES (
  'Partner Rejected',
  'email',
  'Sobre sua solicitação de parceria - Descubra MS',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #1e3a5f; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">Descubra MS</h1>
    </div>
    <div style="padding: 30px;">
      <h2>Sobre sua solicitação</h2>
      <p>Olá!</p>
      <p>Infelizmente, a solicitação de parceria de <strong>"{{partnerName}}"</strong> não pôde ser aprovada no momento.</p>
      {{#if reason}}<p><strong>Motivo:</strong> {{reason}}</p>{{/if}}
      <p>Você pode entrar em contato conosco para mais informações.</p>
    </div>
  </div>',
  'Notificação de rejeição de parceiro',
  '{"partnerName": "string", "reason": "string"}'::jsonb,
  true
) ON CONFLICT (name) DO NOTHING;

-- Template 6: Welcome
INSERT INTO message_templates (name, channel, subject_template, body_template, purpose, variables_json, is_active)
VALUES (
  'Welcome',
  'email',
  'Bem-vindo ao Descubra MS! 🌿',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(to right, #1e3a5f, #2d8a8a, #22c55e); padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Descubra Mato Grosso do Sul</h1>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #1e3a5f;">Bem-vindo(a), {{userName}}! 🌿</h2>
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
  </div>',
  'Email de boas-vindas para novos usuários',
  '{"userName": "string"}'::jsonb,
  true
) ON CONFLICT (name) DO NOTHING;

-- Template 7: System Alert
INSERT INTO message_templates (name, channel, subject_template, body_template, purpose, variables_json, is_active)
VALUES (
  'System Alert',
  'email',
  '🚨 Alerta: {{serviceName}} - Descubra MS',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: {{severityColor}}; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">{{alertIcon}} Alerta do Sistema</h1>
    </div>
    <div style="padding: 30px; background: #f9fafb;">
      <h2 style="color: {{severityColor}}; margin-top: 0;">{{serviceName}} - {{severity}}</h2>
      <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid {{severityColor}}; margin: 20px 0;">
        <p style="font-size: 16px; margin: 0;"><strong>{{message}}</strong></p>
      </div>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Serviço:</strong> {{serviceName}}</p>
        <p style="margin: 5px 0;"><strong>Tipo:</strong> {{alertType}}</p>
        <p style="margin: 5px 0;"><strong>Severidade:</strong> {{severity}}</p>
        <p style="margin: 5px 0;"><strong>Data/Hora:</strong> {{timestamp}}</p>
      </div>
      <a href="https://descubramatogrossodosul.com.br/viajar/admin/system/health" 
         style="display: inline-block; background: {{severityColor}}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
        Ver Detalhes no Painel Admin
      </a>
    </div>
  </div>',
  'Alerta do sistema para administradores',
  '{"serviceName": "string", "severity": "string", "alertType": "string", "message": "string", "timestamp": "string", "severityColor": "string", "alertIcon": "string"}'::jsonb,
  true
) ON CONFLICT (name) DO NOTHING;

-- Template 8: Data Report Approved
INSERT INTO message_templates (name, channel, subject_template, body_template, purpose, variables_json, is_active)
VALUES (
  'Data Report Approved',
  'email',
  '✅ Solicitação de Relatório Aprovada - ViajARTur',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(to right, #1e3a5f, #2d8a8a); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">ViajARTur</h1>
    </div>
    <div style="padding: 30px; background: #f9f9f9;">
      <h2 style="color: #1e3a5f;">Sua solicitação foi aprovada! ✅</h2>
      <p>Olá, <strong>{{requesterName}}</strong>!</p>
      <p>Sua solicitação de relatório de dados de turismo foi aprovada e está pronta para pagamento.</p>
      <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #22c55e;">
        <p><strong>📊 Tipo de Relatório:</strong> {{reportType}}</p>
        <p><strong>📅 Período:</strong> {{periodStart}} a {{periodEnd}}</p>
        <p><strong>💰 Valor:</strong> R$ {{price}}</p>
      </div>
      <p>Para finalizar e receber seu relatório, clique no botão abaixo para realizar o pagamento:</p>
      {{#if checkoutUrl}}<a href="{{checkoutUrl}}" style="display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">💳 Realizar Pagamento</a>{{/if}}
    </div>
  </div>',
  'Aprovação de solicitação de relatório de dados',
  '{"requesterName": "string", "reportType": "string", "periodStart": "string", "periodEnd": "string", "price": "string", "checkoutUrl": "string"}'::jsonb,
  true
) ON CONFLICT (name) DO NOTHING;

-- Template 9: Data Report Ready
INSERT INTO message_templates (name, channel, subject_template, body_template, purpose, variables_json, is_active)
VALUES (
  'Data Report Ready',
  'email',
  '📊 Seu Relatório de Dados está Pronto! - ViajARTur',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(to right, #1e3a5f, #2d8a8a); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">ViajARTur</h1>
    </div>
    <div style="padding: 30px; background: #f9f9f9;">
      <h2 style="color: #1e3a5f;">Seu relatório está pronto! 📊</h2>
      <p>Olá, <strong>{{requesterName}}</strong>!</p>
      <p>Seu relatório de dados de turismo foi gerado com sucesso e está disponível para download.</p>
      <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <p><strong>📊 Tipo de Relatório:</strong> {{reportType}}</p>
        <p><strong>📅 Período:</strong> {{periodStart}} a {{periodEnd}}</p>
        <p><strong>📈 Total de Registros:</strong> {{totalRecords}}</p>
      </div>
      {{#if reportUrl}}<a href="{{reportUrl}}" style="display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; font-weight: bold;">📄 Baixar Relatório Tratado (PDF)</a>{{/if}}
      {{#if rawDataUrl}}<a href="{{rawDataUrl}}" style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; font-weight: bold;">📊 Baixar Dados Brutos (Excel)</a>{{/if}}
    </div>
  </div>',
  'Notificação de relatório de dados pronto',
  '{"requesterName": "string", "reportType": "string", "periodStart": "string", "periodEnd": "string", "totalRecords": "string", "reportUrl": "string", "rawDataUrl": "string"}'::jsonb,
  true
) ON CONFLICT (name) DO NOTHING;

-- Template 10: Partner Notification
INSERT INTO message_templates (name, channel, subject_template, body_template, purpose, variables_json, is_active)
VALUES (
  'Partner Notification',
  'email',
  '{{title}} - Descubra MS',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(to right, #1e3a5f, #2d8a8a); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">Descubra MS</h1>
    </div>
    <div style="padding: 30px; background: #f9f9f9;">
      <h2 style="color: #1e3a5f;">{{icon}} {{title}}</h2>
      <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #1e3a5f;">
        <p style="color: #333; line-height: 1.6;">{{message}}</p>
      </div>
      {{#if reservationId}}<div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;"><p style="margin: 0; font-size: 13px; color: #1e40af;"><strong>Reserva:</strong> {{reservationId}}</p></div>{{/if}}
      <a href="https://descubramatogrossodosul.com.br/partner/dashboard" style="display: inline-block; background: #1e3a5f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">Ver no Dashboard</a>
    </div>
  </div>',
  'Notificação genérica para parceiros',
  '{"title": "string", "message": "string", "icon": "string", "reservationId": "string", "type": "string"}'::jsonb,
  true
) ON CONFLICT (name) DO NOTHING;

-- Template 11: Partner Welcome
INSERT INTO message_templates (name, channel, subject_template, body_template, purpose, variables_json, is_active)
VALUES (
  'Partner Welcome',
  'email',
  '🎉 Bem-vindo ao Descubra Mato Grosso do Sul!',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(to right, #1e3a5f, #2d8a8a, #3d9970); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">🎉 Bem-vindo!</h1>
      <p style="color: white; margin-top: 10px;">Descubra Mato Grosso do Sul</p>
    </div>
    <div style="padding: 30px; background: #f9f9f9;">
      <h2 style="color: #1e3a5f;">Olá, {{partnerName}}!</h2>
      <p>Seu cadastro como parceiro do <strong>Descubra Mato Grosso do Sul</strong> foi recebido com sucesso!</p>
      <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4caf50;">
        <h3 style="color: #2e7d32; margin-top: 0;">✅ O que já foi feito:</h3>
        <ul style="color: #333; padding-left: 20px;">
          <li>Conta criada com sucesso</li>
          <li>Pagamento da assinatura confirmado</li>
          <li>Acesso ao dashboard liberado</li>
        </ul>
      </div>
      <a href="{{dashboardUrl}}" style="display: inline-block; background: linear-gradient(to right, #1e3a5f, #2d8a8a); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">Acessar Dashboard</a>
    </div>
  </div>',
  'Boas-vindas para novos parceiros',
  '{"partnerName": "string", "dashboardUrl": "string"}'::jsonb,
  true
) ON CONFLICT (name) DO NOTHING;

-- Template 12: Stripe Connect Complete
INSERT INTO message_templates (name, channel, subject_template, body_template, purpose, variables_json, is_active)
VALUES (
  'Stripe Connect Complete',
  'email',
  '✅ Conta Stripe conectada com sucesso!',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #635BFF; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">✅ Stripe Conectado!</h1>
    </div>
    <div style="padding: 30px; background: #f9f9f9;">
      <h2 style="color: #1e3a5f;">Parabéns, {{partnerName}}!</h2>
      <p>Sua conta Stripe foi conectada com sucesso! Agora você pode receber pagamentos de reservas diretamente na sua conta.</p>
      <a href="https://viajartur.com/partner/dashboard" style="display: inline-block; background: #635BFF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">Acessar Dashboard</a>
    </div>
  </div>',
  'Confirmação de conexão Stripe',
  '{"partnerName": "string"}'::jsonb,
  true
) ON CONFLICT (name) DO NOTHING;

-- Template 13: Reservation Payment Received
INSERT INTO message_templates (name, channel, subject_template, body_template, purpose, variables_json, is_active)
VALUES (
  'Reservation Payment Received',
  'email',
  '💰 Pagamento de reserva recebido!',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(to right, #4caf50, #2e7d32); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">💰 Pagamento Recebido!</h1>
    </div>
    <div style="padding: 30px; background: #f9f9f9;">
      <h2 style="color: #1e3a5f;">Olá, {{partnerName}}!</h2>
      <p>Uma nova reserva foi paga e você receberá o valor diretamente na sua conta Stripe!</p>
      <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #4caf50;">
        <h3 style="color: #2e7d32; margin-top: 0;">📋 Detalhes da Reserva:</h3>
        <p><strong>Reserva:</strong> #{{reservationId}}</p>
        <p><strong>Valor Total:</strong> R$ {{totalAmount}}</p>
        <p><strong>Comissão da Plataforma:</strong> R$ {{platformFee}}</p>
        <p style="font-size: 18px; color: #2e7d32;"><strong>Você Recebe:</strong> R$ {{partnerAmount}}</p>
      </div>
      <a href="https://viajartur.com/partner/dashboard?tab=reservations" style="display: inline-block; background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">Ver Reserva</a>
    </div>
  </div>',
  'Notificação de pagamento de reserva recebido',
  '{"partnerName": "string", "reservationId": "string", "totalAmount": "string", "platformFee": "string", "partnerAmount": "string"}'::jsonb,
  true
) ON CONFLICT (name) DO NOTHING;

-- Template 14: Welcome Subscription
INSERT INTO message_templates (name, channel, subject_template, body_template, purpose, variables_json, is_active)
VALUES (
  'Welcome Subscription',
  'email',
  '🎉 Bem-vindo ao ViaJAR Tur!',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(to right, #1e3a5f, #2d8a8a); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">🎉 Bem-vindo!</h1>
      <p style="color: white; margin-top: 10px;">ViaJAR Tur</p>
    </div>
    <div style="padding: 30px; background: #f9f9f9;">
      <h2 style="color: #1e3a5f;">Olá, {{userName}}!</h2>
      <p>Sua assinatura do <strong>ViaJAR Tur</strong> foi confirmada com sucesso!</p>
      <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #1e3a5f;">
        <p><strong>Plano:</strong> {{planName}}</p>
        <p><strong>Período:</strong> {{billingPeriod}}</p>
        <p><strong>Valor:</strong> R$ {{amount}}</p>
      </div>
      <a href="https://viajartur.com/viajar/dashboard" style="display: inline-block; background: #1e3a5f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">Acessar Plataforma</a>
    </div>
  </div>',
  'Boas-vindas para novos assinantes ViaJAR Tur',
  '{"userName": "string", "planName": "string", "billingPeriod": "string", "amount": "string"}'::jsonb,
  true
) ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE message_templates IS 'Templates de email migrados da Edge Function send-notification-email. Agora podem ser editados via interface admin.';

