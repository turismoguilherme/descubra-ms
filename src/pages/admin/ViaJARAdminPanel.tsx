import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ModernAdminLayout from '@/components/admin/layout/ModernAdminLayout';
import AdminLogin from '@/components/admin/AdminLogin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar,
  Briefcase,
  FileSignature,
  Users,
  RefreshCw,
  ArrowRight,
  Stamp,
  BookOpen,
  Bot,
  Activity,
} from 'lucide-react';
import { lazy, Suspense } from 'react';
import LoadingFallback from '@/components/ui/loading-fallback';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Lazy load components
const UsersManagement = lazy(() => import('@/components/admin/descubra_ms/UsersManagement'));
const WhatsAppSettingsManager = lazy(() => import('@/components/admin/descubra_ms/WhatsAppSettingsManager'));
const EventsManagement = lazy(() => import('@/components/admin/descubra_ms/EventsManagement'));
const PartnersAdminModule = lazy(() => import('@/components/admin/descubra_ms/PartnersAdminModule'));
const PartnerTermsAcceptances = lazy(() => import('@/components/admin/descubra_ms/PartnerTermsAcceptances'));
const PantanalAvatarsManager = lazy(() => import('@/components/admin/descubra_ms/PantanalAvatarsManager'));
const GuataVideosManager = lazy(() => import('@/components/admin/GuataVideosManager'));
const GuataCartilhasManager = lazy(() => import('@/components/admin/GuataCartilhasManager'));
const FooterSettingsManager = lazy(() => import('@/components/admin/FooterSettingsManager'));
const TouristRegionsManager = lazy(() => import('@/components/admin/descubra_ms/TouristRegionsManager'));
const SystemMonitoring = lazy(() => import('@/components/admin/system/SystemMonitoring'));
const AuditLogs = lazy(() => import('@/components/admin/system/AuditLogs'));
const AIAdminChat = lazy(() => import('@/components/admin/ai/AIAdminChat'));
const KnowledgeBaseAdmin = lazy(() => import('@/components/admin/ai/KnowledgeBaseAdmin'));
const PassportAdmin = lazy(() => import('@/pages/admin/PassportAdmin'));
const PoliciesEditor = lazy(() => import('@/components/admin/settings/PoliciesEditor'));
const PlatformMetricsEditor = lazy(() => import('@/components/admin/settings/PlatformMetricsEditor'));
const UnifiedPlatformEditor = lazy(() => import('@/components/admin/platform/UnifiedPlatformEditor'));
const ViaJARTurSettingsManager = lazy(() => import('@/components/admin/ViaJARTurSettingsManager'));
const ViaJARSectionManager = lazy(() => import('@/components/admin/viajar/ViaJARSectionManager'));

const ADMIN_ROLES = ['admin', 'master_admin', 'tech'] as const;

