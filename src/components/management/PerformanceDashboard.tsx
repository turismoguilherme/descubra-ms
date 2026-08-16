
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PerformanceMetric } from "@/types/management";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { MessageCircle, Send } from "lucide-react";

interface PerformanceDashboardProps {
  region: string;
}

// Tourism Regions and Cities of Mato Grosso do Sul
export const msRegions = {
  "all": "Todas as Regiões",
  "caminhos-da-natureza": "Caminhos da Natureza/Cone Sul",
  "bonito-serra-da-bodoquena": "Bonito/Serra da Bodoquena",
  "caminho-dos-ipes": "Caminho dos Ipês",
  "caminhos-da-fronteira": "Caminhos da Fronteira",
  "costa-leste": "Costa Leste",
  "grande-dourados": "Grande Dourados",
  "pantanal": "Pantanal",
  "rota-norte": "Rota Norte",
  "vale-das-aguas": "Vale das Águas",
  "vale-do-apore": "Vale do Aporé"
};

export const msCities: Record<string, string[]> = {
  "caminhos-da-natureza": [
    "Itaquiraí", "Eldorado", "Naviraí", "Mundo Novo", "Juti", "Japorã"
  ],
  "bonito-serra-da-bodoquena": [
    "Bonito", "Bodoquena", "Jardim", "Porto Murtinho", "Caracol", 
    "Bela Vista", "Nioaque", "Guia Lopes da Laguna"
  ],
  "caminho-dos-ipes": [
    "Campo Grande", "Corguinho", "Dois Irmãos do Buriti", "Jaraguari", 
    "Nova Alvorada do Sul", "Ribas do Rio Pardo", "Rio Negro", "Rochedo", "Terenos"
  ],
  "caminhos-da-fronteira": [
    "Ponta Porã", "Antônio João", "Aral Moreira"
  ],
  "costa-leste": [
    "Três Lagoas", "Água Clara", "Brasilândia", "Inocência", 
    "Paranaíba", "Santa Rita do Pardo", "Selvíria"
  ],
  "grande-dourados": [
    "Dourados", "Itaporã", "Maracaju", "Rio Brilhante"
  ],
  "pantanal": [
    "Corumbá", "Ladário", "Aquidauana", "Anastácio", "Miranda"
  ],
  "rota-norte": [
    "Alcinópolis", "Camapuã", "Coxim", "Figueirão", "Pedro Gomes", 
    "Rio Verde de Mato Grosso", "São Gabriel do Oeste", "Sonora", 
    "Costa Rica", "Paraíso das Águas", "Chapadão do Sul"
  ],
  "vale-das-aguas": [
    "Sidrolândia", "Bandeirantes", "Anaurilândia", "Bataguassu"
  ],
  "vale-do-apore": [
    "Cassilândia", "Aparecida do Taboado", "Chapadão do Céu"
  ],
  "all": [] // All cities will be populated later if needed
};

// Mock data - in a real app this would come from an API
const mockPerformanceData: Record<string, PerformanceMetric[]> = {
  "all": [
    { regionId: "caminho-dos-ipes", name: "Visitantes", value: 1200, previousValue: 1050, change: 14.3 },
    { regionId: "pantanal", name: "Visitantes", value: 2500, previousValue: 2200, change: 13.6 },
    { regionId: "bonito-serra-da-bodoquena", name: "Visitantes", value: 3100, previousValue: 2800, change: 10.7 },
    { regionId: "caminhos-da-natureza", name: "Visitantes", value: 800, previousValue: 700, change: 14.3 },
    { regionId: "costa-leste", name: "Visitantes", value: 500, previousValue: 450, change: 11.1 },
  ],
  // Add more specific regions as needed
};

// Mock interest data
const mockInterestData: Record<string, Record<string, number>> = {
  "all": {
    "Natureza": 45,
    "Cultura": 25,
    "Gastronomia": 20,
    "Eventos": 10
  },
  "caminho-dos-ipes": {
    "Cultura": 40,
    "Gastronomia": 35,
    "Natureza": 15,
    "Eventos": 10
  },
  "pantanal": {
    "Natureza": 65,
    "Gastronomia": 15,
    "Cultura": 10,
    "Eventos": 10
  },
  "bonito-serra-da-bodoquena": {
    "Natureza": 70,
    "Cultura": 5,
    "Gastronomia": 15,
    "Eventos": 10
  }
};

// Mock tourist origin data
const mockOriginData: Record<string, Array<{ state: string; count: number }>> = {
  "all": [
    { state: "SP", count: 35 },
    { state: "PR", count: 15 },
    { state: "RJ", count: 12 },
    { state: "MS", count: 10 },
    { state: "Outros", count: 28 }
  ],
  "caminho-dos-ipes": [
    { state: "MS", count: 25 },
    { state: "SP", count: 20 },
    { state: "PR", count: 15 },
    { state: "MT", count: 10 },
    { state: "Outros", count: 30 }
  ],
  "pantanal": [
    { state: "SP", count: 40 },
    { state: "RJ", count: 15 },
    { state: "PR", count: 10 },
    { state: "MS", count: 10 },
    { state: "Outros", count: 25 }
  ],
  "bonito-serra-da-bodoquena": [
    { state: "SP", count: 45 },
    { state: "PR", count: 15 },
    { state: "RJ", count: 15 },
    { state: "MS", count: 5 },
    { state: "Outros", count: 20 }
  ]
};

