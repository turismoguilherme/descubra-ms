
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTourismDataContext } from "@/context/TourismDataContext";
import { Skeleton } from "@/components/ui/skeleton";
import RegionMap from "./map/RegionMap";
import RegionChart from "./chart/RegionChart";
import MapLegend from "./map/MapLegend";
import { BarChart3, Map, MapPin, Compass } from "lucide-react";

const RegionHeatMapSection = () => {
  const [mapView, setMapView] = useState<"heatmap" | "chart">("heatmap");
  const { data, isLoading } = useTourismDataContext();
  const [mapboxToken, setMapboxToken] = useState<string>(localStorage.getItem('mapbox_token') || "");
  const [mapError, setMapError] = useState<boolean>(false);
  
  // Enhanced region data with proper coordinates and colors
  const enhancedRegions = data?.regions ? data.regions.map((region, index) => {
    // Assign proper coordinates for Mato Grosso do Sul regions
    const regionCoordinates = {
      "Pantanal": { lat: -18.5, lng: -56.5 },
      "Bonito": { lat: -21.1268, lng: -56.4844 },
      "Campo Grande": { lat: -20.4695, lng: -54.6201 },
      "Corumbá": { lat: -19.0094, lng: -57.6534 },
      "Costa Leste": { lat: -20.7849, lng: -51.7007 },
      "Caminhos da Fronteira": { lat: -22.5296, lng: -55.7203 },
      "Grande Dourados": { lat: -22.2230, lng: -54.8120 },
      "Cerrado Pantanal": { lat: -21.7, lng: -55.5 },
      "Cone Sul": { lat: -22.8, lng: -54.5 }
    };
    
    const coords = regionCoordinates[region.name as keyof typeof regionCoordinates] || 
                  { lat: -20.5 + (index * 0.5), lng: -55.0 + (index * 0.3) };
    
    return {
      ...region,
      lat: coords.lat,
      lng: coords.lng,
      // Assign colors based on density using MS official colors
      color: region.density > 0.7 ? '#2E7D32' : region.density > 0.4 ? '#003087' : '#D32F2F'
    };
  }) : [];
  
  // Log para debug detalhado
  useEffect(() => {
    console.log("Tourism Data Context:", data);
    console.log("Enhanced regions:", enhancedRegions);
    console.log("Region count:", enhancedRegions.length);
  }, [data, enhancedRegions]);
  
  // Save token to local storage when changed
  useEffect(() => {
    if (mapboxToken) {
      localStorage.setItem('mapbox_token', mapboxToken);
    }
  }, [mapboxToken]);

  const handleTokenSubmit = (token: string) => {
    setMapboxToken(token);
    setMapError(false);
  };
  
  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-ms-pantanal-green to-ms-primary-blue p-8 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-lg">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Carregando Mapa de Densidade Turística
              </h3>
              <p className="text-white/80 text-lg mt-1">Preparando dados das regiões do MS...</p>
            </div>
          </div>
          <Skeleton className="h-80 w-full mb-6 rounded-lg bg-white/20" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-12 w-full rounded-lg bg-white/20" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-12">
      {/* Hero Header com gradiente verde e azul do MS */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-ms-pantanal-green to-ms-primary-blue p-8 mb-6 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Compass className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">
              Densidade de Visitantes por Região
            </h3>
            <p className="text-white/80 text-lg">
              Explore o mapa turístico interativo do Mato Grosso do Sul
            </p>
          </div>
        </div>
      </div>

      {/* Main Content com design consistente */}
      <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
        <div className="p-6">
          <Tabs defaultValue="heatmap" className="w-full">
            <TabsList className="grid w-full max-w-xl mx-auto grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="heatmap" 
                onClick={() => setMapView("heatmap")}
                className="flex items-center gap-2 data-[state=active]:bg-ms-pantanal-green data-[state=active]:text-white data-[state=inactive]:text-gray-600 font-medium py-2 px-4 rounded-md transition-colors"
              >
                <Map size={20} />
                <span>Mapa de Calor</span>
              </TabsTrigger>
              <TabsTrigger 
                value="chart" 
                onClick={() => setMapView("chart")}
                className="flex items-center gap-2 data-[state=active]:bg-ms-primary-blue data-[state=active]:text-white data-[state=inactive]:text-gray-600 font-medium py-2 px-4 rounded-md transition-colors"
              >
                <BarChart3 size={20} />
                <span>Distribuição</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="heatmap" className="mt-0">
              <div className="bg-gray-50 rounded-lg border mb-6 overflow-hidden">
                <div className="aspect-video relative">
                  <RegionMap 
                    regions={enhancedRegions} 
                    mapboxToken={mapboxToken} 
                    onTokenSubmit={handleTokenSubmit}
                    mapError={mapError || !mapboxToken}
                  />
                </div>
              </div>
              <MapLegend />
            </TabsContent>
            
            <TabsContent value="chart" className="mt-0">
              <div className="bg-gray-50 border rounded-lg overflow-hidden">
                <div className="p-6">
                  {enhancedRegions && enhancedRegions.length > 0 ? (
                    <RegionChart regions={enhancedRegions} />
                  ) : (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center p-8 bg-white rounded-lg border">
                        <div className="text-4xl text-gray-300 mb-4">📊</div>
                        <h3 className="text-gray-700 font-bold text-xl mb-2">Preparando Visualização</h3>
                        <p className="text-gray-500">Os dados das regiões estão sendo carregados...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default RegionHeatMapSection;
