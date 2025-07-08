
import { FieldErrors, ProfileFormData } from './types';

export const validateProfileForm = (data: ProfileFormData): FieldErrors => {
  const errors: FieldErrors = {};
  const {
    fullName,
    userType,
    wantsToCollaborate,
    occupation,
    birthDate,
    gender,
    sexualityIdentity,
    country,
    state,
    city,
    travelOrganization,
    customTravelOrganization,
    stayDuration,
    travelMotives,
    otherMotive,
    residenceCity,
    neighborhood,
    customNeighborhood,
    timeInCity,
  } = data;

  // Nome obrigatório
  if (!fullName || !fullName.trim()) {
    errors.fullName = "Por favor, preencha seu nome completo.";
  }

  // Tipo de usuário obrigatório
  if (!userType) {
    errors.userType = "Por favor, selecione se é Turista ou Morador.";
  }

  // Morador: colaborador é obrigatório
  if (userType === "morador" && (wantsToCollaborate === null || wantsToCollaborate === undefined)) {
    errors.wantsToCollaborate = "Por favor, responda se deseja colaborar com sugestões.";
  }

  // Campos comuns (só valida se o tipo de usuário foi selecionado)
  if (userType) {
    if (!occupation || !occupation.trim()) {
      errors.occupation = "Profissão obrigatória.";
    }
    if (!birthDate) {
      errors.birthDate = "Data de nascimento obrigatória.";
    }
    if (!gender) {
      errors.gender = "Selecione seu gênero.";
    }
    if (!sexualityIdentity) {
      errors.sexualityIdentity = "Selecione sua identidade sexual.";
    }
  }
  
  // Turista
  if (userType === "turista") {
    if (!country) errors.country = "País é obrigatório.";
    if (!state) errors.state = "Estado é obrigatório.";
    if (!city) errors.city = "Cidade é obrigatória.";
    if (!travelOrganization && !customTravelOrganization)
      errors.travelOrganization = "Organização da viagem obrigatória.";
    if (!stayDuration) errors.stayDuration = "Duração da estadia obrigatória.";
    if (travelMotives.length === 0 && !otherMotive)
      errors.travelMotives = "Pelo menos um motivo da viagem é obrigatório.";
  }

  // Morador
  if (userType === "morador") {
    if (!residenceCity) errors.residenceCity = "Cidade de residência é obrigatória.";
    if (!neighborhood && !customNeighborhood)
      errors.neighborhood = "Bairro obrigatório.";
    if (!timeInCity) errors.timeInCity = "Tempo de moradia obrigatório.";
  }

  return errors;
};
