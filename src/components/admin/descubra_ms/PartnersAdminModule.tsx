import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PartnersManagement from '@/components/admin/descubra_ms/PartnersManagement';
import PartnerSettingsManager from '@/components/admin/PartnerSettingsManager';
import PlatformCancellationPolicyAdmin from '@/components/admin/settings/PlatformCancellationPolicyAdmin';

export type PartnersAdminTab = 'list' | 'fees' | 'cancellation';

function tabFromSearch(tabParam: string | null): PartnersAdminTab {
  if (tabParam === 'fees' || tabParam === 'cancellation') return tabParam;
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
        <h1 className="text-2xl font-bold text-gray-900">Parceiros</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Lista e aprovações, valores/comissão/links Stripe e política de cancelamento das reservas.
        </p>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full max-w-xl grid-cols-3 h-auto p-1 flex-wrap gap-1 sm:flex sm:w-auto sm:max-w-none">
          <TabsTrigger value="list" className="py-2 text-xs sm:text-sm">
            Lista
          </TabsTrigger>
          <TabsTrigger value="fees" className="py-2 text-xs sm:text-sm">
            Taxas e links
          </TabsTrigger>
          <TabsTrigger value="cancellation" className="py-2 text-xs sm:text-sm">
            Cancelamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-0 focus-visible:outline-none">
          <PartnersManagement />
        </TabsContent>

        <TabsContent value="fees" className="mt-0 focus-visible:outline-none">
          <PartnerSettingsManager />
        </TabsContent>

        <TabsContent value="cancellation" className="mt-0 focus-visible:outline-none">
          <PlatformCancellationPolicyAdmin embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