export default function ViaJARAdminPanel() {
  const { user, userProfile, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user && userProfile) {
        const role = userProfile?.role || 'user';
        const authorized = ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);
        setIsAuthorized(authorized);
      } else {
        setIsAuthorized(false);
      }
    }
  }, [user, userProfile, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAuthorized) {
    return <AdminLogin />;
  }

  return (
    <ModernAdminLayout>
      <Routes>
        <Route index element={<DashboardOverview />} />

        {/* Guatá Labs */}
        <Route path="viajar/content" element={
          <Suspense fallback={<LoadingFallback />}>
            <UnifiedPlatformEditor initialPlatform="viajar" />
          </Suspense>
        } />
        <Route path="viajar/plan-settings" element={
          <Suspense fallback={<LoadingFallback />}>
            <ViaJARTurSettingsManager />
          </Suspense>
        } />
        <Route path="viajar/sections" element={
          <Suspense fallback={<LoadingFallback />}>
            <ViaJARSectionManager />
          </Suspense>
        } />

        {/* Descubra MS */}
        <Route path="descubra-ms/footer" element={
          <Suspense fallback={<LoadingFallback />}>
            <FooterSettingsManager />
          </Suspense>
        } />
        <Route path="descubra-ms/tourist-regions" element={
          <Suspense fallback={<LoadingFallback />}>
            <TouristRegionsManager />
          </Suspense>
        } />
        <Route path="descubra-ms/users" element={
          <Suspense fallback={<LoadingFallback />}>
            <UsersManagement />
          </Suspense>
        } />
        <Route path="descubra-ms/events" element={
          <Suspense fallback={<LoadingFallback />}>
            <EventsManagement />
          </Suspense>
        } />
        <Route path="descubra-ms/partners" element={
          <Suspense fallback={<LoadingFallback />}>
            <PartnersAdminModule />
          </Suspense>
        } />
        <Route path="descubra-ms/partner-terms" element={
          <Suspense fallback={<LoadingFallback />}>
            <PartnerTermsAcceptances />
          </Suspense>
        } />
        <Route
          path="descubra-ms/settings"
          element={<Navigate to="/viajar/admin/descubra-ms/partners?tab=fees" replace />}
        />
        <Route
          path="descubra-ms/partner-settings"
          element={<Navigate to="/viajar/admin/descubra-ms/partners?tab=fees" replace />}
        />
        <Route
          path="descubra-ms/cancellation-policy"
          element={<Navigate to="/viajar/admin/descubra-ms/partners?tab=cancellation" replace />}
        />
        <Route path="descubra-ms/whatsapp" element={
          <Suspense fallback={<LoadingFallback />}>
            <WhatsAppSettingsManager />
          </Suspense>
        } />
        <Route path="descubra-ms/passport" element={
          <Suspense fallback={<LoadingFallback />}>
            <PassportAdmin />
          </Suspense>
        } />
        <Route path="descubra-ms/avatars" element={
          <Suspense fallback={<LoadingFallback />}>
            <PantanalAvatarsManager />
          </Suspense>
        } />
        <Route path="descubra-ms/guata-videos" element={
          <Suspense fallback={<LoadingFallback />}>
            <GuataVideosManager />
          </Suspense>
        } />
        <Route path="descubra-ms/guata-cartilhas" element={
          <Suspense fallback={<LoadingFallback />}>
            <GuataCartilhasManager />
          </Suspense>
        } />

        {/* Redirecionamentos do antigo módulo Financeiro */}
        <Route
          path="financial/refunds"
          element={<Navigate to="/viajar/admin/descubra-ms/partners?tab=refunds" replace />}
        />
        <Route path="financial/*" element={<Navigate to="/viajar/admin" replace />} />
        <Route path="viajar/clients" element={<Navigate to="/viajar/admin" replace />} />
        <Route path="viajar/subscriptions" element={<Navigate to="/viajar/admin" replace />} />

        {/* Configurações */}
        <Route path="settings/policies" element={
          <Suspense fallback={<LoadingFallback />}>
            <PoliciesEditor />
          </Suspense>
        } />
        <Route path="settings/metrics" element={
          <Suspense fallback={<LoadingFallback />}>
            <PlatformMetricsEditor />
          </Suspense>
        } />

        {/* Sistema */}
        <Route path="system/monitoring" element={
          <Suspense fallback={<LoadingFallback />}>
            <SystemMonitoring />
          </Suspense>
        } />
        <Route path="system/logs" element={
          <Suspense fallback={<LoadingFallback />}>
            <AuditLogs />
          </Suspense>
        } />

        {/* IA */}
        <Route path="ai/chat" element={
          <Suspense fallback={<LoadingFallback />}>
            <AIAdminChat />
          </Suspense>
        } />
        <Route path="ai/knowledge-base" element={
          <Suspense fallback={<LoadingFallback />}>
            <KnowledgeBaseAdmin />
          </Suspense>
        } />

        <Route path="*" element={<Navigate to="/viajar/admin" replace />} />
      </Routes>
    </ModernAdminLayout>
  );
}

