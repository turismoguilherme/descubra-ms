-- Adicionar configurações para o banner de roteiros personalizados (valores como JSON)
INSERT INTO site_settings (platform, setting_key, setting_value, description)
VALUES 
  ('ms', 'ms_roteiro_banner_enabled', '"true"', 'Ativar/desativar o banner de roteiros personalizados'),
  ('ms', 'ms_roteiro_contact_type', '"whatsapp"', 'Tipo de contato: whatsapp, link, ou both'),
  ('ms', 'ms_roteiro_external_link', '""', 'URL do site externo para contato'),
  ('ms', 'ms_roteiro_external_link_text', '"Acessar Site"', 'Texto do botão para link externo')
ON CONFLICT (platform, setting_key) DO NOTHING;