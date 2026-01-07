// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Building2, Plus, Edit, Trash2, CreditCard, Wallet,
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Users, FileText, Search, MoreVertical, Eye, EyeOff
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface BankAccount {
  id: string;
  name: string;
  bank_name: string;
  account_type: 'checking' | 'savings' | 'investment';
  account_number: string;
  agency: string;
  balance: number;
  is_active: boolean;
  color: string;
  created_at: string;
}

interface Supplier {
  id: string;
  name: string;
  document: string; // CNPJ ou CPF
  document_type: 'cpf' | 'cnpj';
  email: string;
  phone: string;
  category: string;
  address: string;
  notes: string;
  is_active: boolean;
  total_paid: number;
  last_payment: string;
  created_at: string;
}

const BANK_COLORS = [
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Laranja', value: '#F59E0B' },
  { name: 'Vermelho', value: '#EF4444' },
  { name: 'Ciano', value: '#06B6D4' },
];

const SUPPLIER_CATEGORIES = [
  'Serviços de TI',
  'Marketing e Publicidade',
  'Hospedagem e Servidores',
  'Equipamentos',
  'Materiais de Escritório',
  'Serviços Contábeis',
  'Serviços Jurídicos',
  'Transporte',
  'Alimentação',
  'Outros',
];

export default function BankAccountsManager() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('accounts');
  const [loading, setLoading] = useState(true);
  
  // Contas Bancárias
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [accountForm, setAccountForm] = useState({
    name: '',
    bank_name: '',
    account_type: 'checking' as const,
    account_number: '',
    agency: '',
    balance: '',
    color: '#3B82F6',
  });
  const [showBalances, setShowBalances] = useState(true);

  // Fornecedores
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    document: '',
    document_type: 'cnpj' as const,
    email: '',
    phone: '',
    category: '',
    address: '',
    notes: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'accounts') {
        await loadAccounts();
      } else {
        await loadSuppliers();
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    // Tentar carregar do banco, se falhar usa localStorage
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.warn('Usando localStorage para contas:', error);
      const cached = localStorage.getItem('bank_accounts');
      if (cached) {
        setAccounts(JSON.parse(cached));
      }
    }
  };

  const loadSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.warn('Usando localStorage para fornecedores:', error);
      const cached = localStorage.getItem('suppliers');
      if (cached) {
        setSuppliers(JSON.parse(cached));
      }
    }
  };

  // Salvar conta bancária
  const handleSaveAccount = async () => {
    try {
      const accountData: Omit<BankAccount, 'id' | 'created_at'> = {
        name: accountForm.name,
        bank_name: accountForm.bank_name,
        account_type: accountForm.account_type,
        account_number: accountForm.account_number,
        agency: accountForm.agency,
        balance: Number(accountForm.balance) || 0,
        color: accountForm.color,
        is_active: true,
      };

      if (editingAccount) {
        // Atualizar
        try {
          await supabase.from('bank_accounts').update(accountData).eq('id', editingAccount.id);
        } catch (e) {
          console.warn('Salvando no localStorage');
        }
        const updated = accounts.map(a => a.id === editingAccount.id ? { ...a, ...accountData } : a);
        setAccounts(updated);
        localStorage.setItem('bank_accounts', JSON.stringify(updated));
      } else {
        // Criar
        const newAccount = {
          ...accountData,
          id: `local-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        try {
          const { data } = await supabase.from('bank_accounts').insert(accountData).select().single();
          if (data) newAccount.id = data.id;
        } catch (e) {
          console.warn('Salvando no localStorage');
        }
        const updated = [...accounts, newAccount];
        setAccounts(updated);
        localStorage.setItem('bank_accounts', JSON.stringify(updated));
      }

      setAccountDialogOpen(false);
      resetAccountForm();
      toast({
        title: 'Sucesso',
        description: editingAccount ? 'Conta atualizada!' : 'Conta criada!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a conta',
        variant: 'destructive',
      });
    }
  };

  // Salvar fornecedor
  const handleSaveSupplier = async () => {
    try {
      const supplierData: Omit<Supplier, 'id' | 'created_at' | 'total_paid' | 'last_payment'> = {
        name: supplierForm.name,
        document: supplierForm.document,
        document_type: supplierForm.document_type,
        email: supplierForm.email,
        phone: supplierForm.phone,
        category: supplierForm.category,
        address: supplierForm.address,
        notes: supplierForm.notes,
        is_active: true,
      };

      if (editingSupplier) {
        const updated = suppliers.map(s => s.id === editingSupplier.id ? { ...s, ...supplierData } : s);
        setSuppliers(updated);
        localStorage.setItem('suppliers', JSON.stringify(updated));
      } else {
        const newSupplier: Supplier = {
          ...supplierData,
          id: `local-${Date.now()}`,
          created_at: new Date().toISOString(),
          total_paid: 0,
          last_payment: '',
        };
        const updated = [...suppliers, newSupplier];
        setSuppliers(updated);
        localStorage.setItem('suppliers', JSON.stringify(updated));
      }

      setSupplierDialogOpen(false);
      resetSupplierForm();
      toast({
        title: 'Sucesso',
        description: editingSupplier ? 'Fornecedor atualizado!' : 'Fornecedor criado!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o fornecedor',
        variant: 'destructive',
      });
    }
  };

  const resetAccountForm = () => {
    setAccountForm({
      name: '',
      bank_name: '',
      account_type: 'checking',
      account_number: '',
      agency: '',
      balance: '',
      color: '#3B82F6',
    });
    setEditingAccount(null);
  };

  const resetSupplierForm = () => {
    setSupplierForm({
      name: '',
      document: '',
      document_type: 'cnpj',
      email: '',
      phone: '',
      category: '',
      address: '',
      notes: '',
    });
    setEditingSupplier(null);
  };

  const editAccount = (account: BankAccount) => {
    setEditingAccount(account);
    setAccountForm({
      name: account.name,
      bank_name: account.bank_name,
      account_type: account.account_type,
      account_number: account.account_number,
      agency: account.agency,
      balance: account.balance.toString(),
      color: account.color,
    });
    setAccountDialogOpen(true);
  };

  const editSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      name: supplier.name,
      document: supplier.document,
      document_type: supplier.document_type,
      email: supplier.email,
      phone: supplier.phone,
      category: supplier.category,
      address: supplier.address,
      notes: supplier.notes,
    });
    setSupplierDialogOpen(true);
  };

  const deleteAccount = (id: string) => {
    const updated = accounts.filter(a => a.id !== id);
    setAccounts(updated);
    localStorage.setItem('bank_accounts', JSON.stringify(updated));
    toast({ title: 'Conta removida' });
  };

  const deleteSupplier = (id: string) => {
    const updated = suppliers.filter(s => s.id !== id);
    setSuppliers(updated);
    localStorage.setItem('suppliers', JSON.stringify(updated));
    toast({ title: 'Fornecedor removido' });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.document.includes(searchTerm) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contas e Fornecedores</h2>
          <p className="text-gray-600 mt-1">Gerencie suas contas bancárias e fornecedores</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="accounts" className="data-[state=active]:bg-white">
            <CreditCard className="h-4 w-4 mr-2" />
            Contas Bancárias
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="data-[state=active]:bg-white">
            <Users className="h-4 w-4 mr-2" />
            Fornecedores
          </TabsTrigger>
        </TabsList>

        {/* Aba Contas Bancárias */}
        <TabsContent value="accounts" className="space-y-6 mt-6">
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Wallet className="h-5 w-5 text-blue-500" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowBalances(!showBalances)}
                    className="text-gray-500 hover:text-gray-900"
                  >
                    {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-gray-600 text-sm mt-3">Saldo Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {showBalances ? formatCurrency(totalBalance) : '••••••'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-5">
                <div className="p-2 rounded-lg bg-green-500/10 w-fit">
                  <Building2 className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-gray-600 text-sm mt-3">Contas Ativas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {accounts.filter(a => a.is_active).length}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="p-5 flex items-center justify-center">
                <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={resetAccountForm}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Conta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border-gray-200">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900">
                        {editingAccount ? 'Editar Conta' : 'Nova Conta Bancária'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-700">Nome da Conta</Label>
                          <Input
                            value={accountForm.name}
                            onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                            placeholder="Ex: Conta Principal"
                            className="bg-white border-gray-200 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700">Banco</Label>
                          <Input
                            value={accountForm.bank_name}
                            onChange={(e) => setAccountForm({ ...accountForm, bank_name: e.target.value })}
                            placeholder="Ex: Banco do Brasil"
                            className="bg-white border-gray-200 mt-1"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-700">Agência</Label>
                          <Input
                            value={accountForm.agency}
                            onChange={(e) => setAccountForm({ ...accountForm, agency: e.target.value })}
                            placeholder="0000"
                            className="bg-white border-gray-200 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700">Número da Conta</Label>
                          <Input
                            value={accountForm.account_number}
                            onChange={(e) => setAccountForm({ ...accountForm, account_number: e.target.value })}
                            placeholder="00000-0"
                            className="bg-white border-gray-200 mt-1"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-700">Tipo</Label>
                          <Select
                            value={accountForm.account_type}
                            onValueChange={(v: any) => setAccountForm({ ...accountForm, account_type: v })}
                          >
                            <SelectTrigger className="bg-white border-gray-200 mt-1 w-full">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200 z-[10000]">
                              <SelectItem value="checking">Conta Corrente</SelectItem>
                              <SelectItem value="savings">Poupança</SelectItem>
                              <SelectItem value="investment">Investimento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-gray-700">Saldo Atual</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={accountForm.balance}
                            onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
                            placeholder="0,00"
                            className="bg-white border-gray-200 mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-700">Cor de Identificação</Label>
                        <div className="flex gap-2 mt-2">
                          {BANK_COLORS.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => setAccountForm({ ...accountForm, color: color.value })}
                              className={cn(
                                "w-8 h-8 rounded-full transition-all",
                                accountForm.color === color.value && "ring-2 ring-white ring-offset-2 ring-offset-white"
                              )}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAccountDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveAccount} className="bg-blue-600 hover:bg-blue-700">
                        {editingAccount ? 'Atualizar' : 'Criar Conta'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Contas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <Card 
                key={account.id} 
                className="bg-white border-gray-200 hover:border-blue-500/30 transition-all overflow-hidden"
              >
                <div 
                  className="h-1.5" 
                  style={{ backgroundColor: account.color }}
                />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${account.color}20` }}
                      >
                        <Building2 className="h-5 w-5" style={{ color: account.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{account.name}</h3>
                        <p className="text-sm text-gray-600">{account.bank_name}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => editAccount(account)}>
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteAccount(account.id)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Ag: {account.agency} • Cc: {account.account_number}</p>
                    <p className="text-xl font-bold text-gray-900 mt-2">
                      {showBalances ? formatCurrency(account.balance) : '••••••'}
                    </p>
                    <Badge 
                      className="mt-2"
                      variant="outline"
                      style={{ 
                        borderColor: `${account.color}50`,
                        color: account.color,
                      }}
                    >
                      {account.account_type === 'checking' && 'Conta Corrente'}
                      {account.account_type === 'savings' && 'Poupança'}
                      {account.account_type === 'investment' && 'Investimento'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {accounts.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 text-gray-600">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma conta cadastrada</p>
                <p className="text-sm mt-1">Adicione sua primeira conta bancária</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Aba Fornecedores */}
        <TabsContent value="suppliers" className="space-y-6 mt-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
              <Input
                placeholder="Buscar fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200"
              />
            </div>
            <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetSupplierForm} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Fornecedor
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-gray-200 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">
                    {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label className="text-gray-700">Nome / Razão Social</Label>
                      <Input
                        value={supplierForm.name}
                        onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                        placeholder="Nome do fornecedor"
                        className="bg-white border-gray-200 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Tipo de Documento</Label>
                      <Select
                        value={supplierForm.document_type}
                        onValueChange={(v: any) => setSupplierForm({ ...supplierForm, document_type: v })}
                      >
                        <SelectTrigger className="bg-white border-gray-200 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 z-[10000]">
                          <SelectItem value="cnpj">CNPJ</SelectItem>
                          <SelectItem value="cpf">CPF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-700">{supplierForm.document_type.toUpperCase()}</Label>
                      <Input
                        value={supplierForm.document}
                        onChange={(e) => setSupplierForm({ ...supplierForm, document: e.target.value })}
                        placeholder={supplierForm.document_type === 'cnpj' ? '00.000.000/0000-00' : '000.000.000-00'}
                        className="bg-white border-gray-200 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Email</Label>
                      <Input
                        type="email"
                        value={supplierForm.email}
                        onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                        placeholder="email@fornecedor.com"
                        className="bg-white border-gray-200 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Telefone</Label>
                      <Input
                        value={supplierForm.phone}
                        onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                        placeholder="(00) 00000-0000"
                        className="bg-white border-gray-200 mt-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-gray-700">Categoria</Label>
                      <Select
                        value={supplierForm.category}
                        onValueChange={(v) => setSupplierForm({ ...supplierForm, category: v })}
                      >
                        <SelectTrigger className="bg-white border-gray-200 mt-1">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 z-[10000]">
                          {SUPPLIER_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-gray-700">Endereço</Label>
                      <Input
                        value={supplierForm.address}
                        onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                        placeholder="Endereço completo"
                        className="bg-white border-gray-200 mt-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-gray-700">Observações</Label>
                      <Input
                        value={supplierForm.notes}
                        onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                        placeholder="Notas adicionais"
                        className="bg-white border-gray-200 mt-1"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSupplierDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveSupplier} className="bg-blue-600 hover:bg-blue-700">
                    {editingSupplier ? 'Atualizar' : 'Criar Fornecedor'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de Fornecedores */}
          <Card className="bg-white border-gray-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Fornecedor</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Documento</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Categoria</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Contato</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Total Pago</th>
                      <th className="text-right p-4 text-sm font-medium text-gray-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="border-b border-gray-200 hover:bg-white">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-gray-900">{supplier.name}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="border-gray-200 text-gray-700">
                            {supplier.document_type.toUpperCase()}: {supplier.document}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-700">{supplier.category || '-'}</span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <p className="text-gray-700">{supplier.email || '-'}</p>
                            <p className="text-gray-500">{supplier.phone || '-'}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-gray-900">
                            {formatCurrency(supplier.total_paid || 0)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => editSupplier(supplier)}>
                              <Edit className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteSupplier(supplier.id)}>
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSuppliers.length === 0 && !loading && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-gray-600">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhum fornecedor encontrado</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

