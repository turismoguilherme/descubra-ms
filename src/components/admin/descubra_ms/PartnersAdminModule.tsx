import { useCallback, useMemo, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PartnersManagement from '@/components/admin/descubra_ms/PartnersManagement';
import PartnerSettingsManager from '@/components/admin/PartnerSettingsManager';
import PlatformCancellationPolicyAdmin from '@/components/admin/settings/PlatformCancellationPolicyAdmin';

const PartnerTermsReview = lazy(() => import('@/components/admin/partners/PartnerTermsReview'));

export type PartnersAdminTab = 'list' | 'fees' | 'cancellation' | 'terms';

function tabFromSearch(tabParam: string | null): PartnersAdminTab {
  if (tabParam === 'fees' || tabParam === 'cancellation' || tabParam === 'terms') return tabParam;
  return 'list';
}

export default function PartnersAdminModule() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = useMemo(() => tabFromSearch(searchParams.get('tab')), [searchParams]);

  const handleTabChange = useCallback(
    (value: string) => {
      const next = tabFromSearch(value);
      if (next === 'list') {
        setSearchParams({}, { replace: true });
      } else {
        setSearchParams({ tab: next }, { replace: true });
      }
    },
    [setSearchParams]
  );

  return (
    <div className="w-full max-w-7xl mx-auto pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Parceiros</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Lista e aprovações, valores/comissão/links Stripe, termos e política de cancelamento.
        </p>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 h-auto p-1 flex-wrap gap-1 sm:flex sm:w-auto sm:max-w-none">
          <TabsTrigger value="list" className="py-2 text-xs sm:text-sm">Lista</TabsTrigger>
          <TabsTrigger value="fees" className="py-2 text-xs sm:text-sm">Taxas e links</TabsTrigger>
          <TabsTrigger value="terms" className="py-2 text-xs sm:text-sm">Termos</TabsTrigger>
          <TabsTrigger value="cancellation" className="py-2 text-xs sm:text-sm">Cancelamento</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-0 focus-visible:outline-none">
          <PartnersManagement />
        </TabsContent>
        <TabsContent value="fees" className="mt-0 focus-visible:outline-none">
          <PartnerSettingsManager />
        </TabsContent>
        <TabsContent value="terms" className="mt-0 focus-visible:outline-none">
          <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Carregando...</div>}>
            <PartnerTermsReview />
          </Suspense>
        </TabsContent>
        <TabsContent value="cancellation" className="mt-0 focus-visible:outline-none">
          <PlatformCancellationPolicyAdmin embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
