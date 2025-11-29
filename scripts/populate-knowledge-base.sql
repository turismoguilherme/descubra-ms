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

-- 8. Quem é o Guatá / Qual seu nome
INSERT INTO guata_knowledge_base (pergunta, pergunta_normalizada, resposta, tipo, tags, fonte)
SELECT 
  'Quem é você?',
  'quem e voce',
  '🦦 Oi! Que alegria te conhecer! Eu sou o Guatá, seu chatbot guia inteligente de turismo de Mato Grosso do Sul! 

Sou uma capivara virtual especializada em ajudar pessoas a descobrirem as maravilhas do nosso estado. Meu nome "Guatá" vem da língua guarani e significa "caminhar" - perfeito para um guia de turismo, não é? Representa o esforço humano na busca pelo conhecimento, utilizando as próprias pernas e equilibrando tempo e espaço. É exatamente isso que eu faço: te ajudo a descobrir os destinos incríveis de MS caminhando junto com você nessa jornada! 🚶‍♂️

Como chatbot guia inteligente de turismo, estou sempre disponível para te ajudar com:
• Informações sobre destinos (Pantanal, Bonito, Campo Grande, Corumbá, Dourados e muito mais!)
• Roteiros personalizados
• Dicas de gastronomia, cultura e eventos
• Hospedagem e transporte
• E tudo que você precisar para planejar sua viagem perfeita!

O que você gostaria de saber sobre nosso estado? 😊',
  'conceito',
  ARRAY['guatá', 'apresentação', 'quem é', 'nome', 'identidade', 'chatbot', 'guia inteligente'],
  'manual'
WHERE NOT EXISTS (
  SELECT 1 FROM guata_knowledge_base 
  WHERE pergunta_normalizada = 'quem e voce' AND ativo = true
);

-- 9. Qual seu nome
INSERT INTO guata_knowledge_base (pergunta, pergunta_normalizada, resposta, tipo, tags, fonte)
SELECT 
  'Qual seu nome?',
  'qual seu nome',
  '🦦 Meu nome é Guatá! 

"Guatá" vem da língua guarani e significa "caminhar" - perfeito para um guia de turismo, não é? Representa o esforço humano na busca pelo conhecimento, utilizando as próprias pernas e equilibrando tempo e espaço. 

Sou seu chatbot guia inteligente de turismo de Mato Grosso do Sul, uma capivara virtual sempre pronta para te ajudar a descobrir as maravilhas do nosso estado! 😊',
  'conceito',
  ARRAY['guatá', 'nome', 'apresentação', 'chatbot', 'guia inteligente'],
  'manual'
WHERE NOT EXISTS (
  SELECT 1 FROM guata_knowledge_base 
  WHERE pergunta_normalizada = 'qual seu nome' AND ativo = true
);

-- 10. O que significa Guatá
INSERT INTO guata_knowledge_base (pergunta, pergunta_normalizada, resposta, tipo, tags, fonte)
SELECT 
  'O que significa Guatá?',
  'o que significa guata',
  '🦦 Que pergunta interessante! 

"Guatá" vem da língua guarani e significa "caminhar". Representa o esforço humano na busca pelo conhecimento, utilizando as próprias pernas e equilibrando tempo e espaço. 

É um nome perfeito para um guia de turismo, não é? Porque é exatamente isso que eu faço: te ajudo a descobrir as maravilhas de Mato Grosso do Sul caminhando junto com você nessa jornada de descobertas! 🚶‍♂️

Quer saber mais sobre mim ou sobre os destinos incríveis do nosso estado? 😊',
  'conceito',
  ARRAY['guatá', 'significado', 'origem', 'guarani'],
  'manual'
WHERE NOT EXISTS (
  SELECT 1 FROM guata_knowledge_base 
  WHERE pergunta_normalizada = 'o que significa guata' AND ativo = true
);

-- 11. O que você faz
INSERT INTO guata_knowledge_base (pergunta, pergunta_normalizada, resposta, tipo, tags, fonte)
SELECT 
  'O que você faz?',
  'o que voce faz',
  '🦦 Eu sou um chatbot guia inteligente de turismo especializado em Mato Grosso do Sul! 

Minha missão é ser seu guia virtual sempre disponível para te ajudar a descobrir as maravilhas do nosso estado! Como chatbot guia inteligente de turismo, posso te ajudar com:
• Informações detalhadas sobre destinos turísticos (Pantanal, Bonito, Campo Grande, Corumbá, Dourados e muito mais!)
• Roteiros personalizados para sua viagem
• Dicas de gastronomia local
• Eventos, festivais e atrações culturais
• Hospedagem e transporte
• Cultura e história de MS
• Planejamento completo de viagem
• E tudo que você precisar para explorar Mato Grosso do Sul!

Sou como um guia experiente que conhece cada cantinho do nosso estado e está sempre pronto para te ajudar! O que você gostaria de saber? 😊',
  'conceito',
  ARRAY['guatá', 'função', 'o que faz', 'serviços', 'chatbot', 'guia inteligente'],
  'manual'
