import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { financialDashboardService } from '@/services/admin/financialDashboardService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAdminChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const detectFinancialQuestion = (question: string): boolean => {
    const financialKeywords = [
      'lucro', 'receita', 'despesa', 'salário', 'salarios', 'financeiro', 'financeira',
      'ganho', 'gasto', 'conta', 'contas', 'pagamento', 'pagamentos', 'dinheiro',
      'valor', 'quanto', 'quanto custa', 'quanto ganho', 'quanto gasto',
      'relatório financeiro', 'relatorio financeiro', 'dre', 'fluxo de caixa',
      'vencer', 'vencimento', 'vencendo', 'pagar', 'receber'
    ];
    
    const lowerQuestion = question.toLowerCase();
    return financialKeywords.some(keyword => lowerQuestion.includes(keyword));
  };

  const processFinancialQuestion = async (question: string): Promise<string> => {
    const lowerQuestion = question.toLowerCase();
    
    try {
      // Perguntas sobre lucro
      if (lowerQuestion.includes('lucro') || lowerQuestion.includes('ganho')) {
        const revenue = await financialDashboardService.getMonthlyRevenue();
        const expenses = await financialDashboardService.getMonthlyExpenses();
        const salaries = await financialDashboardService.getMonthlySalaries();
        const taxes = expenses.byCategory.impostos || 0;
        const profit = await financialDashboardService.calculateProfit(
          revenue.total,
          expenses.total,
          salaries.total,
          taxes
        );
        
        return `📊 **Seu Lucro Líquido do Mês:**\n\n` +
          `💰 Receita Total: R$ ${revenue.total.toFixed(2).replace('.', ',')}\n` +
          `📉 Despesas: R$ ${expenses.total.toFixed(2).replace('.', ',')}\n` +
          `👥 Salários: R$ ${salaries.total.toFixed(2).replace('.', ',')}\n` +
          `📋 Impostos: R$ ${taxes.toFixed(2).replace('.', ',')}\n\n` +
          `✅ **Lucro Líquido: R$ ${profit.profit.toFixed(2).replace('.', ',')}**\n` +
          `📈 Margem de Lucro: ${profit.profitMargin.toFixed(1)}%\n\n` +
          `*Dados referentes ao mês atual (${format(new Date(), 'MMMM yyyy', { locale: ptBR })})*`;
      }
      
      // Perguntas sobre receita
      if (lowerQuestion.includes('receita') || lowerQuestion.includes('recebido')) {
        const revenue = await financialDashboardService.getMonthlyRevenue();
        
        return `💰 **Receita do Mês:**\n\n` +
          `Total: R$ ${revenue.total.toFixed(2).replace('.', ',')}\n\n` +
          `📊 Por Fonte:\n` +
          `• ViaJAR: R$ ${revenue.viajar.toFixed(2).replace('.', ',')}\n` +
          `• Eventos: R$ ${revenue.events.toFixed(2).replace('.', ',')}\n` +
          `• Parceiros: R$ ${revenue.partners.toFixed(2).replace('.', ',')}\n` +
          `• Outros: R$ ${revenue.other.toFixed(2).replace('.', ',')}\n\n` +
          `*Dados referentes ao mês atual*`;
      }
      
      // Perguntas sobre despesas
      if (lowerQuestion.includes('despesa') || lowerQuestion.includes('gasto')) {
        const expenses = await financialDashboardService.getMonthlyExpenses();
        
        let categoryBreakdown = '';
        if (expenses.total > 0) {
          categoryBreakdown = '\n\n📊 Por Categoria:\n';
          Object.entries(expenses.byCategory).forEach(([cat, value]: [string, any]) => {
            if (Number(value) > 0) {
              categoryBreakdown += `• ${cat.charAt(0).toUpperCase() + cat.slice(1)}: R$ ${Number(value).toFixed(2).replace('.', ',')}\n`;
            }
          });
        }
        
        return `📉 **Despesas do Mês:**\n\n` +
          `Total: R$ ${expenses.total.toFixed(2).replace('.', ',')}${categoryBreakdown}\n\n` +
          `*Dados referentes ao mês atual*`;
      }
      
      // Perguntas sobre salários
      if (lowerQuestion.includes('salário') || lowerQuestion.includes('salario') || lowerQuestion.includes('funcionário')) {
        const salaries = await financialDashboardService.getMonthlySalaries();
        
        let employeesList = '';
        if (salaries.employees.length > 0) {
          employeesList = '\n\n👥 Funcionários:\n';
          salaries.employees.forEach(emp => {
            employeesList += `• ${emp.name}: R$ ${emp.salary.toFixed(2).replace('.', ',')} (${emp.status})\n`;
          });
        }
        
        return `👥 **Salários do Mês:**\n\n` +
          `Total: R$ ${salaries.total.toFixed(2).replace('.', ',')}\n` +
          `Funcionários: ${salaries.employees.length}${employeesList}\n\n` +
          `*Dados referentes ao mês atual*`;
      }
      
      // Perguntas sobre contas a vencer
      if (lowerQuestion.includes('vencer') || lowerQuestion.includes('vencimento') || lowerQuestion.includes('vencendo')) {
        const bills = await financialDashboardService.getUpcomingBills(7);
        
        if (bills.length === 0) {
          return `✅ **Nenhuma conta a vencer nos próximos 7 dias!**\n\n` +
            `Tudo em dia! 🎉`;
        }
        
        let billsList = '';
        bills.forEach(bill => {
          billsList += `• ${bill.description}: R$ ${bill.amount.toFixed(2).replace('.', ',')} ` +
            `(Vence em ${bill.days_until_due} ${bill.days_until_due === 1 ? 'dia' : 'dias'})\n`;
        });
        
        const totalBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
        
        return `⚠️ **Contas a Vencer (7 dias):**\n\n` +
          `${billsList}\n` +
          `💰 **Total: R$ ${totalBills.toFixed(2).replace('.', ',')}**\n\n` +
          `*Recomendação: Verifique o painel financeiro para mais detalhes*`;
      }
      
      // Perguntas sobre relatório
      if (lowerQuestion.includes('relatório') || lowerQuestion.includes('relatorio')) {
        return `📊 **Relatórios Financeiros Disponíveis:**\n\n` +
          `1. **DRE** (Demonstração do Resultado do Exercício)\n` +
          `   - Receitas, despesas e lucro líquido completo\n\n` +
          `2. **Fluxo de Caixa**\n` +
          `   - Análise de entradas e saídas de dinheiro\n\n` +
          `3. **Lucro Mensal/Anual**\n` +
          `   - Evolução do lucro ao longo do tempo\n\n` +
          `💡 Acesse a aba "Relatórios" no painel financeiro para gerar relatórios detalhados em PDF.`;
      }
      
      // Pergunta genérica sobre finanças
      const revenue = await financialDashboardService.getMonthlyRevenue();
      const expenses = await financialDashboardService.getMonthlyExpenses();
      const salaries = await financialDashboardService.getMonthlySalaries();
      const taxes = expenses.byCategory.impostos || 0;
      const profit = await financialDashboardService.calculateProfit(
        revenue.total,
        expenses.total,
        salaries.total,
        taxes
      );
      
      return `📊 **Resumo Financeiro do Mês:**\n\n` +
        `💰 Receita: R$ ${revenue.total.toFixed(2).replace('.', ',')}\n` +
        `📉 Despesas: R$ ${expenses.total.toFixed(2).replace('.', ',')}\n` +
        `👥 Salários: R$ ${salaries.total.toFixed(2).replace('.', ',')}\n` +
        `✅ Lucro Líquido: R$ ${profit.profit.toFixed(2).replace('.', ',')}\n` +
        `📈 Margem: ${profit.profitMargin.toFixed(1)}%\n\n` +
        `💡 Para mais detalhes, acesse o painel financeiro ou faça perguntas específicas como:\n` +
        `• "Qual meu lucro esse mês?"\n` +
        `• "Quais contas vencem essa semana?"\n` +
        `• "Quanto gastamos com marketing?"`;
      
    } catch (error) {
      console.error('Erro ao processar pergunta financeira:', error);
      return `❌ Erro ao buscar dados financeiros. Verifique se as tabelas foram criadas no banco de dados.\n\n` +
        `💡 Certifique-se de aplicar a migração SQL: ` +
        `\`supabase/migrations/20250601000000_create_financial_tables.sql\``;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const question = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      let assistantResponse: string;
      
      // Verificar se é pergunta sobre finanças
      if (detectFinancialQuestion(question)) {
        assistantResponse = await processFinancialQuestion(question);
      } else {
        // Resposta genérica para outras perguntas
        assistantResponse = `Olá! Sou o assistente IA do painel administrativo.\n\n` +
          `Atualmente, posso ajudá-lo com perguntas sobre **finanças**:\n` +
          `• Lucro e receitas\n` +
          `• Despesas e gastos\n` +
          `• Salários de funcionários\n` +
          `• Contas a vencer\n` +
          `• Relatórios financeiros\n\n` +
          `💡 Tente perguntar: "Qual meu lucro esse mês?" ou "Quais contas vencem essa semana?"\n\n` +
          `*Funcionalidades adicionais serão implementadas em breve.*`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao processar solicitação',
        variant: 'destructive',
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Erro ao processar sua pergunta: ${error.message || 'Erro desconhecido'}\n\n` +
          `Por favor, tente novamente ou verifique se as tabelas financeiras foram criadas no banco de dados.`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Assistente IA Admin
        </CardTitle>
        <CardDescription>
          Faça perguntas sobre finanças, receitas, despesas e salários
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 pr-4 mb-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'assistant'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`flex-1 rounded-lg p-3 ${
                    message.role === 'assistant'
                      ? 'bg-muted'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content.split('\n').map((line, idx) => {
                      // Formatação de markdown simples
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={idx} className="font-bold mt-2">{line.replace(/\*\*/g, '')}</p>;
                      }
                      if (line.startsWith('•')) {
                        return <p key={idx} className="ml-2">{line}</p>;
                      }
                      if (line.startsWith('*') && line.endsWith('*')) {
                        return <p key={idx} className="text-xs opacity-70 italic mt-2">{line.replace(/\*/g, '')}</p>;
                      }
                      return <p key={idx}>{line || '\u00A0'}</p>;
                    })}
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ex: Qual meu lucro esse mês?"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
