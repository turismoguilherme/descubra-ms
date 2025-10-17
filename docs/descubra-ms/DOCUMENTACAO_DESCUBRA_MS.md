## Visão Geral

Este documento descreve, de ponta a ponta, como funciona o módulo Descubra Mato Grosso do Sul (Descubra MS) e sua área administrativa, sem alterar o que foi construído. Trago a arquitetura, rotas, navegação, contextos globais, autenticação/autorização, módulos Guatá e Passaporte Digital, gestão de conteúdo e integrações com Supabase.

### Stack e Bootstrap
- **Framework**: React + Vite
- **Roteamento**: `react-router-dom`
- **Data fetching**: `@tanstack/react-query`
- **UI**: Tailwind + componentes internos (`ui/*`)
- **Autenticação**: Supabase Auth
- **Serverless/DB**: Supabase (client + edge functions)

Providers globais e roteador são montados no `App.tsx`:
```97:113:src/App.tsx
    <QueryClientProvider client={queryClient}>
      <SecurityHeaders />
      <TourismDataProvider>
        <AuthProvider>
          <CSRFProvider>
            <SecurityProvider
              enableSessionTimeout={true}
              sessionTimeoutMinutes={30}
              sessionWarningMinutes={5}
            >
            <TooltipProvider>
              <Toaster />
              <BrowserRouter>
                <BrandProvider>
                  <ProfileCompletionChecker>
```

## Multi-tenant, Branding e Layout

### Branding e alternância de marca
- `BrandProvider` decide entre OverFlow One e `Descubra MS` conforme o pathname e, se ativo, aplica overrides dinâmicos de tenant.
- Navegação e CTAs são adaptados para cada marca.

Trecho relevante em `BrandContext.tsx`:
```122:131:src/context/BrandContext.tsx
    // Prioritize MS config if path starts with /ms or currentTenant is 'ms'
    if (location.pathname.toLowerCase().startsWith('/ms')) {
      currentConfig = { ...msConfig }; // Start with msConfig
      console.log("🔍 BrandContext: Path /ms detectado (case-insensitive), usando msConfig como base.");
    } else {
      currentConfig = { ...overflowOneConfig }; // Default to overflowOneConfig
      console.log("🔍 BrandContext: Usando overflowOneConfig como base.");
    }
```

E aplicação de overrides quando multi-tenant dinâmico está ativo:
```143:151:src/context/BrandContext.tsx
        navigation: msConfig.navigation.map(nav => ({
          ...nav,
          path: nav.path.replace('/ms', `/${tenantConfig.code}`)
        })),
        authenticatedNavigation: msConfig.authenticatedNavigation.map(nav => ({
          ...nav,
          path: nav.path.replace('/ms', `/${tenantConfig.code}`)
        })),
```

### Layout universal
- Páginas MS usam `UniversalLayout` (navbar/rodapé universais) ou `Navbar/Footer` específicos.

```11:16:src/components/layout/UniversalLayout.tsx
    <div className="min-h-screen flex flex-col">
      <UniversalNavbar />
      <main className="flex-grow">
        {children}
      </main>
      <UniversalFooter />
```

Navbar universal escolhe o destino da logo conforme a marca:
```24:31:src/components/layout/UniversalNavbar.tsx
          <Link to={isOverflowOne ? "/" : "/ms"} className="flex items-center justify-center flex-1 md:flex-none md:justify-start">
            <div className="flex items-center">
              <img 
                alt={config.logo.alt}
                src={config.logo.src}
                className="h-12 w-auto transition-transform duration-300 hover:scale-105 object-contain" 
                loading="eager"
```

## Rotas Descubra MS

Correções recentes: redirecionamentos legados com parâmetros agora preservam os valores (ex.: `/destinos/:id`, `/eventos/:id`, `/roteiros/:routeId`) usando `ParamRedirect`, evitando telas brancas ao navegar por links antigos.

