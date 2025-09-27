-- Seed de parceiros aprovados para ambiente de desenvolvimento
-- Insere apenas se não existir um registro com o mesmo nome

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'institutional_partners') THEN
    RAISE NOTICE 'Tabela institutional_partners não existe; seed ignorado.';
    RETURN;
  END IF;

  -- Parceiro 1
  IF NOT EXISTS (SELECT 1 FROM institutional_partners WHERE name = 'Hotel Pantanal Verde') THEN
    INSERT INTO institutional_partners (name, description, logo_url, website_link, contact_email, category, city, segment, status, approved_at)
    VALUES ('Hotel Pantanal Verde', 'Hospedagem referência para ecoturismo no MS', NULL, 'https://hotelpantanalverde.example.com', 'contato@pantanalverde.com.br', 'local', 'Campo Grande', 'Hotelaria', 'approved', NOW());
  END IF;

  -- Parceiro 2
  IF NOT EXISTS (SELECT 1 FROM institutional_partners WHERE name = 'Sabores do Cerrado') THEN
    INSERT INTO institutional_partners (name, description, logo_url, website_link, contact_email, category, city, segment, status, approved_at)
    VALUES ('Sabores do Cerrado', 'Gastronomia regional com ingredientes do bioma', NULL, 'https://saboresdocerrado.example.com', 'atendimento@saboresdocerrado.com.br', 'regional', 'Bonito', 'Gastronomia', 'approved', NOW());
  END IF;

  -- Parceiro 3
  IF NOT EXISTS (SELECT 1 FROM institutional_partners WHERE name = 'Roteiros MS') THEN
    INSERT INTO institutional_partners (name, description, logo_url, website_link, contact_email, category, city, segment, status, approved_at)
    VALUES ('Roteiros MS', 'Operadora especializada em experiências de natureza', NULL, 'https://roteirosms.example.com', 'vendas@roteirosms.com.br', 'estadual', 'Dourados', 'Operadora', 'approved', NOW());
  END IF;
END $$;






