
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSuggestionForm } from "@/hooks/useSuggestionForm";
import { sanitizeInput } from "@/components/security/InputValidator";

const SuggestionForm = () => {
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    location: "",
    contact: "",
    category: ""
  });
  
  const { submitSuggestion, loading } = useSuggestionForm();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.title || !formData.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const success = await submitSuggestion(formData);
    if (success) {
      setFormData({
        type: "",
        title: "",
        description: "",
        location: "",
        contact: "",
        category: ""
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Envie sua Sugestão</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Sugestão *</label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="melhoria">Melhoria</SelectItem>
                <SelectItem value="novo_recurso">Novo Recurso</SelectItem>
                <SelectItem value="problema">Relatar Problema</SelectItem>
                <SelectItem value="feedback">Feedback Geral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Título *</label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Título da sua sugestão"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descrição *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva sua sugestão em detalhes"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Localização</label>
            <Input
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Cidade ou região (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contato</label>
            <Input
              value={formData.contact}
              onChange={(e) => handleInputChange('contact', e.target.value)}
              placeholder="Email ou telefone (opcional)"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enviando..." : "Enviar Sugestão"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SuggestionForm;