interface OperationalCounts {
  pendingEvents: number;
  pendingPartners: number;
  pendingTerms: number;
  pendingRefunds: number;
  newUsers: number;
}

const EMPTY_COUNTS: OperationalCounts = {
  pendingEvents: 0,
  pendingPartners: 0,
  pendingTerms: 0,
  pendingRefunds: 0,
  newUsers: 0,
};

function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<OperationalCounts>(EMPTY_COUNTS);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const countOf = async (
        table: string,
        apply: (query: any) => any
      ): Promise<number> => {
        try {
          const { count, error } = await apply(
            supabase.from(table as never).select('id', { count: 'exact', head: true })
          );
          if (error) throw error;
          return count ?? 0;
        } catch (error) {
          console.error(`Erro ao contar ${table}:`, error);
          return 0;
        }
      };

      const [pendingEvents, pendingPartners, pendingTerms, pendingRefunds, newUsers] = await Promise.all([
        countOf('events', (q) => q.eq('is_visible', false)),
        countOf('commercial_partners', (q) => q.eq('status', 'pendente')),
        countOf('partner_terms_acceptances', (q) => q.eq('review_status', 'pending')),
        countOf('pending_refunds', (q) => q.eq('status', 'pending')),
        countOf('user_profiles', (q) => q.gte('created_at', sevenDaysAgo)),
      ]);

      if (!active) return;
      setCounts({ pendingEvents, pendingPartners, pendingTerms, pendingRefunds, newUsers });
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const cards = [
    {
      label: 'Eventos aguardando aprovação',
      value: counts.pendingEvents,
      icon: Calendar,
      to: '/viajar/admin/descubra-ms/events',
      accent: 'text-amber-600 bg-amber-500/10',
    },
    {
      label: 'Parceiros aguardando aprovação',
      value: counts.pendingPartners,
      icon: Briefcase,
      to: '/viajar/admin/descubra-ms/partners',
      accent: 'text-emerald-600 bg-emerald-500/10',
    },
    {
      label: 'Termos pendentes de revisão',
      value: counts.pendingTerms,
      icon: FileSignature,
      to: '/viajar/admin/descubra-ms/partners?tab=terms',
      accent: 'text-blue-600 bg-blue-500/10',
    },
    {
      label: 'Reembolsos pendentes',
      value: counts.pendingRefunds,
      icon: RefreshCw,
      to: '/viajar/admin/descubra-ms/partners?tab=refunds',
      accent: 'text-rose-600 bg-rose-500/10',
    },
    {
      label: 'Novos usuários (7 dias)',
      value: counts.newUsers,
      icon: Users,
      to: '/viajar/admin/descubra-ms/users',
      accent: 'text-violet-600 bg-violet-500/10',
    },
  ];

  const shortcuts = [
    { label: 'Passaporte Digital', to: '/viajar/admin/descubra-ms/passport', icon: Stamp },
    { label: 'Cartilhas Guatá Capacita', to: '/viajar/admin/descubra-ms/guata-cartilhas', icon: BookOpen },
    { label: 'Base de Conhecimento da IA', to: '/viajar/admin/ai/knowledge-base', icon: Bot },
    { label: 'Monitoramento do sistema', to: '/viajar/admin/system/monitoring', icon: Activity },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bem-vindo ao painel</h2>
          <p className="text-muted-foreground mt-1">Visão operacional do Guatá Labs e do Descubra MS</p>
        </div>
        <Badge variant="outline" className="w-fit px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
          Sistema online
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link key={card.label} to={card.to} className="group">
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className={cn('p-2 rounded-lg', card.accent)}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-3xl font-bold text-foreground mt-4">
                  {loading ? '—' : card.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Atalhos</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {shortcuts.map((shortcut) => (
            <Link
              key={shortcut.to}
              to={shortcut.to}
              className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm text-foreground hover:bg-muted/60 transition-colors"
            >
              <shortcut.icon className="h-4 w-4 text-muted-foreground" />
              {shortcut.label}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
