import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Settings, 
  BookOpen,
  MessageSquare,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface SimplifiedAdminMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children?: React.ReactNode;
}

const SimplifiedAdminMenu: React.FC<SimplifiedAdminMenuProps> = ({
  activeTab,
  onTabChange,
  children
}) => {
  const menuCategories = [
    {
      id: 'principais',
      label: 'Principais',
      icon: BarChart3,
      tabs: [
        { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
        { id: 'events', label: 'Eventos', icon: Calendar },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 }
      ]
    },
    {
      id: 'gestao',
      label: 'Gestão',
      icon: Users,
      tabs: [
        { id: 'attendants', label: 'Atendentes', icon: Users },
        { id: 'passport', label: 'Passaporte Digital', icon: BookOpen }
      ]
    },
    {
      id: 'ferramentas',
      label: 'Ferramentas',
      icon: MessageSquare,
      tabs: [
        { id: 'reports', label: 'Relatórios', icon: FileText },
        { id: 'ai-consultant', label: 'IA Consultora', icon: MessageSquare }
      ]
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Settings,
      tabs: [
        { id: 'settings', label: 'Configurações', icon: Settings },
        { id: 'alerts', label: 'Alertas', icon: AlertTriangle }
      ]
    }
  ];

  const [activeCategory, setActiveCategory] = useState('principais');

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
  };

  const getCurrentCategory = () => {
    return menuCategories.find(category => 
      category.tabs.some(tab => tab.id === activeTab)
    ) || menuCategories[0];
  };

  const currentCategory = getCurrentCategory();

  return (
    <div className="w-full">
      {/* Category Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        {menuCategories.map((category) => {
          const Icon = category.icon;
          const isActive = currentCategory.id === category.id;
          
          return (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              <CardContent className="p-4 text-center">
                <Icon className={`h-6 w-6 mx-auto mb-2 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <span className={`text-sm font-medium ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {category.label}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator className="my-4" />

      {/* Tab Navigation for Active Category */}
      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
          {currentCategory.tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Content Area */}
        <div className="mt-6">
          {children}
        </div>
      </Tabs>
    </div>
  );
};

export default SimplifiedAdminMenu;