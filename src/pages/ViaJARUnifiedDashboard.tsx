import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Users, 
  Calendar, 
  Building2, 
  BarChart3,
  Plus,
  Eye,
  Edit,
  Trash2,
  Settings,
  Bell,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Target,
  Brain,
  Upload,
  FileText,
  Globe,
  Map
} from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import SecretaryDashboard from '@/components/secretary/SecretaryDashboard';
import AttendantDashboardRestored from '@/components/cat/AttendantDashboardRestored';
import PrivateDashboard from '@/pages/PrivateDashboard';

interface Attraction {
  id: string;
  name: string;
  status: 'active' | 'maintenance';
  type: string;
  visitors: number;
  location: string;
  description: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  status: 'active' | 'completed' | 'cancelled';
  attendees: number;
  description: string;
}

interface CAT {
  id: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  status: 'active' | 'inactive' | 'maintenance';
  attendants: number;
  visitors: number;
}

const attractions: Attraction[] = [
  { id: '1', name: 'Gruta do Lago Azul', status: 'active', type: 'Natural', visitors: 1250, location: 'Bonito, MS', description: 'Uma das mais belas grutas do Brasil' },
  { id: '2', name: 'Buraco das Araras', status: 'active', type: 'Natural', visitors: 890, location: 'Jardim, MS', description: 'Formação geológica única' },
  { id: '3', name: 'Aquário Natural', status: 'active', type: 'Aquático', visitors: 2100, location: 'Bonito, MS', description: 'Flutuação em águas cristalinas' },
  { id: '4', name: 'Museu de Bonito', status: 'active', type: 'Cultural', visitors: 340, location: 'Bonito, MS', description: 'História e cultura local' },
  { id: '5', name: 'Fazenda San Francisco', status: 'active', type: 'Rural', visitors: 560, location: 'Bodoquena, MS', description: 'Turismo rural e ecoturismo' },
  { id: '6', name: 'Parque das Cachoeiras', status: 'maintenance', type: 'Natural', visitors: 0, location: 'Bonito, MS', description: 'Em manutenção' }
];

const events: Event[] = [
  { id: '1', name: 'Festival de Inverno 2024', date: '2024-07-15', location: 'Praça Central', status: 'active', attendees: 500, description: 'Festival cultural com shows e gastronomia' },
  { id: '2', name: 'Semana do Turismo', date: '2024-09-27', location: 'Centro de Convenções', status: 'active', attendees: 200, description: 'Evento promocional do turismo local' },
  { id: '3', name: 'Feira de Artesanato', date: '2024-06-10', location: 'Feira Municipal', status: 'completed', attendees: 150, description: 'Exposição de artesanato local' }
];

const cats: CAT[] = [
  { id: '1', name: 'CAT Centro', location: 'Centro', address: 'Rua Principal, 123', phone: '(67) 99999-9999', email: 'cat.centro@bonito.ms.gov.br', workingHours: '08:00 - 18:00', status: 'active', attendants: 3, visitors: 450 },
  { id: '2', name: 'CAT Aeroporto', location: 'Aeroporto', address: 'Terminal de Passageiros', phone: '(67) 88888-8888', email: 'cat.aeroporto@bonito.ms.gov.br', workingHours: '06:00 - 22:00', status: 'active', attendants: 2, visitors: 320 },
  { id: '3', name: 'CAT Rodoviária', location: 'Rodoviária', address: 'Terminal Rodoviário', phone: '(67) 77777-7777', email: 'cat.rodoviaria@bonito.ms.gov.br', workingHours: '07:00 - 19:00', status: 'maintenance', attendants: 1, visitors: 180 }
];

export default function ViaJARUnifiedDashboard() {
  // Verificar se o AuthProvider está disponível
  let auth = null;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('ViaJARUnifiedDashboard: AuthProvider não disponível:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando sistema de autenticação...</p>
        </div>
      </div>
    );
  }
  
  const { user, userProfile } = auth;
  const { userRole } = useRoleBasedAccess();
  
  const [activeSection, setActiveSection] = useState('inventory');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<any>(null);
  const [deletingType, setDeletingType] = useState<'attraction' | 'event' | 'cat'>('attraction');
  
  // Estados para modais de adição/edição
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  // Detectar tipo de usuário
  const isSecretary = userRole === 'gestor_municipal';
  const isAttendant = userRole === 'atendente';
  const isPrivate = userRole === 'user';
  const isAdmin = userRole === 'admin';

  // Debug: Log do role do usuário
  console.log('🔍 DEBUG - userRole:', userRole);
  console.log('🔍 DEBUG - isSecretary:', isSecretary);

  // Se for secretária de turismo, mostrar dashboard específico
  if (isSecretary) {
    console.log('✅ Redirecionando para SecretaryDashboard');
    return <SecretaryDashboard />;
  }

  // Se for atendente, mostrar dashboard específico
  if (isAttendant) {
    return <AttendantDashboardRestored />;
  }

  // Se for usuário privado, mostrar dashboard específico
  if (isPrivate) {
    return <PrivateDashboard />;
  }

  // Dashboard padrão para admin ou outros usuários
    return (
      <div className="min-h-screen bg-gray-50">
        <ViaJARNavbar />
        
        {/* Header com gradiente azul-roxo */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white py-8">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center">
              <div>
              <h1 className="text-3xl font-bold">Dashboard ViaJAR</h1>
              <p className="text-blue-100 mt-2">Bem-vindo ao sistema unificado</p>
              </div>
              <div className="flex gap-4">
                <Button className="bg-blue-700 hover:bg-blue-800 text-white">
                  <Building2 className="h-4 w-4 mr-2" />
                Sistema Unificado
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

      <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
              <div className="text-2xl font-bold">1,234</div>
                      <p className="text-xs text-muted-foreground">
                +20% em relação ao mês anterior
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
              <div className="text-2xl font-bold">567</div>
                      <p className="text-xs text-muted-foreground">
                +12% em relação a ontem
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sistema Online</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
              <div className="text-2xl font-bold text-green-600">99.9%</div>
                      <p className="text-xs text-muted-foreground">
                Uptime nas últimas 24h
                      </p>
                    </CardContent>
                  </Card>
                </div>
        
        <div className="mt-8">
                <Card>
            <CardHeader>
              <CardTitle>Bem-vindo ao ViaJAR Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
              <p className="text-gray-600">
                Este é o dashboard unificado do sistema ViaJAR. 
                Selecione seu perfil de usuário para acessar funcionalidades específicas.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
    </div>
  );
}