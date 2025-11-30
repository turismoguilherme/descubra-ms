import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PassportRouteManager from '@/components/admin/passport/PassportRouteManager';
import PassportStampConfig from '@/components/admin/passport/PassportStampConfig';
import PassportCheckpointManager from '@/components/admin/passport/PassportCheckpointManager';
import PassportRewardsManager from '@/components/admin/passport/PassportRewardsManager';
import PassportAnalytics from '@/components/admin/passport/PassportAnalytics';
import { Route, Settings, Gift, MapPin, BarChart3 } from 'lucide-react';

const PassportAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('routes');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Passaporte Digital</h1>
        <p className="text-muted-foreground">
          Gerencie rotas, carimbos, checkpoints e recompensas do sistema de passaporte digital
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
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
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Recompensas
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

        <TabsContent value="rewards" className="space-y-4">
          <PassportRewardsManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <PassportAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PassportAdmin;

