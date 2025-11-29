-- Script para popular a Knowledge Base do Guatá com conceitos importantes
-- Execute este script no Supabase SQL Editor após rodar a migration

-- Limpar entradas existentes (opcional - descomente se quiser resetar)
-- DELETE FROM guata_knowledge_base;

-- Usar INSERT com verificação de existência para evitar duplicatas
-- Se já existir uma entrada ativa com a mesma pergunta normalizada, não inserir

-- Inserir conceitos importantes sobre Mato Grosso do Sul

-- 1. Turismólogo
INSERT INTO guata_knowledge_base (pergunta, pergunta_normalizada, resposta, tipo, tags, fonte)
SELECT 
  'O que é turismólogo?',
  'o que e turismologo',
  '🦦 Que pergunta interessante! Um turismólogo é um profissional especializado em turismo, com formação acadêmica na área. Ele estuda e trabalha com planejamento, gestão, desenvolvimento e promoção de atividades turísticas. O turismólogo pode atuar em diversas áreas como: planejamento de roteiros, gestão de hotéis e pousadas, organização de eventos, marketing turístico, consultoria, e muito mais! É uma profissão essencial para o desenvolvimento do turismo em Mato Grosso do Sul e no Brasil! 😊',
  'conceito',
  ARRAY['profissão', 'turismo', 'educação'],
  'manual'
WHERE NOT EXISTS (
  SELECT 1 FROM guata_knowledge_base 
  WHERE pergunta_normalizada = 'o que e turismologo' AND ativo = true
);

-- 2. Rota Bioceânica
INSERT INTO guata_knowledge_base (pergunta, pergunta_normalizada, resposta, tipo, tags, fonte)
SELECT 
  'O que é a Rota Bioceânica?',
  'o que e a rota bioceanica',
  '🦦 A Rota Bioceânica é uma estrada de 2.396 quilômetros que vai conectar o Oceano Atlântico ao Pacífico, passando por Mato Grosso do Sul! 🛣️

O que isso significa para nós:
• Campo Grande será a porta de entrada principal no Brasil
• Nossos produtos vão chegar ao mundo todo
• Turistas de todos os cantos vão nos visitar
• Desenvolvimento do comércio internacional

🚀 E o melhor: você poderá viajar de carro até o Chile, passando pelo Pantanal, Paraguai, Argentina e chegando nas montanhas do Chile! É uma aventura épica!

📅 A obra está em andamento e deve ser concluída nos próximos anos, transformando MS em um ponto estratégico continental.',
  'conceito',
  ARRAY['rota bioceânica', 'infraestrutura', 'desenvolvimento', 'turismo'],
  'manual'
WHERE NOT EXISTS (
  SELECT 1 FROM guata_knowledge_base 
  WHERE pergunta_normalizada = 'o que e a rota bioceanica' AND ativo = true
);

-- 3. Pantanal
INSERT INTO guata_knowledge_base (pergunta, pergunta_normalizada, resposta, tipo, tags, fonte)
SELECT 
  'O que é o Pantanal?',
  'o que e o pantanal',
  '🦦 O Pantanal é a maior área úmida do planeta, localizada em Mato Grosso do Sul! É o lugar mais mágico do mundo para observação da vida selvagem. 🐊

O que você vai encontrar:
• Jacarés tomando sol na beira da água (eles são super mansos!)
• Capivaras nadando tranquilas (as maiores do mundo!)
• Araras coloridas voando por todo lado
• Se tiver sorte, uma onça-pintada (o rei do Pantanal!)
• Pássaros de todos os tipos e cores

📅 Melhor época para visitar: Entre maio e setembro, quando está mais seco. Nesse período você consegue andar pelos caminhos e ver os animais com mais facilidade.

🎯 Onde começar sua aventura:
• Corumbá é a porta de entrada clássica
• Miranda tem pousadas incríveis
• Aquidauana também é uma opção linda

Dica quente do Guatá: Reserve com antecedência, porque todo mundo quer conhecer essa maravilha! E não esqueça o binóculo - você vai querer ver cada detalhe dessa natureza incrível!',
  'local',
  ARRAY['pantanal', 'natureza', 'ecoturismo', 'fauna', 'flora'],
  'manual'
WHERE NOT EXISTS (
  SELECT 1 FROM guata_knowledge_base 
  WHERE pergunta_normalizada = 'o que e o pantanal' AND ativo = true
);

