
-- Fase 2: População dos Dados Geográficos
-- Este script insere os dados das regiões turísticas e seus respectivos municípios.

DO $$
DECLARE
    -- Declaração de variáveis para armazenar os IDs das regiões
    caminhos_da_natureza_id UUID;
    bonito_serra_id UUID;
    caminho_dos_ipes_id UUID;
    caminhos_da_fronteira_id UUID;
    costa_leste_id UUID;
    grande_dourados_id UUID;
    pantanal_id UUID;
    rota_norte_id UUID;
    vale_das_aguas_id UUID;
    vale_do_apore_id UUID;
BEGIN
    -- Inserir Regiões Turísticas e capturar seus IDs
    INSERT INTO public.regions (name) VALUES ('Caminhos da Natureza / Cone Sul') RETURNING id INTO caminhos_da_natureza_id;
    INSERT INTO public.regions (name) VALUES ('Bonito / Serra da Bodoquena') RETURNING id INTO bonito_serra_id;
    INSERT INTO public.regions (name) VALUES ('Caminho dos Ipês') RETURNING id INTO caminho_dos_ipes_id;
    INSERT INTO public.regions (name) VALUES ('Caminhos da Fronteira') RETURNING id INTO caminhos_da_fronteira_id;
    INSERT INTO public.regions (name) VALUES ('Costa Leste') RETURNING id INTO costa_leste_id;
    INSERT INTO public.regions (name) VALUES ('Grande Dourados') RETURNING id INTO grande_dourados_id;
    INSERT INTO public.regions (name) VALUES ('Pantanal') RETURNING id INTO pantanal_id;
    INSERT INTO public.regions (name) VALUES ('Rota Norte') RETURNING id INTO rota_norte_id;
    INSERT INTO public.regions (name) VALUES ('Vale das Águas') RETURNING id INTO vale_das_aguas_id;
    INSERT INTO public.regions (name) VALUES ('Vale do Aporé') RETURNING id INTO vale_do_apore_id;

    -- Inserir Cidades associadas a cada Região

    -- Caminhos da Natureza / Cone Sul
    INSERT INTO public.cities (name, region_id) VALUES
        ('Eldorado', caminhos_da_natureza_id),
        ('Iguatemi', caminhos_da_natureza_id),
        ('Itaquiraí', caminhos_da_natureza_id),
        ('Japorã', caminhos_da_natureza_id),
        ('Mundo Novo', caminhos_da_natureza_id),
        ('Naviraí', caminhos_da_natureza_id);

    -- Bonito / Serra da Bodoquena
    INSERT INTO public.cities (name, region_id) VALUES
        ('Bela Vista', bonito_serra_id),
        ('Bodoquena', bonito_serra_id),
        ('Bonito', bonito_serra_id),
        ('Caracol', bonito_serra_id),
        ('Guia Lopes da Laguna', bonito_serra_id),
        ('Jardim', bonito_serra_id),
        ('Nioaque', bonito_serra_id),
        ('Porto Murtinho', bonito_serra_id);

    -- Caminho dos Ipês
    INSERT INTO public.cities (name, region_id) VALUES
        ('Campo Grande', caminho_dos_ipes_id),
        ('Corguinho', caminho_dos_ipes_id),
        ('Dois Irmãos do Buriti', caminho_dos_ipes_id),
        ('Jaraguari', caminho_dos_ipes_id),
        ('Nova Alvorada do Sul', caminho_dos_ipes_id),
        ('Ribas do Rio Pardo', caminho_dos_ipes_id),
        ('Rio Negro', caminho_dos_ipes_id),
        ('Sidrolândia', caminho_dos_ipes_id),
        ('Terenos', caminho_dos_ipes_id);

    -- Caminhos da Fronteira
    INSERT INTO public.cities (name, region_id) VALUES
        ('Antônio João', caminhos_da_fronteira_id),
        ('Laguna Carapã', caminhos_da_fronteira_id),
        ('Ponta Porã', caminhos_da_fronteira_id);

    -- Costa Leste
    INSERT INTO public.cities (name, region_id) VALUES
        ('Água Clara', costa_leste_id),
        ('Anaurilândia', costa_leste_id),
        ('Aparecida do Taboado', costa_leste_id),
        ('Bataguassu', costa_leste_id),
        ('Brasilândia', costa_leste_id),
        ('Selvíria', costa_leste_id),
        ('Três Lagoas', costa_leste_id);

    -- Grande Dourados
    INSERT INTO public.cities (name, region_id) VALUES
        ('Caarapó', grande_dourados_id),
        ('Dourados', grande_dourados_id),
        ('Fátima do Sul', grande_dourados_id),
        ('Itaporã', grande_dourados_id);

    -- Pantanal
    INSERT INTO public.cities (name, region_id) VALUES
        ('Anastácio', pantanal_id),
        ('Aquidauana', pantanal_id),
        ('Corumbá', pantanal_id),
        ('Ladário', pantanal_id),
        ('Miranda', pantanal_id);

    -- Rota Norte
    INSERT INTO public.cities (name, region_id) VALUES
        ('Alcinópolis', rota_norte_id),
        ('Bandeirantes', rota_norte_id),
        ('Camapuã', rota_norte_id),
        ('Costa Rica', rota_norte_id),
        ('Coxim', rota_norte_id),
        ('Figueirão', rota_norte_id),
        ('Paraíso das Águas', rota_norte_id),
        ('Pedro Gomes', rota_norte_id),
        ('Rio Verde de Mato Grosso', rota_norte_id),
        ('São Gabriel do Oeste', rota_norte_id),
        ('Sonora', rota_norte_id);

    -- Vale das Águas
    INSERT INTO public.cities (name, region_id) VALUES
        ('Batayporã', vale_das_aguas_id),
        ('Ivinhema', vale_das_aguas_id),
        ('Nova Andradina', vale_das_aguas_id),
        ('Taquarussu', vale_das_aguas_id);

    -- Vale do Aporé
    INSERT INTO public.cities (name, region_id) VALUES
        ('Cassilândia', vale_do_apore_id),
        ('Inocência', vale_do_apore_id),
        ('Paranaíba', vale_do_apore_id);

END $$; 