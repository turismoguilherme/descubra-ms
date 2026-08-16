import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Contribution {
  id: string;
  type: 'tip' | 'photo' | 'review' | 'suggestion';
  content: string;
  location: {
    name: string;
    coordinates: [number, number];
  };
  timestamp: Date;
  status: 'pending' | 'approved' | 'featured';
  likes: number;
  author: {
    name: string;
    avatar: string;
    level: string;
  };
}

export function CommunityEngagement() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [newContribution, setNewContribution] = useState({
    type: 'tip',
    content: '',
    location: ''
  });

  // Simulação de dados iniciais
  useEffect(() => {
    // Em produção, isso viria da API
    setContributions([
      {
        id: '1',
        type: 'tip',
        content: 'O pôr do sol no Parque das Nações Indígenas é imperdível! Melhor horário é entre 17h e 18h.',
        location: {
          name: 'Parque das Nações Indígenas',
          coordinates: [-20.4697, -54.5798]
        },
        timestamp: new Date(),
        status: 'featured',
        likes: 45,
        author: {
          name: 'Maria Silva',
          avatar: '/avatars/maria.jpg',
          level: 'Embaixador Ouro'
        }
      },
      // Mais contribuições...
    ]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar envio para API
    console.log('Nova contribuição:', newContribution);
  };

  return (
    <div className="space-y-6">
      {/* Seção de Contribuição */}
      <Card>
        <CardHeader>
          <CardTitle>Compartilhe Sua Experiência</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <select
                className="w-full p-2 border rounded"
                value={newContribution.type}
                onChange={(e) => setNewContribution({...newContribution, type: e.target.value as any})}
              >
                <option value="tip">Dica Local</option>
                <option value="photo">Foto</option>
                <option value="review">Avaliação</option>
                <option value="suggestion">Sugestão</option>
              </select>
            </div>

            <div>
              <Input
                placeholder="Local (ex: Parque das Nações Indígenas)"
                value={newContribution.location}
                onChange={(e) => setNewContribution({...newContribution, location: e.target.value})}
              />
            </div>

            <div>
              <Textarea
                placeholder="Compartilhe sua experiência..."
                value={newContribution.content}
                onChange={(e) => setNewContribution({...newContribution, content: e.target.value})}
              />
            </div>

            <Button type="submit">Compartilhar</Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Contribuições */}
      <Card>
        <CardHeader>
          <CardTitle>Descobertas da Comunidade</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="featured">
            <TabsList>
              <TabsTrigger value="featured">Destaques</TabsTrigger>
              <TabsTrigger value="recent">Recentes</TabsTrigger>
              <TabsTrigger value="popular">Populares</TabsTrigger>
            </TabsList>

            <TabsContent value="featured">
              <div className="space-y-4">
                {contributions.map((contribution) => (
                  <div key={contribution.id} className="border rounded p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar>
                        <AvatarImage src={contribution.author.avatar} />
                        <AvatarFallback>{contribution.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{contribution.author.name}</p>
                        <Badge variant="secondary">{contribution.author.level}</Badge>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {contribution.location.name}
                    </p>

                    <p className="mb-2">{contribution.content}</p>

                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Button variant="ghost" size="sm">
                        👍 {contribution.likes}
                      </Button>
                      <span>•</span>
                      <span>{new Date(contribution.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 