Rotas principais do tenant MS (públicas e protegidas) estão definidas em `App.tsx`:
```140:157:src/App.tsx
                      {/* MS Routes */}
                      <Route path="/ms" element={<MSIndex />} />
                      <Route path="/ms/welcome" element={<Welcome />} />
                      <Route path="/ms/register" element={<Register />} />
                      <Route path="/ms/login" element={<Login />} />
                      <Route path="/ms/auth" element={<AuthPage />} />
                      <Route path="/ms/password-reset" element={<Suspense fallback={<LoadingFallback />}><PasswordResetForm /></Suspense>} />
                      <Route path="/ms/admin" element={<Suspense fallback={<LoadingFallback />}><AdminPortal /></Suspense>} />
                      <Route path="/ms/admin-seed" element={<Suspense fallback={<LoadingFallback />}><AdminSeedForm /></Suspense>} />
                      <Route path="/ms/management" element={
                        <ProtectedRoute allowedRoles={['master_admin', 'state_admin']}>
                          <Management />
                        </ProtectedRoute>
                      } />
                      <Route path="/ms/technical-admin" element={<Suspense fallback={<LoadingFallback />}><TechnicalAdmin /></Suspense>} />
                      <Route path="/ms/passaporte" element={<Suspense fallback={<LoadingFallback />}><DigitalPassport /></Suspense>} />
                      <Route path="/ms/guata" element={<Suspense fallback={<LoadingFallback />}><Guata /></Suspense>} />
                      {/* Rotas de teste removidas - funcionalidades integradas no sistema principal */}
```

Rotas administrativas adicionais:
```215:225:src/App.tsx
                      {/* Novas Rotas de Administração de Roteiros (Protegidas) */}
                      <Route path="/ms/admin/routes-management" element={
                        <ProtectedRoute allowedRoles={['master_admin', 'state_admin', 'city_admin', 'gestor_municipal']}>
                          <Suspense fallback={<LoadingFallback />}><RoutesManagement /></Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="/ms/admin/route-editor/:id?" element={
                        <ProtectedRoute allowedRoles={['master_admin', 'state_admin', 'city_admin', 'gestor_municipal']}>
                          <Suspense fallback={<LoadingFallback />}><RouteEditorPage /></Suspense>
                        </ProtectedRoute>
                      } />
```

Regras de acesso por role em rotas específicas:
```168:177:src/App.tsx
                      <Route path="/ms/attendant-checkin" element={
                        <ProtectedRoute allowedRoles={['atendente']} requireCity>
                          <Suspense fallback={<LoadingFallback />}><AttendantCheckIn /></Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="/ms/municipal-admin" element={
                        <ProtectedRoute allowedRoles={['city_admin']} requireCity>
                          <MunicipalAdmin />
                        </ProtectedRoute>
                      } />
```

## Contextos de Dados

### TourismDataContext
- Carrega e expõe dados turísticos via `useTourismData` (estatísticas, regiões, eventos) para páginas como `MSIndex` e seções da home.

### BrandContext
- Adapta logo, navegação e CTAs conforme `tenant` e modo multi-tenant (overrides dinâmicos quando configurado no Supabase).

## Autenticação e Autorização

### AuthProvider
- Escuta mudanças de sessão Supabase, carrega perfil (`user_profiles`) e role/cidade/região (`user_roles`).
- Possui fallback de “dados de teste” via `localStorage` para cenários sem sessão real.

```54:83:src/hooks/auth/AuthProvider.tsx
        if (!session && testUserData && testToken === 'test-token') {
          // Usar dados de teste
          console.log("🧪 AuthProvider: Usando dados de teste");
          const testData = JSON.parse(testUserData);
          
          // Criar usuário simulado
          const testUser = {
            id: testData.id,
            email: testData.email,
            created_at: testData.created_at
          } as User;
          
          // Criar perfil simulado
          const testProfile: UserProfile = {
            user_id: testData.id,
            full_name: testData.name,
            role: testData.role,
            city_id: testData.role === 'gestor_municipal' ? 'campo-grande' : 
                     testData.role === 'gestor_igr' ? 'dourados' : 'campo-grande',
            region_id: testData.role === 'gestor_igr' ? 'igr-grande-dourados' : 'regiao-pantanal'
          };
          
          setSession(null);
          setUser(testUser);
          setUserProfile(testProfile);
```

### ProtectedRoute
- Verifica: loading, sessão, perfil, roles permitidas e requisitos de região/cidade.

```26:40:src/components/auth/ProtectedRoute.tsx
  // Verificar autenticação
  if (!user) {
    return <Navigate to="/ms/login" state={{ from: location }} replace />;
  }

  // Verificar perfil do usuário
  if (!userProfile) {
    return <Navigate to="/ms/complete-profile" state={{ from: location }} replace />;
  }

  // Verificar permissões de role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/ms/unauthorized" replace />;
  }
```

## Módulos Funcionais

### Home do MS (`/ms`)
- Página `MSIndex` renderiza `UniversalHero`, seções informativas e estatísticas consumindo `useTourismData`.

### Destinos (`/ms/destinos`)
- Lista destinos da tabela `destinations` no Supabase, exigindo sessão.
- Em ausência de sessão, redireciona para cadastro (`/register`).

