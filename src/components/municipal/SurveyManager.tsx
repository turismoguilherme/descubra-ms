
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, ClipboardList, Eye, BarChart3, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Survey, SurveyResponse } from "@/types/municipal";

interface SurveyManagerProps {
  cityId: string;
}

const SurveyManager = ({ cityId }: SurveyManagerProps) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const { toast } = useToast();

  // Formulário de criação
  const [surveyForm, setSurveyForm] = useState({
    title: "",
    description: "",
    objective: "",
    questions: [{ question: "", type: "text", options: [] as string[] }],
    startDate: "",
    endDate: ""
  });

  const fetchSurveys = useCallback(async () => {
    if (!cityId) return;
    try {
      const { data, error } = await supabase
        .from('institutional_surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Add city_id to each survey for type compatibility
      const surveysWithCityId = (data || []).map(survey => ({
        ...survey,
        city_id: cityId || ''
      }));
      setSurveys(surveysWithCityId);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar pesquisas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [cityId, toast]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const surveyData = {
        title: surveyForm.title,
        description: surveyForm.description,
        objective: surveyForm.objective,
        questions: surveyForm.questions,
        start_date: surveyForm.startDate || null,
        end_date: surveyForm.endDate || null,
        created_by: user.id,
        city_id: cityId, // Associa ao cityId
        is_active: true
      };

      const { error } = await supabase
        .from('institutional_surveys')
        .insert([surveyData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pesquisa criada com sucesso!",
      });

      // Reset form
      setSurveyForm({
        title: "",
        description: "",
        objective: "",
        questions: [{ question: "", type: "text", options: [] }],
        startDate: "",
        endDate: ""
      });

      fetchSurveys();
    } catch (error) {
      console.error('Error creating survey:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar pesquisa",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const fetchSurveyResponses = async (surveyId: string) => {
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('survey_id', surveyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar respostas",
        variant: "destructive",
      });
    }
  };

  const addQuestion = () => {
    setSurveyForm({
      ...surveyForm,
      questions: [...surveyForm.questions, { question: "", type: "text", options: [] }]
    });
  };

  const updateQuestion = (index: number, field: string, value: unknown) => {
    const newQuestions = [...surveyForm.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setSurveyForm({ ...surveyForm, questions: newQuestions });
  };

  return (
    <div className="space-y-6">
      {/* Header com botão de criar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pesquisas Institucionais</h2>
          <p className="text-gray-600">Gerencie pesquisas e colete feedback dos cidadãos</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Pesquisa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Pesquisa</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleCreateSurvey} className="space-y-4">
              <div>
                <Label htmlFor="title">Título da Pesquisa</Label>
                <Input
                  id="title"
                  value={surveyForm.title}
                  onChange={(e) => setSurveyForm({...surveyForm, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={surveyForm.description}
                  onChange={(e) => setSurveyForm({...surveyForm, description: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="objective">Objetivo</Label>
                <Textarea
                  id="objective"
                  value={surveyForm.objective}
                  onChange={(e) => setSurveyForm({...surveyForm, objective: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Perguntas</Label>
                  <Button type="button" onClick={addQuestion} size="sm">
                    Adicionar Pergunta
                  </Button>
                </div>

                {surveyForm.questions.map((q, index) => (
                  <div key={index} className="border p-4 rounded-lg space-y-2">
                    <Input
                      placeholder="Digite a pergunta..."
                      value={q.question}
                      onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={surveyForm.startDate}
                    onChange={(e) => setSurveyForm({...surveyForm, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Data de Término</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={surveyForm.endDate}
                    onChange={(e) => setSurveyForm({...surveyForm, endDate: e.target.value})}
                  />
                </div>
              </div>

              <Button type="submit" disabled={creating} className="w-full">
                {creating ? "Criando..." : "Criar Pesquisa"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Pesquisas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="mr-2 h-5 w-5" />
            Pesquisas Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Objetivo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Respostas</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Carregando pesquisas...
                    </TableCell>
                  </TableRow>
                ) : surveys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      Nenhuma pesquisa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  surveys.map((survey) => (
                    <TableRow key={survey.id}>
                      <TableCell className="font-medium">{survey.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{survey.objective}</TableCell>
                      <TableCell>
                        <Badge variant={survey.is_active ? "default" : "secondary"}>
                          {survey.is_active ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {survey.created_at && new Date(survey.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          0
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedSurvey(survey);
                              fetchSurveyResponses(survey.id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyManager;
