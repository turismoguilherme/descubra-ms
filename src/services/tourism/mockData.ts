
import { TourismData } from "@/types/tourism";

export const mockData: Omit<TourismData, 'source' | 'lastUpdate'> = {
  visitors: 150000,
  revenue: 45000000,
  totalVisitors: 150000,
  growthRate: 12.5,
  regionsCount: 10,
  citiesCount: 79,
  hotspots: ["Bonito", "Pantanal", "Campo Grande", "Corumbá", "Aquidauana"],
  interests: ["Ecoturismo", "Turismo Rural", "Pesca Esportiva", "Turismo Cultural", "Aventura"],
  origins: {
    "São Paulo": 35000,
    "Rio de Janeiro": 20000,
    "Minas Gerais": 18000,
    "Paraná": 15000,
    "Goiás": 12000,
    "Outros": 50000
  },
  trends: [
    { month: "Jan", visitors: 12000, revenue: 3600000 },
    { month: "Fev", visitors: 11000, revenue: 3300000 },
    { month: "Mar", visitors: 13500, revenue: 4050000 },
    { month: "Abr", visitors: 14000, revenue: 4200000 },
    { month: "Mai", visitors: 12500, revenue: 3750000 },
    { month: "Jun", visitors: 11800, revenue: 3540000 },
    { month: "Jul", visitors: 15000, revenue: 4500000 },
    { month: "Ago", visitors: 14500, revenue: 4350000 },
    { month: "Set", visitors: 13000, revenue: 3900000 },
    { month: "Out", visitors: 13200, revenue: 3960000 },
    { month: "Nov", visitors: 12800, revenue: 3840000 },
    { month: "Dez", visitors: 16700, revenue: 5010000 }
  ],
  demographics: {
    ageGroups: {
      "18-25": 20000,
      "26-35": 45000,
      "36-50": 50000,
      "51-65": 30000,
      "65+": 5000
    },
    origins: {
      "São Paulo": 35000,
      "Rio de Janeiro": 20000,
      "Minas Gerais": 18000,
      "Paraná": 15000,
      "Goiás": 12000,
      "Outros": 50000
    }
  },
  events: [
    { name: "Festival de Inverno de Bonito", date: "2024-07-15", attendance: 15000 },
    { name: "Pantanal Extreme", date: "2024-08-20", attendance: 8000 },
    { name: "Festival do Pintado", date: "2024-09-10", attendance: 12000 },
    { name: "Feira do Turismo Rural", date: "2024-10-05", attendance: 6000 }
  ],
  regions: [
    {
      id: "pantanal",
      name: "Pantanal",
      visitors: 45000,
      growth: 15.2,
      coordinates: [-19.5, -56.6],
      color: "#10b981",
      density: 75.5
    },
    {
      id: "bonito",
      name: "Bonito/Serra da Bodoquena",
      visitors: 55000,
      growth: 18.7,
      coordinates: [-21.1, -56.5],
      color: "#3b82f6",
      density: 89.2
    },
    {
      id: "campo-grande",
      name: "Campo Grande e Região",
      visitors: 35000,
      growth: 8.3,
      coordinates: [-20.4, -54.6],
      color: "#f59e0b",
      density: 62.1
    },
    {
      id: "corumba",
      name: "Corumbá",
      visitors: 15000,
      growth: 22.1,
      coordinates: [-19.0, -57.7],
      color: "#ef4444",
      density: 45.8
    }
  ],
  cadasturServices: [
    { name: "Hotéis", count: 245, type: "accommodation" },
    { name: "Pousadas", count: 180, type: "accommodation" },
    { name: "Agências de Turismo", count: 95, type: "service" },
    { name: "Guias de Turismo", count: 156, type: "service" },
    { name: "Transportadoras", count: 78, type: "transport" }
  ]
};