```30:45:src/pages/Destinos.tsx
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Acesso restrito",
          description: "Faça seu cadastro para explorar os destinos de Mato Grosso do Sul.",
          variant: "destructive",
        });
        navigate("/register");
        return;
      }
    };
```

### Guatá (Assistente de Turismo)
- Versão autenticada: `/ms/guata` (Navbar/Footer, conversa persistente, feedback).
- Versão pública: `/chatguata` (tela inicial tipo totem e chat sem Navbar/Footer, foco em UX de quiosque).
- Usa hooks específicos: `useGuataConnection`, `useGuataConversation`, `useGuataInput` e base de conhecimento em `services/ai/knowledge/guataKnowledgeBase`.

### Passaporte Digital (`/ms/passaporte`)
- Página informativa e CTA para roteiros.
- Componente avançado `EnhancedDigitalPassport` integra `rewardService` e `tourismPassportService` para exibir recompensas e progresso do usuário autenticado.

```56:66:src/components/passport/EnhancedDigitalPassport.tsx
  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Meu Passaporte Digital</CardTitle>
          <p className="text-gray-600">Seu progresso e recompensas no Descubra MS.</p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Pontos Totais: {totalPoints}</h3>
            {/* Exemplo de barra de progresso para o próximo nível/milestone */}
            <Progress value={(totalPoints / 1000) * 100} className="w-full" />
```

## Área Administrativa

### Admin Portal (`/ms/admin`)
- Hub que roteia para dashboards conforme role via `useRoleBasedAccess`.
- Dashboards: atendente, municipal, regional (IGR), estadual, master/admin, tech.

### Management (`/ms/management`)
- Acesso para `master_admin` e `state_admin`.
- Controle por `useSecureAuth`, seleção de região e módulos de dashboard e IA analítica.

### Municipal Admin (`/ms/municipal-admin`)
- Acesso para `city_admin` com cidade associada.
- Abas: Colaboradores, City Tours, Arquivos, Pesquisas.

### Gestão de Eventos e Roteiros
- `events-management`: exige role `admin/tech/municipal_manager`, lista e edita eventos.
- `routes-management` e `route-editor`: CRUD de roteiros (lista, edição, deleção com cascata em checkpoints pelo serviço).

```93:101:src/pages/RoutesManagement.tsx
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow ms-container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-ms-primary-blue">Gerenciamento de Roteiros</h1>
          <Button onClick={() => navigate("/ms/admin/route-editor")}>
            <PlusCircle size={16} className="mr-2" />
            Novo Roteiro
          </Button>
```

## Integrações Supabase

### Cliente e Tipagem
- Cliente é criado em `integrations/supabase/client.ts` tipado por `Database`.

```11:18:src/integrations/supabase/client.ts
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
```

### Tabelas e dados usados
- Autenticação: `user_profiles`, `user_roles`
- Conteúdo: `destinations`, `events`, `routes` e derivados (via serviços em `src/services/*`)
- Recompensas: serviços em `src/services/rewards/*` e `src/services/passport/*`

### Edge Functions
- Pasta `supabase/functions` contém funções serverless temáticas (ex.: IA, ingest, segurança, integrações comerciais). A documentação funcional detalhada está nos próprios diretórios.

## Ambiente e Segurança

- Configurações em `src/config/environment.ts` (flags, timeouts, rate limit, RAG, etc.).
- `index.html` define uma CSP restritiva para scripts, estilos, fontes e conexões (inclui Supabase, Google APIs e VLibras).
- `SecurityHeaders` e `SecurityProvider` adicionam headers e controles de sessão.

## Fluxos de Usuário

- **Público**: acessa `/ms`, conteúdo informativo, pode usar `GuataPublic` em `/chatguata`.
- **Autenticado**: acessa destinos/eventos/roteiros completos, conversa com Guatá autenticado, Passaporte Digital avançado.
- **Gestores/Admins**: acessam `/ms/admin`, `/ms/management`, `/ms/municipal-admin`, e telas de gestão conforme role.

## Observações de Escalabilidade e Manutenibilidade

- As rotas estão bem segmentadas por tenant (`/ms`) e o uso de `ProtectedRoute` centraliza regras de acesso. Para escalar para novos estados, a camada de branding/multi-tenant já prevê overrides; um próximo passo seria externalizar configurações de tenants no Supabase e cacheá-las via `react-query`.
- A área administrativa é modular (páginas e componentes por domínio). Para manter manutenibilidade, recomendo padronizar os serviços de domínio em `src/services/*` com contratos tipados e consolidar validações/acessos em hooks reutilizáveis (`useSecureAuth`, `useRoleBasedAccess`), além de aplicar lazy-loading consistente nas telas administrativas para reduzir TTI.
