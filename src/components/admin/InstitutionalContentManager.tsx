
import { useInstitutionalContent, InstitutionalContent } from "@/hooks/useInstitutionalContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Save, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ContentItem = ({ item }: { item: InstitutionalContent }) => {
    const { updateContent, isUpdating } = useInstitutionalContent();
    const [value, setValue] = useState(item.content_value);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        if (value !== item.content_value) {
            updateContent({ id: item.id, content_value: value });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };
    
    const isTextarea = item.content_key.includes('description') || item.content_key.includes('subtitle');
    const hasChanges = value !== item.content_value;

    // Gerar tooltip baseado na chave
    const getTooltipText = (key: string): string => {
        if (key.includes('hero_title')) return 'Título principal exibido na seção hero da página inicial.';
        if (key.includes('hero_subtitle')) return 'Subtítulo descritivo que aparece abaixo do título principal.';
        if (key.includes('hero_description')) return 'Descrição detalhada da seção hero. Use para explicar o propósito da plataforma.';
        if (key.includes('footer')) return 'Conteúdo exibido no rodapé do site. Visível em todas as páginas.';
        if (key.includes('copyright')) return 'Texto de direitos autorais exibido no rodapé.';
        return 'Este conteúdo será exibido publicamente no site. Certifique-se de que está correto antes de salvar.';
    };

    return (
        <div className="space-y-3 p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-300 transition-colors">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <label className="text-sm font-semibold text-gray-900">
                            {item.description || item.content_key}
                        </label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-blue-500 cursor-help flex-shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                    <p className="font-medium mb-1">Informação</p>
                                    <p className="text-xs">{getTooltipText(item.content_key)}</p>
                                    <p className="text-xs mt-2 text-gray-400">Chave técnica: {item.content_key}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <p className="text-xs text-gray-500 truncate">Chave: {item.content_key}</p>
                </div>
            </div>
            {isTextarea ? (
                <Textarea 
                    value={value} 
                    onChange={(e) => setValue(e.target.value)} 
                    rows={4}
                    className={cn(
                        "w-full",
                        hasChanges && "border-amber-300 bg-amber-50/50",
                        saved && "border-green-300 bg-green-50/50"
                    )}
                />
            ) : (
                <Input 
                    value={value} 
                    onChange={(e) => setValue(e.target.value)}
                    className={cn(
                        "w-full",
                        hasChanges && "border-amber-300 bg-amber-50/50",
                        saved && "border-green-300 bg-green-50/50"
                    )}
                />
            )}
            <div className="flex justify-end">
                <Button 
                    onClick={handleSave} 
                    size="sm" 
                    disabled={isUpdating || !hasChanges}
                    className={cn(
                        "min-w-[100px]",
                        saved && "bg-green-600 hover:bg-green-700"
                    )}
                >
                    {isUpdating ? (
                        <>Salvando...</>
                    ) : saved ? (
                        <>
                            <Check className="h-3 w-3 mr-1" />
                            Salvo!
                        </>
                    ) : (
                        <>
                            <Save className="h-3 w-3 mr-1" />
                            Salvar
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

const InstitutionalContentManager = () => {
  const { content, isLoading } = useInstitutionalContent();

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </CardContent>
        </Card>
    );
  }

  const heroContent = content.filter(c => c.content_key.startsWith('hero_'));
  const footerContent = content.filter(c => c.content_key.startsWith('footer_'));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conteúdo Institucional</CardTitle>
        <CardDescription>
          Edite os textos e links que aparecem em áreas públicas do site, como a página inicial e o rodapé.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
            <h3 className="text-lg font-semibold mb-4">Página Inicial (Hero)</h3>
            <div className="space-y-6">
                {heroContent.map(item => <ContentItem key={item.id} item={item} />)}
            </div>
        </div>
        <Separator />
        <div>
            <h3 className="text-lg font-semibold mb-4">Rodapé</h3>
            <div className="space-y-6">
                {footerContent.map(item => <ContentItem key={item.id} item={item} />)}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstitutionalContentManager;