// Monthly visitor data for charts
const mockMonthlyData = [
  { name: 'Jan', visitantes: 4000 },
  { name: 'Fev', visitantes: 3000 },
  { name: 'Mar', visitantes: 2000 },
  { name: 'Abr', visitantes: 2780 },
  { name: 'Mai', visitantes: 1890 },
  { name: 'Jun', visitantes: 2390 },
  { name: 'Jul', visitantes: 3490 },
  { name: 'Ago', visitantes: 3200 },
  { name: 'Set', visitantes: 2800 },
  { name: 'Out', visitantes: 2500 },
  { name: 'Nov', visitantes: 2200 },
  { name: 'Dez', visitantes: 3800 },
];

// Mock conversation with AI
const mockAIConversation = [
  {
    id: '1',
    question: "Por que sugeriu um festival gastronômico no Mercado Municipal?",
    answer: "O Mercado Municipal tem baixa visitação (15% dos check-ins em Campo Grande, segundo o app). Um festival gastronômico pode atrair turistas interessados em Gastronomia (20% dos usuários do app), conforme dados do Lovable."
  },
  {
    id: '2',
    question: "Qual a razão para focar em ecoturismo no Pantanal?",
    answer: "65% dos turistas que visitam o Pantanal têm interesse em Natureza. Além disso, dados mostram que turistas de São Paulo (40% dos visitantes desta região) buscam principalmente experiências de ecoturismo sustentável."
  }
];

// Colors for charts
const COLORS = ['#003087', '#2E7D32', '#FFC107', '#D32F2F'];

const PerformanceDashboard = ({ region }: PerformanceDashboardProps) => {
  const [question, setQuestion] = useState("");
  const [conversations, setConversations] = useState(mockAIConversation);

  // Get data based on selected region
  const performanceData = mockPerformanceData[region] || mockPerformanceData["all"];
  const interestData = mockInterestData[region] || mockInterestData["all"];
  const originData = mockOriginData[region] || mockOriginData["all"];
  
  // Transform interest data for pie chart
  const pieData = Object.entries(interestData).map(([name, value]) => ({
    name,
    value
  }));

  // Handle submit question to AI
  const handleSubmitQuestion = () => {
    if (!question.trim()) return;
    
    // In a real app, this would send the question to an API and get a response
    const newConversation = {
      id: `${conversations.length + 1}`,
      question,
      answer: `Baseado nos dados coletados para a região ${msRegions[region as keyof typeof msRegions] || "todas as regiões"}, esta sugestão foi feita porque observamos padrões de interesse em ${Object.keys(interestData)[0]} (${Object.values(interestData)[0]}%) entre os visitantes, principalmente vindos de ${originData[0].state}.`
    };
    
    setConversations([...conversations, newConversation]);
    setQuestion("");
  };

  return (
    <div className="space-y-6">
      {/* Regional Performance */}
      <section>
        <h3 className="text-lg font-medium mb-4">Desempenho por Região</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {performanceData.map((metric) => (
            <Card key={metric.regionId} className="p-4">
              <div>
                <h4 className="font-medium">{msRegions[metric.regionId as keyof typeof msRegions] || metric.regionId}</h4>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <span className={`text-sm ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change >= 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-ms-primary-blue h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (metric.value / 3500) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Interests and Origin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tourist Interests */}
        <section>
          <h3 className="text-lg font-medium mb-4">Interesses dos Turistas</h3>
          <Card className="p-4">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </section>

        {/* Tourist Origin */}
        <section>
          <h3 className="text-lg font-medium mb-4">Origem dos Turistas</h3>
          <Card className="p-4">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={originData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="state" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="count" fill="#003087" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </section>
      </div>

      {/* Charts */}
      <section>
        <h3 className="text-lg font-medium mb-4">Evolução Temporal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="visitantes" fill="#003087" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-4">
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Gráfico de interesses ao longo do ano</p>
            </div>
          </Card>
        </div>
      </section>

      {/* AI Conversation */}
      <section>
        <h3 className="text-lg font-medium mb-4">Conversa com a IA</h3>
        <Card className="p-4">
          <div className="space-y-4">
            <div className="max-h-80 overflow-y-auto space-y-4">
              {conversations.map((conv) => (
                <div key={conv.id} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-gray-800">{conv.question}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 justify-end">
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                      <p className="text-gray-800">{conv.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-4">
              <Input 
                placeholder="Pergunte à IA sobre as sugestões..." 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitQuestion()}
              />
              <Button onClick={handleSubmitQuestion} className="bg-[#003087]">
                <Send size={18} />
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default PerformanceDashboard;
