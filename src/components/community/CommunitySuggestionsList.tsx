import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare, Eye } from 'lucide-react';

const CommunitySuggestionsListSimple = () => {
  const suggestions = [
    {
      id: '1',
      title: 'Nova trilha no Pantanal',
      description: 'Proposta de trilha ecológica para observação de aves',
      category: 'atrativo',
      status: 'approved',
      votes_count: 23,
      comments_count: 5
    },
    {
      id: '2', 
      title: 'Evento cultural em Bonito',
      description: 'Festival de música local para atrair mais turistas',
      category: 'evento',
      status: 'pending',
      votes_count: 18,
      comments_count: 3
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'outline';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sugestões da Comunidade</h2>
        <Button>Nova Sugestão</Button>
      </div>

      <div className="grid gap-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {suggestion.description}
                  </p>
                </div>
                <Badge variant={getStatusColor(suggestion.status) as any}>
                  {suggestion.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm">{suggestion.votes_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">{suggestion.comments_count}</span>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommunitySuggestionsListSimple;