/**
 * Financial Dashboard Service
 * Serviço completo para gestão financeira: receitas, despesas, salários e cálculo de lucro
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Verifica se há uma sessão válida antes de fazer operações
 */
async function ensureValidSession(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return false;
    }
    
    // Verificar se o token está próximo de expirar (menos de 5 minutos)
    if (session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      
      // Se está próximo de expirar (menos de 5 minutos), tentar renovar
      if (timeUntilExpiry < 5 * 60 * 1000 && session.refresh_token) {
        console.log('Token próximo de expirar, renovando preventivamente...');
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.warn('Não foi possível renovar token preventivamente:', refreshError);
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return false;
  }
}

/**
 * Helper para tentar renovar o token e retentar a operação
 */
async function retryWithTokenRefresh<T>(
  operation: () => Promise<T>,
  retries = 1
): Promise<T> {
  try {
    // Verificar sessão antes de tentar a operação
    const hasValidSession = await ensureValidSession();
    if (!hasValidSession) {
      throw new Error('Sessão expirada. Por favor, recarregue a página e faça login novamente.');
    }
    
    return await operation();
  } catch (error: any) {
    // Se for erro de JWT expirado e ainda tiver tentativas
    if ((error.code === 'PGRST301' || error.message?.includes('JWT expired')) && retries > 0) {
      console.log('Token expirado, tentando renovar...');
      try {
        // Verificar se há uma sessão atual
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !currentSession) {
          console.warn('Nenhuma sessão encontrada para renovar:', sessionError);
          throw new Error('Sessão expirada. Por favor, recarregue a página e faça login novamente.');
        }
        
        // Verificar se a sessão tem refresh token
        if (!currentSession.refresh_token) {
          console.warn('Sessão não tem refresh token');
          throw new Error('Sessão expirada. Por favor, recarregue a página e faça login novamente.');
        }
        
        // Tentar renovar o token usando a sessão atual
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('Erro ao renovar token:', refreshError);
          // Se o refresh token também expirou, não há como renovar
          if (refreshError.message?.includes('refresh_token_not_found') || 
              refreshError.message?.includes('invalid_grant') ||
              refreshError.message?.includes('JWT expired')) {
            throw new Error('Sessão completamente expirada. Por favor, recarregue a página e faça login novamente.');
          }
          throw new Error('Sessão expirada. Por favor, recarregue a página e faça login novamente.');
        }
        
        if (!session) {
          console.warn('Renovação de token não retornou sessão');
          throw new Error('Sessão expirada. Por favor, recarregue a página e faça login novamente.');
        }
        
        console.log('Token renovado com sucesso, retentando operação...');
        // Aguardar um pouco para garantir que o token foi atualizado no cliente
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Retentar a operação
        return await operation();
      } catch (refreshErr: any) {
        // Se a mensagem já é sobre sessão expirada, propagar
        if (refreshErr.message?.includes('Sessão expirada') || refreshErr.message?.includes('expirada')) {
          throw refreshErr;
        }
        console.error('Erro ao renovar token:', refreshErr);
        throw new Error('Sessão expirada. Por favor, recarregue a página e faça login novamente.');
      }
    }
    throw error;
  }
}

export interface MonthlyRevenue {
  total: number;
  viajar: number;
  events: number;
  partners: number;
  other: number;
  byMonth: Array<{
    month: string;
    revenue: number;
    viajar: number;
    events: number;
  }>;
}

export interface MonthlyExpenses {
  total: number;
  byCategory: {
    servidores: number;
    marketing: number;
    infraestrutura: number;
    impostos: number;
    salarios: number;
    outros: number;
  };
  byMonth: Array<{
    month: string;
    expenses: number;
  }>;
}

export interface MonthlySalaries {
  total: number;
  employees: Array<{
    id: string;
    name: string;
    salary: number;
    status: string;
  }>;
}

export interface UpcomingBill {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  category: string;
  days_until_due: number;
}

export interface ProfitCalculation {
  revenue: number;
  expenses: number;
  salaries: number;
  taxes: number;
  profit: number;
  profitMargin: number;
}

