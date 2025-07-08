import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Save, Trash2, Edit, Search } from "lucide-react";

// Tipo para a base de conhecimento
type KnowledgeItem = {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  lastUpdated: string;
};

// Dados iniciais para demonstração
const initialKnowledgeBase: KnowledgeItem[] = [
  {
    id: "bonito",
    title: "Bonito",
    content: "Bonito é um dos principais destinos ecoturísticos do Brasil, conhecido por suas águas cristalinas, grutas e rica biodiversidade. Os passeios devem ser agendados com antecedência através de agências credenciadas.",
    category: "destinos",
    source: "Fundtur-MS",
    lastUpdated: "2025-05-01"
  },
  {
    id: "pantanal",
    title: "Pantanal",
    content: "O Pantanal é a maior planície alagável do planeta e abriga uma impressionante biodiversidade. A melhor época para visita é durante a seca (maio a setembro) quando a observação de animais é facilitada.",
    category: "destinos",
    source: "SETESC",
    lastUpdated: "2025-05-02"
  },
  {
    id: "documentos",
    title: "Documentação necessária",
    content: "Para brasileiros, é necessário documento oficial com foto (RG ou CNH) para hospedagem e alguns atrativos. Para estrangeiros, passaporte válido. Para países do Mercosul, é aceito o documento de identidade do país de origem.",
    category: "informações",
    source: "MTur",
    lastUpdated: "2025-04-15"
  },
  {
    id: "transporte",
    title: "Transporte",
    content: "Campo Grande possui aeroporto internacional. Bonito tem aeroporto regional com voos limitados. Para deslocamento entre cidades, há opções de ônibus intermunicipais ou aluguel de veículos.",
    category: "informações",
    source: "Prefeitura de Campo Grande",
    lastUpdated: "2025-04-20"
  },
  {
    id: "hospedagem",
    title: "Hospedagem",
    content: "O estado oferece opções de hospedagem para todos os perfis - desde hotéis de luxo a pousadas e hostels. Nas cidades de maior fluxo turístico como Bonito e Corumbá, é essencial reservar com antecedência, especialmente em alta temporada (dezembro a março e julho).",
    category: "informações",
    source: "Cadastur",
    lastUpdated: "2025-05-05"
  }
];

const KnowledgeBaseManager = () => {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>(initialKnowledgeBase);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const { toast } = useToast();

  // Nova entrada em branco para criar um novo item
  const emptyItem: KnowledgeItem = {
    id: "",
    title: "",
    content: "",
    category: "destinos",
    source: "",
    lastUpdated: new Date().toISOString().split("T")[0]
  };

  const categories = ["destinos", "informações", "eventos", "gastronomia", "atrações"];

  const filteredKnowledgeBase = knowledgeBase.filter(item => {
    // Filtrar por categoria se não estiver em "todos"
    if (activeTab !== "all" && item.category !== activeTab) {
      return false;
    }
    
    // Filtrar por termo de busca
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !item.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleSaveItem = () => {
    if (!editingItem) return;
    
    if (!editingItem.title || !editingItem.content) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e conteúdo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    // Gerando um ID baseado no título se for um novo item
    if (isCreating) {
      editingItem.id = editingItem.title.toLowerCase().replace(/[^a-z0-9]/g, "-");
    }
    
    // Atualizar ou adicionar o item
    if (isCreating) {
      setKnowledgeBase([...knowledgeBase, { ...editingItem }]);
      toast({ title: "Item criado com sucesso" });
    } else {
      setKnowledgeBase(knowledgeBase.map(item => 
        item.id === editingItem.id ? { ...editingItem } : item
      ));
      toast({ title: "Item atualizado com sucesso" });
    }
    
    // Resetar estado de edição
    setIsCreating(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    setKnowledgeBase(knowledgeBase.filter(item => item.id !== id));
    toast({ title: "Item removido com sucesso" });
    
    // Se estiver editando o item que está sendo excluído, resetar
    if (editingItem?.id === id) {
      setEditingItem(null);
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Base de Conhecimento da IA</h3>
        <Button 
          onClick={() => { setEditingItem({...emptyItem}); setIsCreating(true); }}
          className="bg-ms-primary-blue hover:bg-ms-primary-blue/90"
        >
          <Plus size={16} className="mr-2" />
          Novo Item
        </Button>
      </div>
      
      <div className="flex gap-4">
        <div className="w-1/3">
          <Card className="p-4">
            <div className="flex mb-4 relative">
              <Input
                placeholder="Buscar na base de conhecimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="destinos">Destinos</TabsTrigger>
                <TabsTrigger value="informações">Informações</TabsTrigger>
              </TabsList>
              
              <div className="max-h-[500px] overflow-y-auto pr-2">
                {filteredKnowledgeBase.length > 0 ? (
                  filteredKnowledgeBase.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-3 mb-2 border rounded-md cursor-pointer hover:bg-gray-50 ${editingItem?.id === item.id ? 'border-ms-primary-blue bg-blue-50' : ''}`}
                      onClick={() => { setEditingItem({...item}); setIsCreating(false); }}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{item.category}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.content}</p>
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                        <span>Fonte: {item.source}</span>
                        <span>Atualizado: {new Date(item.lastUpdated).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum item encontrado
                  </div>
                )}
              </div>
            </Tabs>
          </Card>
        </div>
        
        <div className="w-2/3">
          <Card className="p-4 h-full">
            {editingItem ? (
              <div className="space-y-4">
                <h3 className="font-medium text-lg">
                  {isCreating ? "Criar Novo Item" : "Editar Item"}
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                      placeholder="Título do item"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoria</label>
                    <select
                      className="w-full px-3 py-2 rounded-md border"
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Conteúdo</label>
                  <Textarea
                    value={editingItem.content}
                    onChange={(e) => setEditingItem({...editingItem, content: e.target.value})}
                    placeholder="Conteúdo detalhado do item"
                    className="min-h-[200px]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fonte</label>
                    <Input
                      value={editingItem.source}
                      onChange={(e) => setEditingItem({...editingItem, source: e.target.value})}
                      placeholder="Fonte da informação"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data da atualização</label>
                    <Input
                      type="date"
                      value={editingItem.lastUpdated}
                      onChange={(e) => setEditingItem({...editingItem, lastUpdated: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  {!isCreating && (
                    <Button 
                      variant="destructive" 
                      onClick={() => handleDeleteItem(editingItem.id)}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Excluir
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => { setEditingItem(null); setIsCreating(false); }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveItem}
                    className="bg-ms-primary-blue hover:bg-ms-primary-blue/90"
                  >
                    <Save size={16} className="mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
                <Edit size={48} className="mb-4 opacity-30" />
                <p>Selecione um item para editar ou clique em "Novo Item"</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseManager;
