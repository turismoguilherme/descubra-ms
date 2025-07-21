export const testUsers = {
  masterAdmin: {
    email: 'master@flowtrip.ai',
    password: 'Test@123',
    profile: {
      role: 'master_admin',
      full_name: 'Admin Master',
      permissions: ['all']
    }
  },
  stateAdmin: {
    email: 'admin.ms@turismo.ms.gov.br',
    password: 'Test@123',
    profile: {
      role: 'state_admin',
      full_name: 'Admin MS',
      region_id: 'ms',
      permissions: ['state_management']
    }
  },
  cityAdmin: {
    email: 'admin.cg@turismo.ms.gov.br',
    password: 'Test@123',
    profile: {
      role: 'city_admin',
      full_name: 'Admin Campo Grande',
      region_id: 'ms',
      city_id: 'campo_grande',
      permissions: ['city_management']
    }
  },
  catAttendant: {
    email: 'cat.central@turismo.ms.gov.br',
    password: 'Test@123',
    profile: {
      role: 'cat_attendant',
      full_name: 'Atendente CAT Central',
      region_id: 'ms',
      city_id: 'campo_grande',
      cat_id: 'cat_central',
      permissions: ['cat_attendance']
    }
  },
  collaborator: {
    email: 'guia@turismo.ms.gov.br',
    password: 'Test@123',
    profile: {
      role: 'collaborator',
      full_name: 'Guia Turístico',
      region_id: 'ms',
      city_id: 'campo_grande',
      permissions: ['content_creation']
    }
  },
  regularUser: {
    email: 'usuario@email.com',
    password: 'Test@123',
    profile: {
      role: 'user',
      full_name: 'Usuário Regular',
      permissions: ['basic']
    }
  }
}; 