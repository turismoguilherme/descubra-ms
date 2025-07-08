
// Mock data - in a real app this would come from an API
export const mockAttendants = [
  {
    id: "1",
    name: "Ana Souza",
    cat: "CAT Campo Grande",
    status: "active",
    lastCheckIn: "2025-05-10T08:15:00",
    lastCheckOut: null,
    coords: { lat: -20.4697, lng: -54.6201 },
    region: "Campo Grande"
  },
  {
    id: "2",
    name: "Pedro Alves",
    cat: "CAT Bonito",
    status: "active",
    lastCheckIn: "2025-05-10T09:00:00",
    lastCheckOut: null,
    coords: { lat: -21.1261, lng: -56.4514 },
    region: "Bonito"
  },
  {
    id: "3",
    name: "Carla Lima",
    cat: "CAT Corumbá",
    status: "inactive",
    lastCheckIn: "2025-05-09T08:30:00",
    lastCheckOut: "2025-05-09T17:00:00",
    coords: { lat: -19.0078, lng: -57.6506 },
    region: "Pantanal"
  },
  {
    id: "4",
    name: "João Silva",
    cat: "CAT Ponta Porã",
    status: "active",
    lastCheckIn: "2025-05-10T08:00:00",
    lastCheckOut: null,
    coords: { lat: -22.5296, lng: -55.7203 },
    region: "Ponta Porã"
  },
  {
    id: "5",
    name: "Maria Oliveira",
    cat: "CAT Dourados",
    status: "active",
    lastCheckIn: "2025-05-10T08:30:00",
    lastCheckOut: null,
    coords: { lat: -22.2210, lng: -54.8011 },
    region: "Dourados"
  }
];

// Coordenadas dos CATs
export const catLocations = {
  "CAT Campo Grande": { lat: -20.4697, lng: -54.6201 },
  "CAT Bonito": { lat: -21.1261, lng: -56.4514 },
  "CAT Corumbá": { lat: -19.0078, lng: -57.6506 },
  "CAT Dourados": { lat: -22.2210, lng: -54.8011 },
  "CAT Ponta Porã": { lat: -22.5296, lng: -55.7203 },
  "CAT Três Lagoas": { lat: -20.7913, lng: -51.7005 },
};

// Mock questions
export const mockQuestions = [
  {
    id: "1",
    question: "Quais são os horários do City Tour em Campo Grande?",
    answered: true,
    answer: "O City Tour em Campo Grande opera de terça a domingo, com saídas às 9h e 15h, partindo da Praça Ary Coelho."
  },
  {
    id: "2",
    question: "Como chegar ao Pantanal saindo de Bonito?",
    answered: true,
    answer: "De Bonito para o Pantanal, você pode seguir pela MS-345 até Miranda e de lá para a região pantaneira. O percurso é de aproximadamente 120km."
  },
  {
    id: "3",
    question: "Quais documentos são necessários para brasileiros visitarem a Bolívia?",
    answered: false,
    answer: null
  }
];
