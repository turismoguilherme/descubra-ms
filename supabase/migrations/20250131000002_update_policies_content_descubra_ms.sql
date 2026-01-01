-- Migration: Atualizar conteúdo das políticas de privacidade e termos de uso para Descubra MS
-- Descrição: Atualiza o conteúdo das políticas com informações atualizadas
-- Data: 2025-01-31

-- Criar tabela platform_policies se não existir
CREATE TABLE IF NOT EXISTS platform_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('viajar', 'descubra_ms', 'both')),
  is_published BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(key, platform)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_platform_policies_key ON platform_policies(key);
CREATE INDEX IF NOT EXISTS idx_platform_policies_platform ON platform_policies(platform);
CREATE INDEX IF NOT EXISTS idx_platform_policies_published ON platform_policies(is_published) WHERE is_published = true;

-- Habilitar RLS
ALTER TABLE platform_policies ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler políticas publicadas
DROP POLICY IF EXISTS "Published policies are publicly readable" ON platform_policies;
CREATE POLICY "Published policies are publicly readable"
ON platform_policies
FOR SELECT
TO public
USING (is_published = true);

-- Política: Apenas admins podem gerenciar
DROP POLICY IF EXISTS "Admins can manage policies" ON platform_policies;
CREATE POLICY "Admins can manage policies"
ON platform_policies
FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'tech', 'master_admin')
  )
);

-- Atualizar Política de Privacidade para Descubra MS
INSERT INTO platform_policies (
  key,
  title,
  content,
  platform,
  is_published,
  version,
  updated_at
)
VALUES (
  'privacy_policy',
  'Política de Privacidade',
  '# Política de Privacidade - Descubra Mato Grosso do Sul

A **viajARTUR**, responsável pela plataforma **Descubra Mato Grosso do Sul**, está comprometida com a proteção da privacidade e dos dados pessoais de seus usuários, em conformidade com a **Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)** e demais normas aplicáveis.

## 1. Informações Coletadas

Coletamos informações que você nos fornece diretamente e dados coletados automaticamente durante o uso da plataforma.

### 1.1. Dados Fornecidos pelo Usuário
- Nome completo
- Endereço de e-mail
- Telefone
- Dados de perfil e preferências
- Conteúdo gerado pelo usuário (comentários, avaliações, etc.)

### 1.2. Dados Coletados Automaticamente
- Endereço IP
- Tipo de navegador e sistema operacional
- Páginas visitadas e tempo de permanência
- Cookies e tecnologias similares

## 2. Finalidade do Uso dos Dados

Utilizamos seus dados pessoais para:
- Fornecer e melhorar nossos serviços
- Personalizar sua experiência
- Enviar comunicações importantes
- Cumprir obrigações legais
- Prevenir fraudes e garantir segurança

## 3. Compartilhamento de Dados

Não vendemos seus dados pessoais. Podemos compartilhar informações apenas:
- Com seu consentimento explícito
- Para cumprir obrigações legais
- Com prestadores de serviços que atuam em nosso nome (sob contrato de confidencialidade)
- Em caso de fusão, aquisição ou venda de ativos

## 4. Segurança dos Dados

Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição.

## 5. Seus Direitos

Você tem direito a:
- Acessar seus dados pessoais
- Corrigir dados incompletos ou inexatos
- Solicitar anonimização, bloqueio ou eliminação de dados
- Revogar consentimento
- Solicitar portabilidade dos dados
- Ser informado sobre compartilhamento de dados

## 6. Cookies

Utilizamos cookies para melhorar sua experiência. Para mais informações, consulte nossa [Política de Cookies](/descubrams/cookies).

## 7. Alterações nesta Política

Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas através da plataforma ou por e-mail.

## 8. Contato

Para exercer seus direitos ou esclarecer dúvidas sobre esta política:
- **E-mail:** privacidade@viajartur.com.br
- **Telefone:** (67) 3318-7600

**Última atualização:** Janeiro de 2025',
  'descubra_ms',
  true,
  2,
  NOW()
)
ON CONFLICT (key, platform) 
DO UPDATE SET
  content = EXCLUDED.content,
  version = EXCLUDED.version,
  updated_at = EXCLUDED.updated_at,
  is_published = true;

-- Atualizar Termos de Uso para Descubra MS
INSERT INTO platform_policies (
  key,
  title,
  content,
  platform,
  is_published,
  version,
  updated_at
)
VALUES (
  'terms_of_use',
  'Termos de Uso',
  '# Termos de Uso - Descubra Mato Grosso do Sul

Estes Termos de Uso regem o uso da plataforma **Descubra Mato Grosso do Sul**, operada pela **viajARTUR**. Ao acessar e utilizar esta plataforma, você concorda com estes termos. Se você não concordar com qualquer parte destes termos, não deve utilizar nossos serviços.

## 1. Aceitação dos Termos

Ao acessar e usar a plataforma, você declara que:
- Leu e compreendeu estes Termos de Uso
- Concorda em cumprir todas as leis e regulamentos aplicáveis
- É maior de idade ou possui autorização de responsável legal
- As informações fornecidas são verdadeiras e precisas

## 2. Uso da Plataforma

### 2.1. Uso Permitido
Você pode usar a plataforma para:
- Explorar informações sobre destinos turísticos
- Consultar eventos e atrações
- Interagir com conteúdo e funcionalidades disponíveis
- Criar e gerenciar seu perfil de usuário

### 2.2. Uso Proibido
É proibido:
- Usar a plataforma para fins ilegais ou não autorizados
- Tentar acessar áreas restritas ou sistemas não autorizados
- Interferir no funcionamento da plataforma
- Reproduzir, copiar ou revender conteúdo sem autorização
- Enviar conteúdo ofensivo, difamatório ou ilegal

## 3. Conta de Usuário

### 3.1. Criação de Conta
Para acessar certas funcionalidades, você pode precisar criar uma conta. Você é responsável por:
- Manter a confidencialidade de suas credenciais
- Todas as atividades que ocorrem em sua conta
- Notificar-nos imediatamente sobre uso não autorizado

### 3.2. Encerramento de Conta
Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos.

## 4. Propriedade Intelectual

Todo o conteúdo da plataforma, incluindo textos, imagens, logotipos e software, é propriedade da viajARTUR ou de seus licenciadores e está protegido por leis de propriedade intelectual.

## 5. Limitação de Responsabilidade

A plataforma é fornecida "como está". Não garantimos que:
- A plataforma estará sempre disponível ou livre de erros
- Os resultados obtidos serão precisos ou confiáveis
- Defeitos serão corrigidos

## 6. Modificações nos Termos

Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão comunicadas através da plataforma.

## 7. Lei Aplicável

Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida nos tribunais competentes de Mato Grosso do Sul, Brasil.

## 8. Contato

Para questões sobre estes Termos de Uso:
- **E-mail:** contato@viajartur.com.br
- **Telefone:** (67) 3318-7600

**Última atualização:** Janeiro de 2025',
  'descubra_ms',
  true,
  2,
  NOW()
)
ON CONFLICT (key, platform) 
DO UPDATE SET
  content = EXCLUDED.content,
  version = EXCLUDED.version,
  updated_at = EXCLUDED.updated_at,
  is_published = true;

-- Comentários
COMMENT ON TABLE platform_policies IS 'Políticas da plataforma (privacidade, termos, cookies) por plataforma';

