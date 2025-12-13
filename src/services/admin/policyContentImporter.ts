/**
 * Serviço para importar conteúdo dos arquivos .tsx para o editor de políticas
 * Contém o conteúdo extraído dos arquivos de políticas hardcoded
 */

export const policyContentImporter = {
  /**
   * Retorna o conteúdo em texto simples extraído dos arquivos .tsx
   * Este conteúdo pode ser convertido para Markdown e importado no editor
   */
  getContentFromFile(policyKey: string, platform: 'viajar' | 'descubra_ms'): string {
    const contentMap: Record<string, Record<string, string>> = {
      terms_of_use: {
        descubra_ms: `Estes Termos de Uso regem o uso da plataforma Descubra Mato Grosso do Sul, operada pela viajARTUR. Ao acessar e utilizar esta plataforma, você concorda com estes termos. Se você não concordar com qualquer parte destes termos, não deve utilizar nossos serviços.

## 1. Aceitação dos Termos

Ao criar uma conta, acessar ou utilizar qualquer funcionalidade da plataforma Descubra Mato Grosso do Sul, você declara que:

- Leu, compreendeu e concordou com estes Termos de Uso;
- Concordou com nossa Política de Privacidade;
- Possui capacidade legal para celebrar este acordo;
- Forneceu informações verdadeiras, precisas e atualizadas;
- É responsável por manter a segurança de sua conta e senha.

## 2. Descrição dos Serviços

A plataforma Descubra Mato Grosso do Sul oferece os seguintes serviços:

**Informações sobre Destinos Turísticos**
Informações detalhadas sobre pontos turísticos, atrações, roteiros e experiências no estado.

**Passaporte Digital**
Sistema de check-in em pontos turísticos com registro de visitas e recompensas.

**Guatá - Assistente Virtual com IA**
Assistente virtual inteligente para tirar dúvidas e fornecer informações sobre turismo.

**Cadastro de Eventos**
Funcionalidade para cadastrar e promover eventos turísticos e culturais.

**Programa de Parceiros**
Sistema para estabelecimentos turísticos se cadastrarem como parceiros da plataforma.

## 3. Cadastro e Conta do Usuário

Para utilizar determinadas funcionalidades, você precisará criar uma conta:

- Você é responsável por manter a confidencialidade de suas credenciais de acesso;
- Você é responsável por todas as atividades que ocorrem em sua conta;
- Você deve nos notificar imediatamente sobre qualquer uso não autorizado;
- Você deve fornecer informações verdadeiras, precisas e atualizadas;
- Você deve ter pelo menos 18 anos ou ter autorização de responsável legal;
- Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos.

## 4. Condutas Proibidas

Você concorda em NÃO utilizar a plataforma para:

- Publicar conteúdo ofensivo, difamatório, discriminatório ou ilegal;
- Violar direitos de propriedade intelectual de terceiros;
- Tentar acessar áreas restritas ou sistemas da plataforma;
- Transmitir vírus, malware ou códigos maliciosos;
- Realizar atividades fraudulentas ou enganosas;
- Coletar dados de outros usuários sem autorização;
- Utilizar a plataforma para spam ou publicidade não autorizada;
- Criar contas falsas ou se passar por outra pessoa;
- Interferir no funcionamento normal da plataforma.

A violação destas regras pode resultar em suspensão ou encerramento imediato da conta, além de medidas legais cabíveis.

## 5. Propriedade Intelectual

Todo o conteúdo da plataforma, incluindo textos, imagens, logos, design, código-fonte e funcionalidades, é de propriedade da viajARTUR ou de seus licenciadores e está protegido por leis de propriedade intelectual.

**Você pode:** visualizar, baixar e imprimir conteúdo para uso pessoal e não comercial.

**Você NÃO pode:** reproduzir, distribuir, modificar, criar obras derivadas, publicar, transmitir ou explorar comercialmente qualquer conteúdo sem autorização prévia por escrito.

Ao enviar conteúdo para a plataforma (comentários, avaliações, fotos, etc.), você concede à viajARTUR uma licença não exclusiva, mundial e gratuita para utilizar, reproduzir e exibir esse conteúdo na plataforma.

## 6. Limitação de Responsabilidade

A plataforma é fornecida "como está" e "conforme disponível". A viajARTUR não garante que:

- A plataforma estará sempre disponível, ininterrupta ou livre de erros;
- Os resultados obtidos através da plataforma serão precisos ou confiáveis;
- Defeitos serão corrigidos;
- A plataforma estará livre de vírus ou outros componentes prejudiciais.

**Importante:** A viajARTUR não se responsabiliza por:

- Danos diretos, indiretos, incidentais ou consequenciais decorrentes do uso da plataforma;
- Perda de dados, lucros ou oportunidades de negócio;
- Informações incorretas fornecidas por terceiros (parceiros, prestadores de serviços);
- Experiências turísticas que não atendam às expectativas do usuário;
- Cancelamentos ou alterações em eventos ou serviços de terceiros.

## 7. Links para Sites de Terceiros

A plataforma pode conter links para sites de terceiros (parceiros, prestadores de serviços, etc.). Esses links são fornecidos apenas para sua conveniência.

A viajARTUR não tem controle sobre o conteúdo, políticas de privacidade ou práticas de sites de terceiros e não se responsabiliza por eles. Recomendamos que você leia os termos e políticas de privacidade de qualquer site de terceiro que visitar.

## 8. Modificações nos Serviços e Termos

A viajARTUR se reserva o direito de:

- Modificar, suspender ou descontinuar qualquer aspecto da plataforma a qualquer momento;
- Atualizar estes Termos de Uso periodicamente;
- Notificar sobre alterações através da plataforma ou e-mail cadastrado.

O uso continuado da plataforma após alterações nos termos constitui aceitação das mesmas. Se você não concordar com as alterações, deve cessar o uso da plataforma e encerrar sua conta.

## 9. Rescisão

Você pode encerrar sua conta a qualquer momento através das configurações da plataforma ou entrando em contato conosco.

A viajARTUR pode suspender ou encerrar sua conta imediatamente, sem aviso prévio, se você violar estes Termos de Uso ou se houver qualquer atividade suspeita ou fraudulenta.

Após o encerramento, você perderá acesso à sua conta e a todos os dados associados, exceto quando a retenção for exigida por lei.

## 10. Lei Aplicável e Foro

Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.

Qualquer disputa decorrente destes termos será resolvida no foro da comarca de Campo Grande - MS, renunciando as partes a qualquer outro, por mais privilegiado que seja.

## 11. Disposições Gerais

- Se qualquer disposição destes termos for considerada inválida, as demais disposições permanecerão em vigor;
- Estes termos constituem o acordo completo entre você e a viajARTUR sobre o uso da plataforma;
- A falha da viajARTUR em exercer qualquer direito não constitui renúncia a esse direito;
- Você não pode transferir seus direitos ou obrigações sob estes termos sem nosso consentimento prévio por escrito.

## 12. Contato

Para questões sobre estes Termos de Uso, entre em contato:

**viajARTUR**
Responsável pela plataforma Descubra Mato Grosso do Sul

**E-mail:** contato@descubramsconline.com.br
**Telefone:** (67) 3318-7600

Ao utilizar a plataforma Descubra Mato Grosso do Sul, você declara ter lido, compreendido e concordado com estes Termos de Uso.`,
        viajar: `Estes Termos de Uso regem o uso da plataforma ViajARTur, operada pela viajARTUR. Ao acessar e utilizar esta plataforma, você concorda com estes termos. Se você não concordar com qualquer parte destes termos, não deve utilizar nossos serviços.

## 1. Aceitação dos Termos

Ao criar uma conta, acessar ou utilizar qualquer funcionalidade da plataforma ViajARTur, você declara que:

- Leu, compreendeu e concordou com estes Termos de Uso;
- Concordou com nossa Política de Privacidade;
- Possui capacidade legal para celebrar este acordo;
- Forneceu informações verdadeiras, precisas e atualizadas;
- É responsável por manter a segurança de sua conta e senha.

## 2. Descrição dos Serviços

A plataforma ViajARTur oferece serviços de gestão e automação para o setor de turismo, incluindo:

- Sistema de gestão de destinos turísticos;
- Automação de processos administrativos;
- Ferramentas de marketing e promoção;
- Integração com sistemas de terceiros;
- Análise de dados e relatórios.

## 3. Cadastro e Conta do Usuário

Para utilizar determinadas funcionalidades, você precisará criar uma conta:

- Você é responsável por manter a confidencialidade de suas credenciais de acesso;
- Você é responsável por todas as atividades que ocorrem em sua conta;
- Você deve nos notificar imediatamente sobre qualquer uso não autorizado;
- Você deve fornecer informações verdadeiras, precisas e atualizadas;
- Você deve ter pelo menos 18 anos ou ter autorização de responsável legal.

## 4. Condutas Proibidas

Você concorda em NÃO utilizar a plataforma para:

- Publicar conteúdo ofensivo, difamatório, discriminatório ou ilegal;
- Violar direitos de propriedade intelectual de terceiros;
- Tentar acessar áreas restritas ou sistemas da plataforma;
- Transmitir vírus, malware ou códigos maliciosos;
- Realizar atividades fraudulentas ou enganosas.

## 5. Propriedade Intelectual

Todo o conteúdo da plataforma é de propriedade da viajARTUR ou de seus licenciadores e está protegido por leis de propriedade intelectual.

**Você pode:** utilizar a plataforma conforme os termos de sua assinatura.

**Você NÃO pode:** reproduzir, distribuir, modificar ou criar obras derivadas sem autorização prévia por escrito.

## 6. Limitação de Responsabilidade

A plataforma é fornecida "como está" e "conforme disponível". A viajARTUR não garante que a plataforma estará sempre disponível, ininterrupta ou livre de erros.

## 7. Modificações nos Serviços e Termos

A viajARTUR se reserva o direito de modificar, suspender ou descontinuar qualquer aspecto da plataforma a qualquer momento.

## 8. Rescisão

Você pode encerrar sua conta a qualquer momento. A viajARTUR pode suspender ou encerrar sua conta imediatamente se você violar estes Termos de Uso.

## 9. Contato

Para questões sobre estes Termos de Uso, entre em contato através do suporte da plataforma.

Ao utilizar a plataforma ViajARTur, você declara ter lido, compreendido e concordado com estes Termos de Uso.`,
      },
      privacy_policy: {
        descubra_ms: `Esta Política de Privacidade descreve como a viajARTUR coleta, usa e protege suas informações pessoais quando você utiliza a plataforma Descubra Mato Grosso do Sul.

## 1. Informações que Coletamos

Coletamos informações que você nos fornece diretamente, incluindo:

- Nome completo;
- Endereço de e-mail;
- Número de telefone;
- Informações de perfil;
- Conteúdo que você publica na plataforma.

## 2. Como Usamos suas Informações

Utilizamos suas informações para:

- Fornecer e melhorar nossos serviços;
- Comunicar-nos com você;
- Personalizar sua experiência;
- Enviar notificações importantes;
- Cumprir obrigações legais.

## 3. Compartilhamento de Informações

Não vendemos suas informações pessoais. Podemos compartilhar suas informações apenas:

- Com seu consentimento;
- Para cumprir obrigações legais;
- Com prestadores de serviços que nos ajudam a operar a plataforma.

## 4. Segurança dos Dados

Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais.

## 5. Seus Direitos

Você tem o direito de:

- Acessar suas informações pessoais;
- Corrigir informações incorretas;
- Solicitar a exclusão de suas informações;
- Opor-se ao processamento de suas informações.

## 6. Cookies

Utilizamos cookies para melhorar sua experiência na plataforma. Você pode gerenciar suas preferências de cookies nas configurações do navegador.

## 7. Alterações nesta Política

Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre alterações significativas.

## 8. Contato

Para questões sobre privacidade, entre em contato:

**E-mail:** contato@descubramsconline.com.br
**Telefone:** (67) 3318-7600

Esta Política de Privacidade está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).`,
        viajar: `Esta Política de Privacidade descreve como a viajARTUR coleta, usa e protege suas informações pessoais quando você utiliza a plataforma ViajARTur.

## 1. Informações que Coletamos

Coletamos informações que você nos fornece diretamente, incluindo:

- Dados de cadastro;
- Informações de perfil;
- Dados de uso da plataforma;
- Informações de pagamento (processadas de forma segura).

## 2. Como Usamos suas Informações

Utilizamos suas informações para:

- Fornecer e melhorar nossos serviços;
- Processar pagamentos;
- Comunicar-nos com você;
- Personalizar sua experiência.

## 3. Segurança dos Dados

Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais.

## 4. Seus Direitos

Você tem o direito de acessar, corrigir e excluir suas informações pessoais.

## 5. Contato

Para questões sobre privacidade, entre em contato através do suporte da plataforma.

Esta Política de Privacidade está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).`,
      },
      cookie_policy: {
        both: `A ViajARTur utiliza cookies e tecnologias similares para melhorar sua experiência em nossa plataforma. Esta política explica detalhadamente o que são cookies, quais utilizamos, suas finalidades e como você pode gerenciá-los.

## 1. O que são Cookies?

Cookies são pequenos arquivos de texto armazenados em seu dispositivo (computador, tablet ou smartphone) quando você visita um site. Eles são amplamente utilizados para fazer sites funcionarem de forma mais eficiente e fornecer informações aos proprietários do site.

**Segurança dos Cookies**

Cookies **não podem** executar programas, transmitir vírus ou acessar outros dados do seu dispositivo. Eles servem apenas para armazenar informações específicas sobre sua navegação.

## 2. Tipos de Cookies que Utilizamos

### Cookies Essenciais (Obrigatórios)

Necessários para o funcionamento básico da plataforma. **Não podem ser desativados** pois a plataforma não funcionaria corretamente sem eles.

- **Autenticação:** Manter você conectado durante sua sessão
- **Segurança:** Proteger contra ataques e acessos não autorizados
- **Funcionalidade:** Garantir que recursos essenciais funcionem corretamente

### Cookies de Preferências

Lembram suas configurações e preferências para personalizar sua experiência. Você pode desativá-los, mas algumas funcionalidades podem não funcionar como esperado.

- **Tema:** Preferências de aparência (claro/escuro)
- **Idioma:** Idioma preferido
- **Layout:** Configurações de interface

### Cookies de Análise

Coletam informações sobre como você utiliza a plataforma, permitindo-nos melhorar a experiência do usuário. Dados são anonimizados e agregados.

- **Uso da plataforma:** Páginas visitadas, tempo de permanência
- **Performance:** Identificar problemas técnicos
- **Melhorias:** Entender como melhorar os serviços

## 3. Cookies de Terceiros

Utilizamos serviços de terceiros que também podem armazenar cookies:

- **Supabase:** Hospedagem, banco de dados, autenticação
- **Stripe:** Processamento de pagamentos
- **Vercel:** Hospedagem da aplicação web
- **Google (Gemini):** Inteligência Artificial

Cada serviço de terceiros tem sua própria política de privacidade e cookies.

## 4. Como Utilizamos os Cookies

Utilizamos cookies para as seguintes finalidades:

- **Autenticação:** Manter você conectado durante sua sessão
- **Segurança:** Proteger contra ataques e acessos não autorizados
- **Preferências:** Lembrar suas configurações (tema, layout)
- **Análise:** Entender como você usa a plataforma para melhorias
- **Pagamentos:** Processar transações de forma segura

## 5. Como Gerenciar Cookies

Você pode gerenciar ou desabilitar cookies através das configurações do seu navegador:

**Google Chrome:** Configurações → Privacidade e segurança → Cookies e outros dados do site

**Mozilla Firefox:** Configurações → Privacidade e Segurança → Cookies e dados de sites

**Safari:** Preferências → Privacidade → Gerenciar dados do site

**Microsoft Edge:** Configurações → Cookies e permissões do site → Cookies

**Atenção:** Desabilitar cookies essenciais pode afetar o funcionamento da plataforma, impossibilitando o login e algumas funcionalidades. Cookies de preferências desabilitados farão com que suas configurações não sejam lembradas.

## 6. Duração dos Cookies

Os cookies podem ser classificados pela sua duração:

**Cookies de Sessão:** Temporários, são excluídos quando você fecha o navegador. Usados para autenticação e segurança.

**Cookies Persistentes:** Permanecem por um período definido (dias, meses ou anos). Usados para preferências e análise.

## 7. Atualizações desta Política

Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças em nossos serviços ou requisitos legais. Quando houver alterações significativas:

- Você será notificado por e-mail;
- A data de "Última atualização" será alterada;
- Um aviso será exibido na plataforma.

## 8. Contato

Para dúvidas sobre esta Política de Cookies:

**ViajARTur**

**E-mail:** privacidade@viajartur.com.br
**Telefone:** (67) 3000-0000

Ao continuar navegando na plataforma ViajARTur, você concorda com o uso de cookies conforme descrito nesta política.`,
      },
    };

    return contentMap[policyKey]?.[platform] || contentMap[policyKey]?.['both'] || '';
  },
};