export const financialDashboardService = {
  /**
   * Buscar receitas do período
   */
  async getMonthlyRevenue(startDate?: string, endDate?: string): Promise<MonthlyRevenue> {
    try {
      const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const end = endDate || new Date().toISOString().split('T')[0];

      const records = await retryWithTokenRefresh(async () => {
        const { data, error } = await supabase
          .from('master_financial_records')
          .select('*')
          .eq('record_type', 'revenue')
          .eq('status', 'paid')
          .gte('paid_date', start)
          .lte('paid_date', end);

        if (error || !data) {
          console.warn('Tabela master_financial_records não encontrada ou erro na query:', error);
          return [];
        }
        return data;
      }).catch(() => []);
      
      // Garantir que records é um array
      if (!Array.isArray(records)) {
        console.warn('Resposta não é um array:', records);
        return {
          total: 0,
          viajar: 0,
          events: 0,
          partners: 0,
          other: 0,
          byMonth: [],
        };
      }

      const total = records.reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0);
      const viajar = records
        .filter((r: any) => r.source === 'viajar_subscription')
        .reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0);
      const events = records
        .filter((r: any) => r.source === 'event_sponsor')
        .reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0);
      const partners = records
        .filter((r: any) => r.source === 'partner')
        .reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0);
      const other = records
        .filter((r: any) => !r.source || r.source === 'other')
        .reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0);

      // Agrupar por mês (últimos 6 meses)
      const byMonth: Array<{ month: string; revenue: number; viajar: number; events: number }> = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = date.toISOString().slice(0, 7);
        const monthRecords = records.filter((r: any) => r.paid_date?.startsWith(monthStr));
        byMonth.push({
          month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          revenue: monthRecords.reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0),
          viajar: monthRecords
            .filter((r: any) => r.source === 'viajar_subscription')
            .reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0),
          events: monthRecords
            .filter((r: any) => r.source === 'event_sponsor')
            .reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0),
        });
      }

      return {
        total,
        viajar,
        events,
        partners,
        other,
        byMonth,
      };
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      return {
        total: 0,
        viajar: 0,
        events: 0,
        partners: 0,
        other: 0,
        byMonth: [],
      };
    }
  },

  /**
   * Buscar despesas do período
   */
  async getMonthlyExpenses(startDate?: string, endDate?: string): Promise<MonthlyExpenses> {
    try {
      const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const end = endDate || new Date().toISOString().split('T')[0];

      const expenses = await retryWithTokenRefresh(async () => {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .gte('due_date', start)
          .lte('due_date', end);

        if (error || !data) {
          console.warn('Tabela expenses não encontrada ou erro na query:', error);
          return [];
        }
        return data;
      }).catch(() => []);
      
      // Garantir que expenses é um array
      if (!Array.isArray(expenses)) {
        console.warn('Resposta não é um array:', expenses);
        return {
          total: 0,
          byCategory: {
            servidores: 0,
            marketing: 0,
            infraestrutura: 0,
            impostos: 0,
            salarios: 0,
            outros: 0,
          },
          byMonth: [],
        };
      }

      const total = expenses.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);
      
      const byCategory = {
        servidores: expenses
          .filter((e: any) => e.category === 'servidores')
          .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0),
        marketing: expenses
          .filter((e: any) => e.category === 'marketing')
          .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0),
        infraestrutura: expenses
          .filter((e: any) => e.category === 'infraestrutura')
          .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0),
        impostos: expenses
          .filter((e: any) => e.category === 'impostos')
          .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0),
        salarios: expenses
          .filter((e: any) => e.category === 'salarios')
          .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0),
        outros: expenses
          .filter((e: any) => e.category === 'outros')
          .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0),
      };

      // Agrupar por mês
      const byMonth: Array<{ month: string; expenses: number }> = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = date.toISOString().slice(0, 7);
        const monthExpenses = expenses.filter((e: any) => e.due_date?.startsWith(monthStr));
        byMonth.push({
          month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          expenses: monthExpenses.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0),
        });
      }

      return {
        total,
        byCategory,
        byMonth,
      };
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      return {
        total: 0,
        byCategory: {
          servidores: 0,
          marketing: 0,
          infraestrutura: 0,
          impostos: 0,
          salarios: 0,
          outros: 0,
        },
        byMonth: [],
      };
    }
  },

  /**
   * Buscar salários do mês
   */
  async getMonthlySalaries(month?: number, year?: number): Promise<MonthlySalaries> {
    try {
      const currentMonth = month || new Date().getMonth() + 1;
      const currentYear = year || new Date().getFullYear();

      const salaries = await retryWithTokenRefresh(async () => {
        const { data, error } = await supabase
          .from('employee_salaries')
          .select('*')
          .eq('month', currentMonth)
          .eq('year', currentYear)
          .order('total_amount', { ascending: false });

        if (error || !data) {
          console.warn('Tabela employee_salaries não encontrada ou erro na query:', error);
          return [];
        }
        return Array.isArray(data) ? data : [];
      }).catch(() => []);

      if (!Array.isArray(salaries) || salaries.length === 0) {
        return {
          total: 0,
          employees: [],
        };
      }

      const total = salaries.reduce((sum: number, s: any) => sum + Number(s.total_amount || 0), 0);
      
      // Buscar nomes dos funcionários separadamente
      const employeeIds = [...new Set(salaries.map((s: any) => s.employee_id))];
      let employeeNames: Record<string, string> = {};
      
      if (employeeIds.length > 0) {
        try {
          const employeesData = await retryWithTokenRefresh(async () => {
            const { data, error } = await supabase
              .from('viajar_employees')
              .select('id, name')
              .in('id', employeeIds);
            
            if (error || !data) return [];
            return Array.isArray(data) ? data : [];
          }).catch(() => []);
          
          employeesData.forEach((emp: any) => {
            employeeNames[emp.id] = emp.name;
          });
        } catch (err) {
          console.warn('Erro ao buscar nomes dos funcionários:', err);
        }
      }
      
      const employees = salaries.map((s: any) => ({
        id: s.employee_id,
        name: employeeNames[s.employee_id] || 'N/A',
        salary: Number(s.total_amount || 0),
        status: s.payment_status,
      }));

      return {
        total,
        employees,
      };
    } catch (error) {
      console.error('Erro ao buscar salários:', error);
      return {
        total: 0,
        employees: [],
      };
    }
  },

  /**
   * Calcular lucro líquido
   */
  async calculateProfit(
    revenue: number,
    expenses: number,
    salaries: number,
    taxes: number = 0
  ): Promise<ProfitCalculation> {
    const profit = revenue - expenses - salaries - taxes;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      revenue,
      expenses,
      salaries,
      taxes,
      profit,
      profitMargin,
    };
  },

  /**
   * Buscar contas a vencer
   */
  async getUpcomingBills(days: number = 7): Promise<UpcomingBill[]> {
    try {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + days);

      const expenses = await retryWithTokenRefresh(async () => {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('payment_status', 'pending')
          .gte('due_date', today.toISOString().split('T')[0])
          .lte('due_date', futureDate.toISOString().split('T')[0])
          .order('due_date', { ascending: true });

        if (error || !data) {
          console.warn('Tabela expenses não encontrada ou erro na query:', error);
          return [];
        }
        return Array.isArray(data) ? data : [];
      }).catch(() => []);
      
      // Garantir que expenses é um array
      if (!Array.isArray(expenses)) {
        console.warn('Resposta não é um array:', expenses);
        return [];
      }

      return expenses.map((e: any) => {
        const dueDate = new Date(e.due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: e.id,
          description: e.description,
          amount: Number(e.amount || 0),
          due_date: e.due_date,
          category: e.category,
          days_until_due: daysUntilDue,
        };
      });
    } catch (error) {
      console.error('Erro ao buscar contas a vencer:', error);
      return [];
    }
  },

  /**
   * Criar despesa
   */
  async createExpense(data: {
    description: string;
    category: string;
    amount: number;
    due_date: string;
    recurring?: string;
    metadata?: any;
  }): Promise<any> {
    try {
      // Garantir que o amount é um número válido e não excede o limite
      const amountValue = Number(data.amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error('Valor inválido. Deve ser um número maior que zero.');
      }
      
      // Limitar o valor máximo (99.999.999,99)
      if (amountValue > 99999999.99) {
        throw new Error('Valor excede o limite máximo de R$ 99.999.999,99.');
      }
      
      return await retryWithTokenRefresh(async () => {
        const { data: expenseData, error } = await supabase
          .from('expenses')
          .insert({
            ...data,
            amount: amountValue, // Garantir que é um número
            payment_status: 'pending',
          })
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar despesa:', error);
          // Melhorar mensagem de erro para overflow numérico
          if (error.code === '22003' || error.message?.includes('overflow')) {
            throw new Error('Valor muito grande. O valor máximo permitido é R$ 99.999.999,99.');
          }
          if (error.code === 'PGRST301' || error.message?.includes('JWT expired')) {
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
          }
          throw new Error(error.message || 'Erro ao criar despesa');
        }

        return expenseData;
      });
    } catch (error: any) {
      console.error('Erro ao criar despesa:', error);
      throw error;
    }
  },

  /**
   * Atualizar despesa
   */
  async updateExpense(id: string, data: Partial<{
    description: string;
    category: string;
    amount: number;
    due_date: string;
    payment_status: string;
    paid_date: string;
    recurring: string;
  }>): Promise<any> {
    try {
      const { data: updatedData, error } = await supabase
        .from('expenses')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Erro ao atualizar despesa');
      }

      return updatedData;
    } catch (error: any) {
      console.error('Erro ao atualizar despesa:', error);
      throw error;
    }
  },

  /**
   * Registrar pagamento de salário
   */
  async registerSalaryPayment(
    employeeId: string,
    month: number,
    year: number,
    data: {
      base_salary: number;
      bonuses?: number;
      deductions?: number;
      payment_date?: string;
      notes?: string;
    }
  ): Promise<any> {
    try {
      const totalAmount = Number(data.base_salary) + Number(data.bonuses || 0) - Number(data.deductions || 0);

      const { data: salaryData, error } = await supabase
        .from('employee_salaries')
        .insert({
          employee_id: employeeId,
          month,
          year,
          base_salary: data.base_salary,
          bonuses: data.bonuses || 0,
          deductions: data.deductions || 0,
          total_amount: totalAmount,
          payment_status: data.payment_date ? 'paid' : 'pending',
          payment_date: data.payment_date || null,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Erro ao registrar pagamento de salário');
      }

      return salaryData;
    } catch (error) {
      console.error('Erro ao registrar pagamento de salário:', error);
      throw error;
    }
  },

  /**
   * Atualizar salário do funcionário
   */
  async updateEmployeeSalary(employeeId: string, newSalary: number): Promise<any> {
    try {
      const { data: updatedData, error } = await supabase
        .from('viajar_employees')
        .update({
          current_salary: newSalary,
          salary_updated_at: new Date().toISOString(),
        })
        .eq('id', employeeId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Erro ao atualizar salário');
      }

      return updatedData;
    } catch (error: any) {
      console.error('Erro ao atualizar salário:', error);
      throw error;
    }
  },

  /**
   * Buscar todas as receitas (para listagem)
   */
  async getAllRevenue(startDate?: string, endDate?: string): Promise<any[]> {
    try {
      const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const end = endDate || new Date().toISOString().split('T')[0];

      try {
        return await retryWithTokenRefresh(async () => {
          const { data, error } = await supabase
            .from('master_financial_records')
            .select('*')
            .eq('record_type', 'revenue')
            .gte('paid_date', start)
            .lte('paid_date', end)
            .order('paid_date', { ascending: false });

          if (error) {
            // Não logar erro de JWT expirado como warning (já será tratado pelo retry)
            if (error.code !== 'PGRST301') {
              console.warn('Tabela master_financial_records não encontrada ou erro na query:', error);
            }
            throw error;
          }

          return Array.isArray(data) ? data : [];
        });
      } catch (error: any) {
        // Se for erro de sessão expirada, retornar array vazio silenciosamente
        if (error.message?.includes('Sessão expirada') || error.code === 'PGRST301') {
          return [];
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Erro ao buscar receitas:', error);
      return [];
    }
  },

  /**
   * Buscar todas as despesas (para listagem)
   */
  async getAllExpenses(startDate?: string, endDate?: string): Promise<any[]> {
    try {
      try {
        return await retryWithTokenRefresh(async () => {
          // Se não houver filtros de data, buscar todas as despesas
          // (mas limitar a um range razoável para performance)
          if (!startDate && !endDate) {
            // Buscar despesas dos últimos 2 anos e próximos 2 anos
            const twoYearsAgo = new Date();
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
            const twoYearsAhead = new Date();
            twoYearsAhead.setFullYear(twoYearsAhead.getFullYear() + 2);
            
            const { data, error } = await supabase
              .from('expenses')
              .select('*')
              .gte('due_date', twoYearsAgo.toISOString().split('T')[0])
              .lte('due_date', twoYearsAhead.toISOString().split('T')[0])
              .order('due_date', { ascending: false });
            
            if (error) {
              // Não logar erro de JWT expirado como warning (já será tratado pelo retry)
              if (error.code !== 'PGRST301') {
                console.warn('Tabela expenses não encontrada ou erro na query:', error);
              }
              throw error;
            }
            
            return Array.isArray(data) ? data : [];
          }
          
          // Se houver filtros de data, aplicá-los
          let query = supabase
            .from('expenses')
            .select('*');
          
          if (startDate) {
            query = query.gte('due_date', startDate);
          }
          if (endDate) {
            query = query.lte('due_date', endDate);
          }
          
          const { data, error } = await query.order('due_date', { ascending: false });

          if (error) {
            // Não logar erro de JWT expirado como warning (já será tratado pelo retry)
            if (error.code !== 'PGRST301') {
              console.warn('Tabela expenses não encontrada ou erro na query:', error);
            }
            throw error;
          }

          return Array.isArray(data) ? data : [];
        });
      } catch (error: any) {
        // Se for erro de sessão expirada, retornar array vazio silenciosamente
        if (error.message?.includes('Sessão expirada') || error.code === 'PGRST301') {
          return [];
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Erro ao buscar despesas:', error);
      return [];
    }
  },

  /**
   * Buscar funcionários com salários
   */
  async getEmployees(): Promise<any[]> {
    try {
      return await retryWithTokenRefresh(async () => {
        const { data, error } = await supabase
          .from('viajar_employees')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) {
          console.warn('Tabela viajar_employees não encontrada ou erro na query:', error);
          return [];
        }

        return Array.isArray(data) ? data : [];
      });
    } catch (error: any) {
      console.error('Erro ao buscar funcionários:', error);
      if (error.message?.includes('Sessão expirada')) {
        throw error;
      }
      return [];
    }
  },
};

