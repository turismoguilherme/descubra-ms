
export interface Attendant {
  id: string;
  name: string;
  cat: string;
  status: string;
  lastCheckIn: string | null;
  lastCheckOut: string | null;
  coords: { lat: number; lng: number };
  region: string;
  email?: string;
}

export interface Question {
  id: string;
  question: string;
  answered: boolean;
  answer: string | null;
}

export interface CatLocation {
  lat: number;
  lng: number;
}