-- 4. Bonito
INSERT INTO guata_knowledge_base (pergunta, pergunta_normalizada, resposta, tipo, tags, fonte)
SELECT 
  'O que é Bonito?',
  'o que e bonito',
  '🌊 Bonito é mundialmente reconhecida como a Capital do Ecoturismo! É um lugar mágico com águas cristalinas que parecem de outro mundo. 

🏞️ Principais Atrações:
• Rio Sucuri - flutuação em águas cristalinas
• Gruta do Lago Azul - lago subterrâneo incrível
• Gruta da Anhumas - aventura única
• Buraco das Araras - observação de aves
• Rio da Prata - flutuação e mergulho

🎯 Dicas do Guatá:
• Reserve com antecedência - é muito procurado!
• Leve protetor solar e repelente
• Aproveite a gastronomia local

Cada lugar tem sua própria magia! Quer saber mais sobre algum passeio específico?',
  'local',
  ARRAY['bonito', 'ecoturismo', 'águas cristalinas', 'passeios', 'natureza'],
  'manual'
WHERE NOT EXISTS (
  SELECT 1 FROM guata_knowledge_base 
  WHERE pergunta_normalizada = 'o que e bonito' AND ativo = true
);

-- 5. Campo Grande
INSERT INTO guata_knowledge_base (pergunta, pergunta_normalizada, resposta, tipo, tags, fonte)
SELECT 
  'O que é Campo Grande?',
  'o que e campo grande',
  '🦦 Campo Grande é a capital de Mato Grosso do Sul, conhecida como a "Cidade Morena"! 😊

É uma cidade que combina urbanização com natureza de forma única! Principais atrações:

• Bioparque Pantanal - Maior aquário de água doce do mundo! 🐠
• Parque das Nações Indígenas - Onde você sente a energia da nossa cultura ✨
• Parque Horto Florestal - Um pedacinho da Amazônia no coração da cidade 🌿
• Feira Central - Comida boa, artesanato, música... É a alma da cidade! 🎵
• Orla Morena - Perfeita para ver o pôr do sol 🌅

É uma cidade que vai te surpreender! O que mais te interessa conhecer?',
  'local',
  ARRAY['campo grande', 'capital', 'cidade morena', 'atrações', 'turismo urbano'],
  'manual'
WHERE NOT EXISTS (
  SELECT 1 FROM guata_knowledge_base 
  WHERE pergunta_normalizada = 'o que e campo grande' AND ativo = true
);

-- 6. Fundtur
INSERT INTO guata_knowledge_base (pergunta, pergunta_normalizada, resposta, tipo, tags, fonte)
SELECT 
  'O que é a Fundtur?',
  'o que e a fundtur',
  '🦦 A Fundtur (Fundação de Turismo de Mato Grosso do Sul) é a instituição responsável por promover e desenvolver o turismo no nosso estado! 

Ela trabalha para:
• Promover Mato Grosso do Sul como destino turístico
• Desenvolver políticas públicas de turismo
• Apoiar eventos e iniciativas turísticas
• Fomentar o setor de turismo em MS

A Fundtur é essencial para o crescimento do turismo em nosso estado! 😊',
  'conceito',
  ARRAY['fundtur', 'turismo', 'governo', 'políticas públicas'],
  'manual'
WHERE NOT EXISTS (
  SELECT 1 FROM guata_knowledge_base 
  WHERE pergunta_normalizada = 'o que e a fundtur' AND ativo = true
);

-- 7. Tia Eva
INSERT INTO guata_knowledge_base (pergunta, pergunta_normalizada, resposta, tipo, tags, fonte)
SELECT 
  'Quem é Tia Eva?',
  'quem e tia eva',
  '🦦 Tia Eva foi uma figura importante na história de Campo Grande! Ela foi uma das primeiras moradoras da cidade e é conhecida por ter sido uma das fundadoras de Campo Grande. Tia Eva é uma personagem histórica que representa a força e a determinação das mulheres que ajudaram a construir nossa cidade! 😊',
  'pessoa',
  ARRAY['tia eva', 'história', 'campo grande', 'fundadores'],
  'manual'
WHERE NOT EXISTS (
  SELECT 1 FROM guata_knowledge_base 
  WHERE pergunta_normalizada = 'quem e tia eva' AND ativo = true
);

-- Verificar entradas inseridas
SELECT 
  pergunta,
  tipo,
  tags,
  usado_por,
  criado_em
FROM guata_knowledge_base
WHERE fonte = 'manual'
ORDER BY criado_em DESC;
