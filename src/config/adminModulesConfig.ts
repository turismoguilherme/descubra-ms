/**
 * Configuração Centralizada de Módulos Admin
 * 
 * Este arquivo centraliza todos os módulos administrativos, seus títulos,
 * descrições, tooltips, agrupamento por plataforma, permissões e rotas.
 * 
 * Facilita manutenção e garante consistência em toda a aplicação.
 */

import {
  LayoutDashboard,
  Building2,
  MapPin,
  DollarSign,
  Shield,
  Bot,
  Users,
  FileText,
  Settings,
  Wallet,
  PieChart,
  Receipt,
  UserCheck,
  Calendar,
  Map,
  Briefcase,
  BookOpen,
  Cog,
  Stamp,
  CreditCard,
  Database,
  Languages,
  Package,
  Edit3,
  Activity,
  Zap,
  UserCog,
  Globe,
  Home,
  Layers,
  Monitor,
  Route,
  Gift,
  BarChart3,
  CreditCard as CreditCardIcon,
  RefreshCw,
  Mail,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';
import { ComponentType } from 'react';

export type Platform = 'viajar' | 'descubra-ms' | 'system';

export interface AdminModule {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  path?: string;
  permission?: string;
  platform: Platform;
  children?: AdminModule[];
  // Metadados para AdminPageHeader
  title?: string;
  description?: string;
  helpText?: string;
}

/**
 * Configuração completa de todos os módulos admin
 * Organizados por plataforma e categoria
 */
export const adminModulesConfig: AdminModule[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/viajar/admin',
    permission: 'dashboard',
    platform: 'system',
    title: 'Dashboard Administrativo',
    description: 'Visão geral do sistema e métricas principais',
    helpText: 'Acompanhe métricas gerais, atividades recentes e status do sistema.',
  },
  {
    id: 'platforms',
    label: 'Plataformas',
    icon: Layers,
    permission: 'platforms',
    platform: 'system',
    children: [
      {
        id: 'viajar',
        label: 'ViajARTur',
        icon: Building2,
        permission: 'viajar',
        platform: 'viajar',
        children: [
          {
            id: 'viajar-content',
            label: 'Conteúdo e Menu',
            icon: FileText,
            path: '/viajar/admin/viajar/content',
            permission: 'viajar',
            platform: 'viajar',
            title: 'Conteúdo e Menu',
            description: 'Gerencie o conteúdo e menus da plataforma ViajARTur',
            helpText: 'Edite textos, imagens e configure os menus de navegação da plataforma ViajARTur.',
          },
          {
            id: 'viajar-plans',
            label: 'Configuração de Planos',
            icon: CreditCard,
            path: '/viajar/admin/viajar/plan-settings',
            permission: 'viajar',
            platform: 'viajar',
            title: 'Configuração de Planos',
            description: 'Configure os planos de assinatura da plataforma ViajARTur',
            helpText: 'Gerencie planos, preços e recursos disponíveis para cada tipo de assinatura.',
          },
          {
            id: 'viajar-team',
            label: 'Membros da Equipe',
            icon: Users,
            path: '/viajar/admin/viajar/team-members',
            permission: 'viajar',
            platform: 'viajar',
            title: 'Membros da Equipe',
            description: 'Gerencie os membros da equipe ViajARTur',
            helpText: 'Adicione, edite ou remova membros da equipe e configure suas permissões.',
          },
        ],
      },
      {
        id: 'descubra-ms',
        label: 'Descubra MS',
        icon: MapPin,
        permission: 'descubra_ms',
        platform: 'descubra-ms',
        children: [
          {
            id: 'tourist-regions',
            label: 'Regiões Turísticas',
            icon: Map,
            path: '/viajar/admin/descubra-ms/tourist-regions',
            permission: 'content',
            platform: 'descubra-ms',
            title: 'Regiões Turísticas',
            description: 'Defina as regiões turísticas e seus destinos associados',
            helpText: 'Defina as regiões turísticas e seus destinos associados. Configure informações, imagens e destinos de cada região.',
          },
          {
            id: 'cats',
            label: 'CATs',
            icon: MapPin,
            path: '/viajar/admin/descubra-ms/cats',
            permission: 'content',
            platform: 'descubra-ms',
            title: 'Gerenciamento de CATs',
            description: 'Cadastre e gerencie os Centros de Atendimento ao Turista',
            helpText: 'Cadastre e gerencie os Centros de Atendimento ao Turista. Configure localização, horários e informações de contato.',
          },
          {
            id: 'footer',
            label: 'Footer',
            icon: Globe,
            path: '/viajar/admin/descubra-ms/footer',
            permission: 'content',
            platform: 'descubra-ms',
            title: 'Configurações do Footer',
            description: 'Configure o rodapé da plataforma Descubra MS',
            helpText: 'Edite links, informações de contato e redes sociais exibidas no rodapé.',
          },
          {
            id: 'events',
            label: 'Eventos',
            icon: Calendar,
            path: '/viajar/admin/descubra-ms/events',
            permission: 'events',
            platform: 'descubra-ms',
            title: 'Gerenciamento de Eventos',
            description: 'Aprove, edite ou remova eventos cadastrados por parceiros e organizadores',
            helpText: 'Aprove, edite ou remova eventos cadastrados por parceiros e organizadores. Gerencie aprovações e moderação de eventos.',
          },
          {
            id: 'partners',
            label: 'Parceiros',
            icon: Briefcase,
            path: '/viajar/admin/descubra-ms/partners',
            permission: 'partners',
            platform: 'descubra-ms',
            title: 'Gerenciamento de Parceiros',
            description: 'Gerencie estabelecimentos parceiros que oferecem serviços turísticos na plataforma',
            helpText: 'Gerencie estabelecimentos parceiros que oferecem serviços turísticos na plataforma. Aprove, edite ou remova parceiros.',
          },
          {
            id: 'avatars',
            label: 'Avatares',
            icon: Users,
            path: '/viajar/admin/descubra-ms/avatars',
            permission: 'content',
            platform: 'descubra-ms',
            title: 'Avatares do Pantanal',
            description: 'Gerencie os avatares de animais do Pantanal disponíveis para os usuários',
            helpText: 'Gerencie os avatares de animais do Pantanal disponíveis para os usuários. Adicione, edite ou remova avatares.',
          },
          {
            id: 'passport',
            label: 'Passaporte Digital',
            icon: Stamp,
            permission: 'passport',
            platform: 'descubra-ms',
            path: '/viajar/admin/descubra-ms/passport',
            title: 'Passaporte Digital',
            description: 'Configure rotas, carimbos e recompensas do programa de fidelidade turística',
            helpText: 'Configure rotas, carimbos e recompensas do programa de fidelidade turística. Gerencie todo o sistema de passaporte digital.',
            children: [
              {
                id: 'passport-routes',
                label: 'Cadastrar Rotas',
                icon: Route,
                path: '/viajar/admin/descubra-ms/passport?tab=routes',
                permission: 'passport',
                platform: 'descubra-ms',
              },
              {
                id: 'passport-stamps',
                label: 'Carimbos',
                icon: Stamp,
                path: '/viajar/admin/descubra-ms/passport?tab=stamps',
                permission: 'passport',
                platform: 'descubra-ms',
              },
              {
                id: 'passport-checkpoints',
                label: 'Checkpoints',
                icon: MapPin,
                path: '/viajar/admin/descubra-ms/passport?tab=checkpoints',
                permission: 'passport',
                platform: 'descubra-ms',
              },
              {
                id: 'passport-rewards',
                label: 'Recompensas',
                icon: Gift,
                path: '/viajar/admin/descubra-ms/passport?tab=rewards',
                permission: 'passport',
                platform: 'descubra-ms',
              },
              {
                id: 'passport-analytics',
                label: 'Analytics',
                icon: BarChart3,
                path: '/viajar/admin/descubra-ms/passport?tab=analytics',
                permission: 'passport',
                platform: 'descubra-ms',
              },
            ],
          },
          {
            id: 'users',
            label: 'Usuários',
            icon: UserCog,
            path: '/viajar/admin/descubra-ms/users',
            permission: 'users',
            platform: 'descubra-ms',
            title: 'Usuários Descubra MS',
            description: 'Gerencie usuários finais do Descubra MS',
            helpText: 'Gerencie os usuários finais que acessam a plataforma Descubra MS. Você pode bloquear ou desbloquear usuários.',
          },
          {
            id: 'whatsapp',
            label: 'WhatsApp',
            icon: MessageCircle,
            path: '/viajar/admin/descubra-ms/whatsapp',
            permission: 'settings',
            platform: 'descubra-ms',
            title: 'Configurações do WhatsApp',
            description: 'Configure o botão flutuante do WhatsApp e opções de contato para roteiros',
            helpText: 'Configure o botão flutuante do WhatsApp e as opções de contato para os roteiros personalizados.',
          },
          {
            id: 'destinations',
            label: 'Destinos',
            icon: MapPin,
            path: '/viajar/admin/descubra-ms/destinations',
            permission: 'content',
            platform: 'descubra-ms',
            title: 'Gerenciar Destinos',
            description: 'Crie e edite destinos turísticos do Descubra MS',
            helpText: 'Gerencie os destinos turísticos da plataforma Descubra MS. Você pode adicionar, editar e remover destinos, além de configurar seus detalhes.',
          },
          {
            id: 'platform-settings',
            label: 'Configurações da Plataforma',
            icon: Settings,
            path: '/viajar/admin/descubra-ms/platform-settings',
            permission: 'settings',
            platform: 'descubra-ms',
            title: 'Configurações da Plataforma',
            description: 'Configure informações gerais, funcionalidades e contatos da plataforma Descubra MS',
            helpText: 'Configure informações gerais, funcionalidades e contatos da plataforma Descubra MS.',
          },
        ],
      },
    ],
  },
  {
    id: 'financial',
    label: 'Financeiro',
    icon: DollarSign,
    permission: 'financial',
    platform: 'system',
    children: [
      {
        id: 'overview',
        label: 'Visão Geral',
        icon: PieChart,
        path: '/viajar/admin/financial',
        permission: 'financial',
        platform: 'system',
        title: 'Dashboard Financeiro',
        description: 'Acompanhe receitas, despesas e lucro da plataforma. Gerencie contas a pagar',
        helpText: 'Acompanhe receitas, despesas e lucro da plataforma. Gerencie contas a pagar.',
      },
      {
        id: 'clients',
        label: 'Clientes',
        icon: UserCheck,
        path: '/viajar/admin/viajar/clients',
        permission: 'clients',
        platform: 'system',
      },
      {
        id: 'subscriptions',
        label: 'Assinaturas',
        icon: Receipt,
        path: '/viajar/admin/viajar/subscriptions',
        permission: 'subscriptions',
        platform: 'system',
      },
      {
        id: 'payments',
        label: 'Pagamentos',
        icon: CreditCardIcon,
        path: '/viajar/admin/financial/payments',
        permission: 'financial',
        platform: 'system',
      },
      {
        id: 'revenue',
        label: 'Receitas',
        icon: Wallet,
        path: '/viajar/admin/financial/revenue',
        permission: 'financial',
        platform: 'system',
        title: 'Gestão Financeira',
        description: 'Gerencie receitas, despesas e salários da plataforma',
        helpText: 'Gerencie receitas, despesas e salários da plataforma.',
      },
      {
        id: 'bills',
        label: 'Contas a Pagar',
        icon: Receipt,
        path: '/viajar/admin/financial/bills',
        permission: 'financial',
        platform: 'system',
        title: 'Contas a Pagar',
        description: 'Gerencie suas contas e despesas da plataforma',
        helpText: 'Gerencie suas contas e despesas da plataforma.',
      },
      {
        id: 'accounts',
        label: 'Contas Bancárias',
        icon: CreditCard,
        path: '/viajar/admin/financial/accounts',
        permission: 'financial',
        platform: 'system',
      },
      {
        id: 'suppliers',
        label: 'Fornecedores',
        icon: Users,
        path: '/viajar/admin/financial/suppliers',
        permission: 'financial',
        platform: 'system',
      },
      {
        id: 'reports',
        label: 'Relatórios',
        icon: FileText,
        path: '/viajar/admin/financial/reports',
        permission: 'reports',
        platform: 'system',
      },
      {
        id: 'refunds',
        label: 'Reembolsos',
        icon: RefreshCw,
        path: '/viajar/admin/financial/refunds',
        permission: 'financial',
        platform: 'system',
      },
      {
        id: 'contact-leads',
        label: 'Leads de Contato',
        icon: Mail,
        path: '/viajar/admin/financial/contact-leads',
        permission: 'financial',
        platform: 'system',
      },
    ],
  },
  {
    id: 'administration',
    label: 'Administração',
    icon: UserCog,
    permission: 'team',
    platform: 'system',
    children: [
      {
        id: 'team-members',
        label: 'Equipe Admin',
        icon: Users,
        path: '/viajar/admin/team/members',
        permission: 'team',
        platform: 'system',
        title: 'Gestão de Equipe',
        description: 'Gerencie membros da equipe administrativa e suas permissões de acesso',
        helpText: 'Gerencie membros da equipe administrativa e suas permissões de acesso.',
      },
      {
        id: 'team-activities',
        label: 'Atividades',
        icon: Activity,
        path: '/viajar/admin/team/activities',
        permission: 'team',
        platform: 'system',
      },
      {
        id: 'team-permissions',
        label: 'Permissões',
        icon: Shield,
        path: '/viajar/admin/team/permissions',
        permission: 'team',
        platform: 'system',
      },
    ],
  },
  {
    id: 'system',
    label: 'Sistema',
    icon: Settings,
    permission: 'system',
    platform: 'system',
    children: [
      {
        id: 'database',
        label: 'Banco de Dados',
        icon: Database,
        path: '/viajar/admin/database',
        permission: 'database',
        platform: 'system',
      },
      {
        id: 'emails',
        label: 'Gestão de Emails',
        icon: Mail,
        path: '/viajar/admin/communication/emails',
        permission: 'communication',
        platform: 'system',
      },
      {
        id: 'system-monitoring',
        label: 'Monitoramento',
        icon: Monitor,
        path: '/viajar/admin/system/monitoring',
        permission: 'system',
        platform: 'system',
        title: 'Monitoramento do Sistema',
        description: 'Status e saúde dos sistemas em tempo real',
        helpText: 'Visualize métricas de performance e saúde do sistema em tempo real.',
      },
      {
        id: 'system-logs',
        label: 'Auditoria',
        icon: FileText,
        path: '/viajar/admin/system/logs',
        permission: 'system',
        platform: 'system',
        title: 'Auditoria',
        description: 'Histórico completo de ações administrativas no sistema',
        helpText: 'Veja logs de ações realizadas pelos administradores para rastreabilidade.',
      },
      {
        id: 'system-health',
        label: 'Saúde do Sistema',
        icon: Activity,
        path: '/viajar/admin/system/health',
        permission: 'system',
        platform: 'system',
      },
      {
        id: 'system-fallback',
        label: 'Fallback',
        icon: Shield,
        path: '/viajar/admin/system/fallback',
        permission: 'system',
        platform: 'system',
        title: 'Configuração de Fallback',
        description: 'Configure sistema de fallback e monitoramento',
        helpText: 'Configure o modo de manutenção e mensagens de indisponibilidade da plataforma.',
      },
      {
        id: 'settings-policies',
        label: 'Configurações - Políticas',
        icon: FileText,
        path: '/viajar/admin/settings/policies',
        permission: 'settings',
        platform: 'system',
      },
    ],
  },
  {
    id: 'ai',
    label: 'IA Autônoma',
    icon: Bot,
    permission: 'ai',
    platform: 'system',
    children: [
      {
        id: 'ai-agent',
        label: 'Agente Autônomo',
        icon: Zap,
        path: '/viajar/admin/ai/agent',
        permission: 'ai',
        platform: 'system',
      },
      {
        id: 'ai-tasks',
        label: 'Tarefas Automáticas',
        icon: Activity,
        path: '/viajar/admin/ai/tasks',
        permission: 'ai',
        platform: 'system',
      },
      {
        id: 'ai-knowledge-base',
        label: 'Base de Conhecimento',
        icon: FileText,
        path: '/viajar/admin/ai/knowledge-base',
        permission: 'ai',
        platform: 'system',
        title: 'Base de Conhecimento',
        description: 'Alimente a IA Guatá com perguntas e respostas para melhorar as respostas do chatbot',
        helpText: 'Alimente a IA Guatá com perguntas e respostas para melhorar as respostas do chatbot.',
      },
      {
        id: 'ai-prompts',
        label: 'Editor de Prompts',
        icon: Bot,
        path: '/viajar/admin/ai/prompts',
        permission: 'ai',
        platform: 'system',
        title: 'Editor de Prompts',
        description: 'Personalize o comportamento e personalidade dos chatbots editando seus prompts',
        helpText: 'Personalize o comportamento e personalidade dos chatbots editando seus prompts.',
      },
    ],
  },
];

/**
 * Função auxiliar para buscar metadados de um módulo por path
 */
export function getModuleByPath(path: string): AdminModule | undefined {
  function searchInModules(modules: AdminModule[]): AdminModule | undefined {
    for (const module of modules) {
      if (module.path === path) {
        return module;
      }
      if (module.children) {
        const found = searchInModules(module.children);
        if (found) return found;
      }
    }
    return undefined;
  }
  return searchInModules(adminModulesConfig);
}

/**
 * Função auxiliar para buscar todos os módulos de uma plataforma
 */
export function getModulesByPlatform(platform: Platform): AdminModule[] {
  function flattenModules(modules: AdminModule[]): AdminModule[] {
    const result: AdminModule[] = [];
    for (const module of modules) {
      if (module.platform === platform && module.path) {
        result.push(module);
      }
      if (module.children) {
        result.push(...flattenModules(module.children));
      }
    }
    return result;
  }
  return flattenModules(adminModulesConfig);
}


