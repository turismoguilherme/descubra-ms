
import React from "react";
import { MapPin, Info, Camera, Utensils, Hotel, Landmark, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Destination {
  id: number;
  nome: string;
  regiao: string;
  lat: number;
  lng: number;
}

interface CAT {
  id: number;
  nome: string;
  endereco: string;
  horario: string;
  coordenadas: { lat: number; lng: number };
  cidade: string;
  regiao: string;
}

interface RegionInfoProps {
  selectedRegion: string;
  filteredDestinations: Destination[];
  filteredCats: CAT[];
}

// Mock attractions data - in a real app, this would come from an API or database
const mockAttractions = {
  "Pantanal": [
    { name: "Estrada Parque", type: "Ecoturismo", image: "https://source.unsplash.com/random/300x200/?wetland" },
    { name: "Fazenda São João", type: "Rural", image: "https://source.unsplash.com/random/300x200/?farm" }
  ],
  "Bonito/Serra da Bodoquena": [
    { name: "Gruta do Lago Azul", type: "Ecoturismo", image: "https://source.unsplash.com/random/300x200/?cave" },
    { name: "Rio da Prata", type: "Aventura", image: "https://source.unsplash.com/random/300x200/?river" }
  ],
  "Campo Grande e Região": [
    { name: "Parque das Nações Indígenas", type: "Cultural", image: "https://source.unsplash.com/random/300x200/?park" },
    { name: "Feira Central", type: "Gastronomia", image: "https://source.unsplash.com/random/300x200/?market" }
  ],
  "Corumbá": [
    { name: "Porto Geral", type: "Cultural", image: "https://source.unsplash.com/random/300x200/?port" },
    { name: "Forte Coimbra", type: "Histórico", image: "https://source.unsplash.com/random/300x200/?fort" }
  ]
};

// Mock region descriptions
const regionDescriptions = {
  "Pantanal": "A maior planície alagável do mundo, o Pantanal é um paraíso para observação de fauna e experiências de ecoturismo únicas.",
  "Bonito/Serra da Bodoquena": "Conhecida por suas águas cristalinas e grutas espetaculares, Bonito é um destino imperdível para os amantes da natureza.",
  "Campo Grande e Região": "A capital do estado combina charme urbano com cultura regional, eventos e gastronomia diversificada.",
  "Corumbá": "Portal de entrada para o Pantanal norte, com rica história fronteiriça e patrimônio cultural.",
  "Costa Leste": "Região de belos lagos e rios perfeitos para a prática de esportes aquáticos e pesca esportiva.",
  "Caminhos da Fronteira": "Destinos que combinam influências brasileiras e paraguaias, com compras e gastronomia típica da fronteira.",
  "Grande Dourados": "Polo econômico com agronegócio forte e turismo de negócios em desenvolvimento.",
  "Cerrado Pantanal": "Transição entre dois importantes biomas brasileiros, com cenários únicos.",
  "Cone Sul": "Região marcada pela diversidade cultural de colonizadores e belezas naturais pouco exploradas."
};

const RegionInfo = ({ 
  selectedRegion, 
  filteredDestinations,
  filteredCats 
}: RegionInfoProps) => {
  // Show toast when region changes
  React.useEffect(() => {
    if (selectedRegion !== "Todas") {
      toast.success(`Região selecionada: ${selectedRegion}`);
    }
  }, [selectedRegion]);
  
  if (selectedRegion === "Todas") {
    return null;
  }
  
  // Get region description or default message
  const regionDescription = regionDescriptions[selectedRegion as keyof typeof regionDescriptions] || 
    "Informações detalhadas sobre a região turística selecionada, incluindo principais atrações, infraestrutura e dados estatísticos.";
  
  // Get attractions for the selected region or empty array
  const attractions = mockAttractions[selectedRegion as keyof typeof mockAttractions] || [];
  
  return (
    <Card className="mt-6 p-6 shadow-md">
      <h3 className="text-xl font-semibold text-ms-primary-blue mb-3 flex items-center">
        <Info className="mr-2 text-ms-secondary-yellow" size={20} />
        {selectedRegion}
      </h3>
      
      <p className="text-gray-600 mb-4">
        {regionDescription}
      </p>
      
      <Tabs defaultValue="info" className="mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="attractions">Atrações</TabsTrigger>
          <TabsTrigger value="cities">Municípios</TabsTrigger>
          <TabsTrigger value="cats">CATs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <Landmark className="mr-2 text-ms-pantanal-green" size={16} />
                Sobre a Região
              </h4>
              <ul className="space-y-2 text-sm">
                <li>Municípios: <span className="font-medium">{filteredDestinations.length}</span></li>
                <li>CATs: <span className="font-medium">{filteredCats.length}</span></li>
                <li>Bioma predominante: <span className="font-medium">
                  {selectedRegion.includes("Pantanal") ? "Pantanal" : 
                   selectedRegion.includes("Cerrado") ? "Cerrado" : "Misto"}
                </span></li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <Camera className="mr-2 text-ms-rivers-blue" size={16} />
                Experiências
              </h4>
              <ul className="space-y-1 text-sm">
                {selectedRegion === "Pantanal" && (
                  <>
                    <li>• Observação de fauna</li>
                    <li>• Passeios de barco</li>
                    <li>• Pesca esportiva</li>
                    <li>• Safári fotográfico</li>
                  </>
                )}
                {selectedRegion === "Bonito/Serra da Bodoquena" && (
                  <>
                    <li>• Flutuação em rios cristalinos</li>
                    <li>• Visitação a grutas</li>
                    <li>• Trilhas ecológicas</li>
                    <li>• Cachoeiras</li>
                  </>
                )}
                {selectedRegion === "Campo Grande e Região" && (
                  <>
                    <li>• Turismo cultural e urbano</li>
                    <li>• Gastronomia regional</li>
                    <li>• Eventos e shows</li>
                    <li>• Compras</li>
                  </>
                )}
                {selectedRegion !== "Pantanal" && 
                 selectedRegion !== "Bonito/Serra da Bodoquena" && 
                 selectedRegion !== "Campo Grande e Região" && (
                  <>
                    <li>• Ecoturismo</li>
                    <li>• Turismo histórico</li>
                    <li>• Gastronomia local</li>
                    <li>• Turismo de aventura</li>
                  </>
                )}
              </ul>
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <Link to={`/destinos?regiao=${encodeURIComponent(selectedRegion)}`}>
              <Button className="flex items-center gap-2">
                Explorar todos os destinos 
                <ExternalLink size={16} />
              </Button>
            </Link>
          </div>
        </TabsContent>
        
        <TabsContent value="attractions" className="mt-4">
          {attractions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {attractions.map((attraction, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="h-40 overflow-hidden">
                    <img src={attraction.image} alt={attraction.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <h5 className="font-medium">{attraction.name}</h5>
                    <span className="text-xs px-2 py-1 bg-ms-pantanal-green/20 text-ms-pantanal-green rounded-full">
                      {attraction.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma atração cadastrada para esta região.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="cities" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filteredDestinations.map((destino) => (
              <div key={destino.id} className="bg-gray-50 rounded p-3 flex items-center">
                <MapPin size={16} className="text-ms-pantanal-green mr-2 flex-shrink-0" />
                <span className="text-sm">{destino.nome}</span>
              </div>
            ))}
          </div>
          {filteredDestinations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum município cadastrado para esta região.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="cats" className="mt-4">
          <div className="divide-y">
            {filteredCats.map((cat) => (
              <div key={cat.id} className="py-3">
                <h5 className="font-medium flex items-center">
                  <MapPin size={16} className="text-ms-secondary-yellow mr-1" />
                  {cat.nome}
                </h5>
                <div className="ml-6 text-sm text-gray-600">
                  <p>{cat.endereco}, {cat.cidade}</p>
                  <p className="text-xs mt-1">{cat.horario}</p>
                </div>
              </div>
            ))}
          </div>
          {filteredCats.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum CAT cadastrado para esta região.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default RegionInfo;
