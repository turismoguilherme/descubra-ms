/**
 * Financial Dashboard Service
 * Serviço completo para gestão financeira: receitas, despesas, salários e cálculo de lucro
 */

const SUPABASE_URL = "https://hvtrpkbjgbuypkskqcqm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHJwa2JqZ2J1eXBrc2txY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzIzODgsImV4cCI6MjA2NzYwODM4OH0.gHxmJIedckwQxz89DUHx4odzTbPefFeadW3T7cYcW2Q";

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

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/master_financial_records?record_type=eq.revenue&status=eq.paid&paid_date=gte.${start}&paid_date=lte.${end}&select=*`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          }
        }
      );

      if (!response.ok) {
        console.warn('Tabela master_financial_records não encontrada ou erro na query');
        return {
          total: 0,
          viajar: 0,
          events: 0,
          partners: 0,
          other: 0,
          byMonth: [],
        };
      }

      const records = await response.json();
      
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

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/expenses?due_date=gte.${start}&due_date=lte.${end}&select=*`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          }
        }
      );

      if (!response.ok) {
        console.warn('Tabela expenses não encontrada ou erro na query');
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

      const expenses = await response.json();
      
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

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/employee_salaries?month=eq.${currentMonth}&year=eq.${currentYear}&select=*&order=total_amount.desc`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          }
        }
      );

      if (!response.ok) {
        console.warn('Tabela employee_salaries não encontrada ou erro na query');
        return {
          total: 0,
          employees: [],
        };
      }

      const salaries = await response.json();
      
      // Garantir que salaries é um array
      if (!Array.isArray(salaries)) {
        console.warn('Resposta não é um array:', salaries);
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
          const empResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/viajar_employees?id=in.(${employeeIds.join(',')})&select=id,name`,
            {
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
              }
            }
          );
          
          if (empResponse.ok) {
            const employeesData = await empResponse.json();
            if (Array.isArray(employeesData)) {
              employeesData.forEach((emp: any) => {
                employeeNames[emp.id] = emp.name;
              });
            }
          }
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

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/expenses?payment_status=eq.pending&due_date=gte.${today.toISOString().split('T')[0]}&due_date=lte.${futureDate.toISOString().split('T')[0]}&select=*&order=due_date.asc`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          }
        }
      );

      if (!response.ok) {
        console.warn('Tabela expenses não encontrada ou erro na query');
        return [];
      }

      const expenses = await response.json();
      
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
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/expenses`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            ...data,
            payment_status: 'pending',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao criar despesa');
      }

      return await response.json();
    } catch (error) {
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
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/expenses?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao atualizar despesa');
      }

      return await response.json();
    } catch (error) {
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

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/employee_salaries`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
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
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao registrar pagamento de salário');
      }

      return await response.json();
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
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/viajar_employees?id=eq.${employeeId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            current_salary: newSalary,
            salary_updated_at: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao atualizar salário');
      }

      return await response.json();
    } catch (error) {
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

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/master_financial_records?record_type=eq.revenue&paid_date=gte.${start}&paid_date=lte.${end}&select=*&order=paid_date.desc`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          }
        }
      );

      if (!response.ok) {
        console.warn('Tabela master_financial_records não encontrada ou erro na query');
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      return [];
    }
  },

  /**
   * Buscar todas as despesas (para listagem)
   */
  async getAllExpenses(startDate?: string, endDate?: string): Promise<any[]> {
    try {
      const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const end = endDate || new Date().toISOString().split('T')[0];

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/expenses?due_date=gte.${start}&due_date=lte.${end}&select=*&order=due_date.desc`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          }
        }
      );

      if (!response.ok) {
        console.warn('Tabela expenses não encontrada ou erro na query');
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      return [];
    }
  },

  /**
   * Buscar funcionários com salários
   */
  async getEmployees(): Promise<any[]> {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/viajar_employees?is_active=eq.true&select=*&order=name.asc`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          }
        }
      );

      if (!response.ok) {
        console.warn('Tabela viajar_employees não encontrada ou erro na query');
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      return [];
    }
  },
};

