import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, DollarSign, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Bill {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  category: string;
  payment_status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paid_date?: string;
  notes?: string;
}

export default function BillsManager() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    due_date: '',
    category: 'outros',
    notes: '',
  });

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setBills((data || []) as Bill[]);
    } catch (error: any) {
      console.error('Erro ao buscar contas:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar contas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const billData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        category: formData.category,
        notes: formData.notes || null,
        payment_status: 'pending' as const,
      };

      if (editingBill) {
        const { error } = await supabase
          .from('expenses')
          .update(billData)
          .eq('id', editingBill.id);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Conta atualizada com sucesso' });
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([billData]);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Conta adicionada com sucesso' });
      }

      setIsDialogOpen(false);
      setEditingBill(null);
      setFormData({
        description: '',
        amount: '',
        due_date: '',
        category: 'outros',
        notes: '',
      });
      fetchBills();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar conta',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Conta excluída com sucesso' });
      fetchBills();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir conta',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setFormData({
      description: bill.description,
      amount: bill.amount.toString(),
      due_date: bill.due_date,
      category: bill.category,
      notes: bill.notes || '',
    });
    setIsDialogOpen(true);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (bill: Bill) => {
    if (bill.payment_status === 'paid') return 'text-[#16A34A]';
    if (bill.payment_status === 'overdue') return 'text-[#DC2626]';
    const days = getDaysUntilDue(bill.due_date);
    if (days < 0) return 'text-[#DC2626]';
    if (days <= 7) return 'text-[#F59E0B]';
    return 'text-[#A1A1AA]';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Contas a Pagar</h2>
          <p className="text-sm text-[#A1A1AA]">Gerencie suas contas e despesas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingBill(null);
            setFormData({
              description: '',
              amount: '',
              due_date: '',
              category: 'outros',
              notes: '',
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#111111] border-[#1F1F1F] text-white">
            <DialogHeader>
              <DialogTitle>{editingBill ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>
              <DialogDescription className="text-[#A1A1AA]">
                {editingBill ? 'Atualize os dados da conta' : 'Adicione uma nova conta a pagar'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description" className="text-white">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-[#0A0A0A] border-[#1F1F1F] text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount" className="text-white">Valor (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="bg-[#0A0A0A] border-[#1F1F1F] text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="due_date" className="text-white">Data de Vencimento</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="bg-[#0A0A0A] border-[#1F1F1F] text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category" className="text-white">Categoria</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#1F1F1F] rounded-md text-white"
                >
                  <option value="servers">Servidores</option>
                  <option value="marketing">Marketing</option>
                  <option value="office">Escritório</option>
                  <option value="taxes">Impostos</option>
                  <option value="other">Outros</option>
                </select>
              </div>
              <div>
                <Label htmlFor="notes" className="text-white">Observações (opcional)</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-[#0A0A0A] border-[#1F1F1F] text-white"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#3B82F6] hover:bg-[#2563EB]">
                  {editingBill ? 'Atualizar' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-[#111111] border-[#1F1F1F]">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-[#A1A1AA]">Carregando...</div>
          ) : bills.length === 0 ? (
            <div className="p-8 text-center text-[#A1A1AA]">
              <p>Nenhuma conta cadastrada</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1F1F1F]">
              {bills.map((bill) => {
                const days = getDaysUntilDue(bill.due_date);
                return (
                  <div key={bill.id} className="p-4 hover:bg-[#1A1A1A] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-5 w-5 text-[#A1A1AA]" />
                          <div>
                            <div className="font-medium text-white">{bill.description}</div>
                            <div className="text-sm text-[#A1A1AA] flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(bill.due_date), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                              <span className="capitalize">{bill.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${getStatusColor(bill)}`}>
                            R$ {bill.amount.toFixed(2).replace('.', ',')}
                          </div>
                          <div className="text-xs text-[#A1A1AA]">
                            {days < 0 
                              ? `${Math.abs(days)} dias atrasado`
                              : days === 0
                              ? 'Vence hoje'
                              : `${days} dias restantes`
                            }
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(bill)}
                            className="h-8 w-8 p-0 text-[#A1A1AA] hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(bill.id)}
                            className="h-8 w-8 p-0 text-[#A1A1AA] hover:text-[#DC2626]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

