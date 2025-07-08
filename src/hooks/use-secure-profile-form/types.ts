
export interface FieldErrors {
  fullName?: string;
  userType?: string;
  occupation?: string;
  birthDate?: string;
  gender?: string;
  sexualityIdentity?: string;
  wantsToCollaborate?: string;
  country?: string;
  state?: string;
  city?: string;
  travelOrganization?: string;
  stayDuration?: string;
  travelMotives?: string;
  residenceCity?: string;
  neighborhood?: string;
  timeInCity?: string;
}

export interface ProfileFormData {
  fullName: string;
  userType: string;
  occupation: string;
  birthDate: string;
  gender: string;
  sexualityIdentity: string;
  wantsToCollaborate: boolean | null;
  country: string;
  state: string;
  city: string;
  travelOrganization: string;
  customTravelOrganization: string;
  stayDuration: string;
  travelMotives: string[];
  otherMotive: string;
  residenceCity: string;
  neighborhood: string;
  customNeighborhood: string;
  timeInCity: string;
}
