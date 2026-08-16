
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface RouteBasicInfoProps {
  formData: {
    name: string;
    description: string;
    region: string;
    difficulty_level: "facil" | "medio" | "dificil";
    estimated_duration: number;
    promotional_text: string;
    video_url: string;
    is_active: boolean;
  };
  onInputChange: (field: string, value: unknown) => void;
  regions: string[];
}

const RouteBasicInfo = ({ formData, onInputChange, regions }: RouteBasicInfoProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Informações do Roteiro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Roteiro</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            placeholder="Ex: Roteiro da Natureza de Jaraguari"
          />
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onInputChange("description", e.target.value)}
            placeholder="Descreva o roteiro..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="region">Região Turística</Label>
            <Select 
              value={formData.region} 
              onValueChange={(value) => onInputChange("region", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a região" />
              </SelectTrigger>
              <SelectContent>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="difficulty">Nível de Dificuldade</Label>
            <Select 
              value={formData.difficulty_level} 
              onValueChange={(value) => onInputChange("difficulty_level", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facil">Fácil</SelectItem>
                <SelectItem value="medio">Médio</SelectItem>
                <SelectItem value="dificil">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="duration">Duração Estimada (minutos)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.estimated_duration}
            onChange={(e) => onInputChange("estimated_duration", parseInt(e.target.value))}
            min="15"
            step="15"
          />
        </div>

        <div>
          <Label htmlFor="promotional_text">Texto Promocional</Label>
          <Textarea
            id="promotional_text"
            value={formData.promotional_text}
            onChange={(e) => onInputChange("promotional_text", e.target.value)}
            placeholder="Texto promocional para atrair turistas..."
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="video_url">URL do Vídeo (opcional)</Label>
          <Input
            id="video_url"
            value={formData.video_url}
            onChange={(e) => onInputChange("video_url", e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => onInputChange("is_active", checked)}
          />
          <Label htmlFor="is_active">Roteiro ativo</Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteBasicInfo;
