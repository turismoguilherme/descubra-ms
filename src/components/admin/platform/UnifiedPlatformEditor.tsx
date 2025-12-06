import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Menu, Image, Settings, Globe, Building2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PlatformContentEditor from './PlatformContentEditor';
import PlatformMenuEditor from './PlatformMenuEditor';

interface UnifiedPlatformEditorProps {
  initialPlatform?: 'viajar' | 'descubra_ms';
}

export default function UnifiedPlatformEditor({ initialPlatform = 'viajar' }: UnifiedPlatformEditorProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<'viajar' | 'descubra_ms'>(initialPlatform);
  const [activeTab, setActiveTab] = useState('content');

  const platforms = [
    {
      id: 'viajar' as const,
      name: 'ViaJARTur',
      description: 'Plataforma SaaS de turismo',
      icon: Building2,
      color: 'bg-cyan-500',
    },
    {
      id: 'descubra_ms' as const,
      name: 'Descubra MS',
      description: 'Portal turístico do Mato Grosso do Sul',
      icon: Globe,
      color: 'bg-emerald-500',
    },
  ];

  const currentPlatform = platforms.find(p => p.id === selectedPlatform)!;

  return (
    <div className="space-y-6">
      {/* Platform Selector */}
      <div className="flex gap-4">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isSelected = selectedPlatform === platform.id;
          
          return (
            <Card
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={cn(
                "flex-1 p-4 cursor-pointer transition-all border-2",
                isSelected 
                  ? "border-primary shadow-md" 
                  : "border-transparent hover:border-muted-foreground/20"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  platform.color
                )}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    {platform.name}
                    {isSelected && (
                      <Badge className="text-xs">Selecionado</Badge>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {platform.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg border border-border">
          <TabsTrigger
            value="content"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger
            value="menus"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <Menu className="h-4 w-4 mr-2" />
            Menus
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-6">
          <PlatformContentEditor 
            key={selectedPlatform} 
            platform={selectedPlatform} 
          />
        </TabsContent>

        <TabsContent value="menus" className="mt-6">
          <PlatformMenuEditor 
            key={selectedPlatform} 
            platform={selectedPlatform} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
