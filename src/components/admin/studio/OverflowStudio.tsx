import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ENV } from '@/config/environment';

const OverflowStudio: React.FC = () => {
  if (!ENV.FEATURES.STUDIO_ENABLED) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overflow Studio</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inventory" disabled={!ENV.FEATURES.STUDIO_INVENTORY_V1}>Inventory Builder</TabsTrigger>
            <TabsTrigger value="site" disabled={!ENV.FEATURES.STUDIO_SITE_V1}>Site Builder</TabsTrigger>
            <TabsTrigger value="ai" disabled={!ENV.FEATURES.STUDIO_AI_COPILOT_V1}>IA Copilot</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            {!ENV.FEATURES.STUDIO_INVENTORY_V1 ? (
              <div className="text-sm text-gray-600">Inventory Builder está desativado.</div>
            ) : (
              <div className="text-sm">Inventory Builder (MVP) — importação CSV/Sheets, validação SeTur, multi-idiomas.</div>
            )}
          </TabsContent>

          <TabsContent value="site">
            {!ENV.FEATURES.STUDIO_SITE_V1 ? (
              <div className="text-sm text-gray-600">Site Builder está desativado.</div>
            ) : (
              <div className="text-sm">Site Builder (MVP) — templates {ENV.FEATURES.STUDIO_TEMPLATES_ALL ? 'Cidade, Região, Evento, Parque' : 'Cidade'}; preview e staging.</div>
            )}
          </TabsContent>

          <TabsContent value="ai">
            {!ENV.FEATURES.STUDIO_AI_COPILOT_V1 ? (
              <div className="text-sm text-gray-600">IA Copilot está desativado.</div>
            ) : (
              <div className="text-sm">IA Copilot — geração de copy multi-idiomas e checklists (SeTur, SEO, A11y).</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OverflowStudio;






