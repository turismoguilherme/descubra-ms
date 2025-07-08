
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, Calendar, Route, Brain } from "lucide-react";
import CATSystem from "./CATSystem";
import RouteManagement from "../admin/RouteManagement";
import CheckinReports from "./CheckinReports";
import PartnersManager from "../partners/PartnersManager";

interface DashboardTabsProps {
  region: string;
}

const DashboardTabs = ({ region }: DashboardTabsProps) => {
  return (
    <Tabs defaultValue="cats" className="space-y-4">
      <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
        <TabsTrigger value="cats" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          CATs
        </TabsTrigger>
        <TabsTrigger value="routes" className="flex items-center gap-2">
          <Route className="w-4 h-4" />
          Roteiros
        </TabsTrigger>
        <TabsTrigger value="checkins" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Check-ins
        </TabsTrigger>
        <TabsTrigger value="partners" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Parceiros
        </TabsTrigger>
        <TabsTrigger value="ai" className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          IA Analytics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="cats">
        <CATSystem region={region} />
      </TabsContent>

      <TabsContent value="routes">
        <RouteManagement userRegion={region} />
      </TabsContent>

      <TabsContent value="checkins">
        <CheckinReports />
      </TabsContent>

      <TabsContent value="partners">
        <PartnersManager />
      </TabsContent>

      <TabsContent value="ai">
        <div className="text-center py-12">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            IA Analytics
          </h3>
          <p className="text-gray-500">
            Análises avançadas com inteligência artificial em desenvolvimento.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
