/**
 * Configuração centralizada de rotas
 * Facilita manutenção e mudanças futuras
 */

// Rota base para Descubra Mato Grosso do Sul
export const MS_BASE_PATH = '/descubramatogrossodosul';

// Rota legada (mantida para compatibilidade e redirecionamento)
export const MS_LEGACY_PATH = '/ms';

// Helper para construir rotas do MS
export const msRoute = (path: string = '') => {
  // Remove barra inicial se existir
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${MS_BASE_PATH}${cleanPath ? `/${cleanPath}` : ''}`;
};

// Helper para verificar se é uma rota do MS
export const isMSRoute = (pathname: string): boolean => {
  return pathname.startsWith(MS_BASE_PATH) || pathname.startsWith(MS_LEGACY_PATH);
};

// Rotas específicas do MS
export const MS_ROUTES = {
  home: MS_BASE_PATH,
  destinos: msRoute('destinos'),
  destino: (id: string) => msRoute(`destinos/${id}`),
  eventos: msRoute('eventos'),
  parceiros: msRoute('parceiros'),
  guata: msRoute('guata'),
  guataTest: msRoute('guata-test'),
  passaporte: msRoute('passaporte'),
  profile: msRoute('profile'),
  login: msRoute('login'),
  register: msRoute('register'),
  forgotPassword: msRoute('forgot-password'),
  welcome: msRoute('welcome'),
  sobre: msRoute('sobre'),
  roteiros: msRoute('roteiros'),
  admin: msRoute('admin'),
  dashboard: msRoute('dashboard'),
} as const;

