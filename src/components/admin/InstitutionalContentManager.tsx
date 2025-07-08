
import { useInstitutionalContent, InstitutionalContent } from "@/hooks/useInstitutionalContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

const ContentItem = ({ item }: { item: InstitutionalContent }) => {
    const { updateContent, isUpdating } = useInstitutionalContent();
    const [value, setValue] = useState(item.content_value);

    const handleSave = () => {
        if (value !== item.content_value) {
            updateContent({ id: item.id, content_value: value });
        }
    };
    
    const isTextarea = item.content_key.includes('description') || item.content_key.includes('subtitle');

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{item.description || item.content_key}</label>
            <p className="text-xs text-gray-500">Chave: {item.content_key}</p>
            {isTextarea ? (
                 <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3} />
            ) : (
                 <Input value={value} onChange={(e) => setValue(e.target.value)} />
            )}
            <div className="flex justify-end">
                <Button onClick={handleSave} size="sm" disabled={isUpdating || value === item.content_value}>
                    {isUpdating ? 'Salvando...' : 'Salvar'}
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
