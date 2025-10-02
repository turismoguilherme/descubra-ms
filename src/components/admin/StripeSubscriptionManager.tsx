import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Users, 
  DollarSign, 
  Calendar,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface Subscription {
  id: string;
  customer_id: string;
  customer_email?: string;
  customer_name?: string;
  status: string;
  current_period_end: number;
  amount: number;
  currency: string;
  plan_name?: string;
  created_at?: number;
}

interface CreateSubscriptionData {
  customer_email: string;
  customer_name: string;
  plan_name: string;
  amount: number;
  currency: string;
}

const StripeSubscriptionManager = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();

  // Estado para formulário de criação
  const [createForm, setCreateForm] = useState<CreateSubscriptionData>({
    customer_email: '',
    customer_name: '',
    plan_name: 'basic',
    amount: 2500,
    currency: 'brl'
  });

  // Planos disponíveis
  const plans = [
    { value: 'basic', label: 'Básico', price: 2500 },
    { value: 'professional', label: 'Profissional', price: 4500 },
    { value: 'enterprise', label: 'Enterprise', price: 8000 }
  ];

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      
      // Mock data para demonstração
      const mockSubscriptions: Subscription[] = [
        {
          id: 'sub_1234567890',
          customer_id: 'cus_1234567890',
          customer_email: 'secretaria.turismo@ms.gov.br',
          customer_name: 'Secretaria de Turismo MS',
          status: 'active',
          current_period_end: Date.now() + 30 * 24 * 60 * 60 * 1000,
          amount: 4500,
          currency: 'brl',
          plan_name: 'professional',
          created_at: Date.now() - 60 * 24 * 60 * 60 * 1000
        },
        {
          id: 'sub_0987654321',
          customer_id: 'cus_0987654321',
          customer_email: 'turismo@mt.gov.br',
          customer_name: 'Secretaria de Turismo MT',
          status: 'pending',
          current_period_end: Date.now() + 15 * 24 * 60 * 60 * 1000,
          amount: 2500,
          currency: 'brl',
          plan_name: 'basic',
          created_at: Date.now() - 15 * 24 * 60 * 60 * 1000
        }
      ];

      setSubscriptions(mockSubscriptions);
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as assinaturas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async () => {
    try {
      setCreating(true);
      
      // Simular criação de assinatura
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newSubscription: Subscription = {
        id: `sub_${Date.now()}`,
        customer_id: `cus_${Date.now()}`,
        customer_email: createForm.customer_email,
        customer_name: createForm.customer_name,
        status: 'active',
        current_period_end: Date.now() + 30 * 24 * 60 * 60 * 1000,
        amount: createForm.amount,
        currency: createForm.currency,
        plan_name: createForm.plan_name,
        created_at: Date.now()
      };

      setSubscriptions(prev => [newSubscription, ...prev]);
      setShowCreateForm(false);
      setCreateForm({
        customer_email: '',
        customer_name: '',
        plan_name: 'basic',
        amount: 2500,
        currency: 'brl'
      });

      toast({
        title: "Sucesso!",
        description: "Assinatura criada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a assinatura",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateSubscription = async (subscriptionId: string, updates: Partial<Subscription>) => {
    try {
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscriptionId ? { ...sub, ...updates } : sub
        )
      );

      toast({
        title: "Sucesso!",
        description: "Assinatura atualizada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a assinatura",
        variant: "destructive",
      });
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscriptionId ? { ...sub, status: 'cancelled' } : sub
        )
      );

      toast({
        title: "Sucesso!",
        description: "Assinatura cancelada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a assinatura",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      pending: "secondary",
      cancelled: "destructive",
      overdue: "destructive",
      trialing: "outline"
    };

    const icons: Record<string, React.ReactNode> = {
      active: <CheckCircle className="w-3 h-3 mr-1" />,
      pending: <AlertTriangle className="w-3 h-3 mr-1" />,
      cancelled: <XCircle className="w-3 h-3 mr-1" />,
      overdue: <XCircle className="w-3 h-3 mr-1" />,
      trialing: <Calendar className="w-3 h-3 mr-1" />
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {icons[status]}
        {status === 'active' ? 'Ativo' : 
         status === 'pending' ? 'Pendente' : 
         status === 'cancelled' ? 'Cancelado' : 
         status === 'overdue' ? 'Inadimplente' : 
         status === 'trialing' ? 'Teste' : status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Assinaturas Stripe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Carregando assinaturas...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Assinaturas</p>
                <p className="text-2xl font-bold">{subscriptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ativas</p>
                <p className="text-2xl font-bold">
                  {subscriptions.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    subscriptions
                      .filter(s => s.status === 'active')
                      .reduce((sum, s) => sum + s.amount, 0),
                    'brl'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Problemas</p>
                <p className="text-2xl font-bold">
                  {subscriptions.filter(s => ['overdue', 'cancelled'].includes(s.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão de Criar Nova Assinatura */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Assinaturas</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Assinatura
        </Button>
      </div>

      {/* Formulário de Criação */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_email">Email do Cliente</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={createForm.customer_email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, customer_email: e.target.value }))}
                  placeholder="cliente@estado.gov.br"
                />
              </div>

              <div>
                <Label htmlFor="customer_name">Nome do Cliente</Label>
                <Input
                  id="customer_name"
                  value={createForm.customer_name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, customer_name: e.target.value }))}
                  placeholder="Secretaria de Turismo"
                />
              </div>

              <div>
                <Label htmlFor="plan_name">Plano</Label>
                <Select
                  value={createForm.plan_name}
                  onValueChange={(value) => {
                    const plan = plans.find(p => p.value === value);
                    setCreateForm(prev => ({ 
                      ...prev, 
                      plan_name: value,
                      amount: plan?.price || 2500
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.value} value={plan.value}>
                        {plan.label} - {formatCurrency(plan.price * 100, 'brl')}/mês
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Valor (em centavos)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                  placeholder="2500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateSubscription} disabled={creating}>
                {creating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Assinatura'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Assinaturas */}
      <Card>
        <CardHeader>
          <CardTitle>Assinaturas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma assinatura encontrada
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-semibold">{subscription.customer_name}</p>
                          <p className="text-sm text-gray-600">{subscription.customer_email}</p>
                          <p className="text-xs text-gray-500">ID: {subscription.id}</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-lg">
                            {formatCurrency(subscription.amount, subscription.currency)}
                          </p>
                          <p className="text-xs text-gray-500">por mês</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      {getStatusBadge(subscription.status)}
                      
                      <div className="text-sm text-gray-600">
                        <p>Próximo pagamento: {formatDate(subscription.current_period_end)}</p>
                        <p>Plano: {subscription.plan_name}</p>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSubscription(subscription)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {subscription.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelSubscription(subscription.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes da Assinatura */}
      {selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Detalhes da Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Cliente</Label>
                  <p className="font-medium">{selectedSubscription.customer_name}</p>
                </div>
                
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedSubscription.customer_email}</p>
                </div>
                
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedSubscription.status)}</div>
                </div>
                
                <div>
                  <Label>Valor Mensal</Label>
                  <p className="font-medium text-lg">
                    {formatCurrency(selectedSubscription.amount, selectedSubscription.currency)}
                  </p>
                </div>
                
                <div>
                  <Label>Próximo Pagamento</Label>
                  <p className="font-medium">{formatDate(selectedSubscription.current_period_end)}</p>
                </div>
                
                <div>
                  <Label>Data de Criação</Label>
                  <p className="font-medium">
                    {selectedSubscription.created_at ? formatDate(selectedSubscription.created_at) : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => setSelectedSubscription(null)}>
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StripeSubscriptionManager;







