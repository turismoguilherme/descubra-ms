
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  question: string;
  answered: boolean;
  answer: string | null;
}

interface PendingQuestionsTabProps {
  questions: Question[];
}

const PendingQuestionsTab = ({ questions }: PendingQuestionsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Perguntas Pendentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/3">Pergunta</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions
              .filter(q => !q.answered)
              .map((question) => (
                <TableRow key={question.id}>
                  <TableCell>{question.question}</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      Aguardando resposta
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Adicionar resposta
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            {questions.filter(q => !q.answered).length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                  Não há perguntas pendentes no momento
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2">Perguntas respondidas recentemente:</h4>
          <div className="space-y-3">
            {questions
              .filter(q => q.answered)
              .map((question) => (
                <div key={question.id} className="border p-3 rounded-md">
                  <p className="font-medium">{question.question}</p>
                  <p className="text-gray-600 text-sm mt-1">{question.answer}</p>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingQuestionsTab;
