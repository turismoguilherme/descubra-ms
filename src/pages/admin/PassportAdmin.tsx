import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PassportRouteManager from '@/components/admin/passport/PassportRouteManager';
import PassportStampConfig from '@/components/admin/passport/PassportStampConfig';
import PassportCheckpointManager from '@/components/admin/passport/PassportCheckpointManager';
import PassportRewardsManager from '@/components/admin/passport/PassportRewardsManager';
import PendingPartnerRewards from '@/components/admin/passport/PendingPartnerRewards';
import PassportAnalytics from '@/components/admin/passport/PassportAnalytics';
import PartnerCodesManager from '@/components/admin/passport/PartnerCodesManager';
import PassportPhotosView from '@/components/admin/passport/PassportPhotosView';
import PassportGlobalSettings from '@/components/admin/passport/PassportGlobalSettings';
import { Route, Settings, Gift, MapPin, BarChart3, Key, Camera, Globe } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';

const PassportAdmin: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'routes';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Passaporte Digital"
        description="Gerencie rotas, carimbos, checkpoints e recompensas do sistema de passaporte digital"
        helpText="Configure rotas, carimbos e recompensas do programa de fidelidade turística. Gerencie todo o sistema de passaporte digital."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <Route className="h-4 w-4" />
            Rotas
          </TabsTrigger>
          <TabsTrigger value="stamps" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Carimbos
          </TabsTrigger>
          <TabsTrigger value="checkpoints" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Checkpoints
          </TabsTrigger>
          <TabsTrigger value="codes" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Códigos
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Recompensas
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Fotos
          </TabsTrigger>
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Global
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="space-y-4">
          <PassportRouteManager />
        </TabsContent>

        <TabsContent value="stamps" className="space-y-4">
          <PassportStampConfig />
        </TabsContent>

        <TabsContent value="checkpoints" className="space-y-4">
          <PassportCheckpointManager />
        </TabsContent>

        <TabsContent value="codes" className="space-y-4">
          <PartnerCodesManager />
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          {/* Recompensas pendentes dos parceiros */}
          <PendingPartnerRewards />
          
          {/* Gerenciamento manual de recompensas */}
          <PassportRewardsManager />
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <PassportPhotosView />
        </TabsContent>

        <TabsContent value="global" className="space-y-4">
          <PassportGlobalSettings />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <PassportAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PassportAdmin;

