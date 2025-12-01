import { useState, ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Send, Monitor, Tablet, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentPreviewTabsProps {
  children: ReactNode;
  previewContent: ReactNode;
  onSave?: () => void;
  onPublish?: () => void;
  isSaving?: boolean;
  isPublishing?: boolean;
  hasChanges?: boolean;
}

type DeviceView = 'desktop' | 'tablet' | 'mobile';

export default function ContentPreviewTabs({
  children,
  previewContent,
  onSave,
  onPublish,
  isSaving = false,
  isPublishing = false,
  hasChanges = false,
}: ContentPreviewTabsProps) {
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');

  const deviceWidths: Record<DeviceView, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  return (
    <Tabs defaultValue="edit" className="w-full">
      <div className="flex items-center justify-between mb-6">
        <TabsList className="bg-[#FAFAFA] p-1 rounded-lg border border-[#E5E5E5]">
          <TabsTrigger
            value="edit"
            className="data-[state=active]:bg-white data-[state=active]:text-[#0A0A0A] data-[state=active]:shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="data-[state=active]:bg-white data-[state=active]:text-[#0A0A0A] data-[state=active]:shadow-sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs text-[#6B7280]">Alterações não salvas</span>
          )}
          {onSave && (
            <Button
              onClick={onSave}
              disabled={isSaving || !hasChanges}
              variant="outline"
              size="sm"
              className="h-9 px-4 text-sm border-[#E5E5E5] hover:bg-[#FAFAFA]"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          )}
          {onPublish && (
            <Button
              onClick={onPublish}
              disabled={isPublishing}
              size="sm"
              className="h-9 px-4 text-sm bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white"
            >
              {isPublishing ? (
                'Publicando...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publicar
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <TabsContent value="edit" className="mt-0">
        {children}
      </TabsContent>

      <TabsContent value="preview" className="mt-0">
        <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
          {/* Device Toggle */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5] bg-[#FAFAFA]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#0A0A0A]">Preview</span>
            </div>
            <div className="flex items-center gap-1 bg-white border border-[#E5E5E5] rounded-md p-1">
              <button
                onClick={() => setDeviceView('desktop')}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  deviceView === 'desktop'
                    ? "bg-[#0A0A0A] text-white"
                    : "text-[#6B7280] hover:bg-[#FAFAFA]"
                )}
                title="Desktop"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeviceView('tablet')}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  deviceView === 'tablet'
                    ? "bg-[#0A0A0A] text-white"
                    : "text-[#6B7280] hover:bg-[#FAFAFA]"
                )}
                title="Tablet"
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeviceView('mobile')}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  deviceView === 'mobile'
                    ? "bg-[#0A0A0A] text-white"
                    : "text-[#6B7280] hover:bg-[#FAFAFA]"
                )}
                title="Mobile"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Preview Frame */}
          <div className="bg-[#F5F5F5] p-8 flex items-center justify-center min-h-[600px]">
            <div
              className="bg-white rounded-lg shadow-lg overflow-auto transition-all"
              style={{
                width: deviceWidths[deviceView],
                maxWidth: '100%',
                height: deviceView === 'mobile' ? '667px' : deviceView === 'tablet' ? '1024px' : 'auto',
                maxHeight: '90vh',
              }}
            >
              <div className="p-6">
                {previewContent}
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