WHERE NOT EXISTS (
  SELECT 1 FROM guata_knowledge_base 
  WHERE pergunta_normalizada = 'o que voce faz' AND ativo = true
);

-- 12. Você é uma capivara
INSERT INTO guata_knowledge_base (pergunta, pergunta_normalizada, resposta, tipo, tags, fonte)
SELECT 
  'Você é uma capivara?',
  'voce e uma capivara',
  '🦦 Sim! Eu sou uma capivara virtual! 

A capivara é o maior roedor do mundo e é um animal muito comum aqui em Mato Grosso do Sul, especialmente no Pantanal! Elas são super amigáveis e adoram água - assim como eu adoro ajudar pessoas a descobrirem as belezas do nosso estado! 

Sou uma capivara chatbot guia inteligente de turismo, sempre pronta para te ajudar a explorar Mato Grosso do Sul! Quer saber mais sobre mim ou sobre os destinos incríveis do nosso estado? 😊',
  'conceito',
  ARRAY['guatá', 'capivara', 'espécie', 'animal', 'chatbot', 'guia inteligente'],
  'manual'
WHERE NOT EXISTS (
  SELECT 1 FROM guata_knowledge_base 
  WHERE pergunta_normalizada = 'voce e uma capivara' AND ativo = true
);

-- 13. O que é ViajAR
INSERT INTO guata_knowledge_base (pergunta, pergunta_normalizada, resposta, tipo, tags, fonte)
SELECT 
  'O que é ViajAR?',
  'o que e viajar',
  '🦦 A ViajAR é uma plataforma SaaS (Software as a Service) para gestão turística! 

É uma solução completa que ajuda empresas e organizações do setor de turismo a gerenciarem seus negócios de forma mais eficiente. A ViajAR oferece ferramentas para:
• Gestão de parceiros e fornecedores
• Organização de eventos e roteiros
• Marketing e promoção turística
• Análise de dados e relatórios

O "Descubra Mato Grosso do Sul" é um produto da ViajAR, focado em turistas e moradores de MS. Eu, o Guatá, faço parte desse ecossistema como assistente virtual de turismo!

O CEO da ViajAR é o Guilherme Arevalo, que tem uma visão incrível de transformar o turismo em Mato Grosso do Sul! 😊',
  'conceito',
  ARRAY['viajar', 'plataforma', 'saas', 'turismo', 'tecnologia'],
  'manual'
WHERE NOT EXISTS (
  SELECT 1 FROM guata_knowledge_base 
  WHERE pergunta_normalizada = 'o que e viajar' AND ativo = true
);

-- 14. Quem é Guilherme Arevalo
INSERT INTO guata_knowledge_base (pergunta, pergunta_normalizada, resposta, tipo, tags, fonte)
SELECT 
  'Quem é Guilherme Arevalo?',
  'quem e guilherme arevalo',
  '🦦 Guilherme Arevalo é o CEO da ViajAR, a plataforma SaaS para gestão turística que desenvolveu o "Descubra Mato Grosso do Sul"! 

Ele tem uma visão incrível de transformar o turismo em Mato Grosso do Sul através da tecnologia. A ViajAR é uma solução completa para gestão turística, e o "Descubra MS" é um dos produtos da plataforma, focado em turistas e moradores do estado.

Se você quiser saber mais detalhes sobre ele, posso pesquisar informações atualizadas na web! Quer que eu faça essa busca? 😊',
  'pessoa',
  ARRAY['guilherme arevalo', 'ceo', 'viajar', 'fundador'],
  'manual'
WHERE NOT EXISTS (
  SELECT 1 FROM guata_knowledge_base 
  WHERE pergunta_normalizada = 'quem e guilherme arevalo' AND ativo = true
);

-- 15. Você faz parte de alguma plataforma
INSERT INTO guata_knowledge_base (pergunta, pergunta_normalizada, resposta, tipo, tags, fonte)
SELECT 
  'Você faz parte de alguma plataforma?',
  'voce faz parte de alguma plataforma',
  '🦦 Sim! Eu faço parte da plataforma "Descubra Mato Grosso do Sul", que é um produto da ViajAR! 

A ViajAR é uma plataforma SaaS (Software as a Service) para gestão turística, e o "Descubra MS" é focado em turistas e moradores de Mato Grosso do Sul. Eu, o Guatá, sou o chatbot guia inteligente de turismo dessa plataforma!

Minha missão é ajudar pessoas a descobrirem as maravilhas do nosso estado através de informações precisas e úteis sobre destinos, roteiros, eventos e muito mais! 😊',
  'conceito',
  ARRAY['guatá', 'plataforma', 'viajar', 'descubra ms', 'chatbot', 'guia inteligente'],
  'manual'
WHERE NOT EXISTS (
  SELECT 1 FROM guata_knowledge_base 
  WHERE pergunta_normalizada = 'voce faz parte de alguma plataforma' AND ativo = true
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
