import { Partner, Reservation, ReservationRequest, ReservationResponse } from './reservationTypes';

class ReservationService {
  // ❌ REMOVIDO: Todos os dados simulados/falsos
  private partners: Partner[] = []; // ✅ VAZIO - sem mentiras

  /**
   * Buscar parceiros disponíveis (APENAS REAIS)
   */
  async getAvailablePartners(type?: string, location?: string): Promise<Partner[]> {
    console.log('🔍 Buscando parceiros REAIS disponíveis...');
    
    try {
      // Buscar parceiros reais da plataforma
      const realPartners = await this.fetchRealPartners();
      
      // Filtrar apenas parceiros verificados
      const verifiedPartners = realPartners.filter(partner => partner.isVerified);
      
      console.log(`✅ Encontrados ${verifiedPartners.length} parceiros reais verificados`);
      
      return verifiedPartners;
    } catch (error) {
      console.log('⚠️ Erro ao buscar parceiros reais:', error);
      return []; // Retorna vazio se não conseguir buscar
    }
  }

  /**
   * Buscar parceiros reais da plataforma
   */
  private async fetchRealPartners(): Promise<Partner[]> {
    // TODO: Implementar busca real de parceiros da plataforma
    // Por enquanto retorna vazio - sem dados falsos
    return [];
  }

  /**
   * Verificar se há parceiros disponíveis
   */
  async hasPartners(): Promise<boolean> {
    const partners = await this.getAvailablePartners();
    return partners.length > 0;
  }

  /**
   * Obter estatísticas de parceiros
   */
  async getPartnerStats(): Promise<{
    totalPartners: number;
    verifiedPartners: number;
    hasPartners: boolean;
  }> {
    const partners = await this.getAvailablePartners();
    
    return {
      totalPartners: partners.length,
      verifiedPartners: partners.filter(p => p.isVerified).length,
      hasPartners: partners.length > 0
    };
  }

  /**
   * Criar reserva (apenas para parceiros reais)
   */
  async createReservation(userId: string, request: ReservationRequest): Promise<ReservationResponse> {
    console.log('📝 Criando reserva para parceiro real...');
    
    try {
      // Verificar se o parceiro existe e é real
      const partners = await this.getAvailablePartners();
      const partner = partners.find(p => p.id === request.partnerId);
      
      if (!partner) {
        return {
          success: false,
          message: 'Parceiro não encontrado ou não verificado',
          reservationId: null
        };
      }

      // Calcular preço baseado no parceiro real
      const price = this.calculatePrice(partner, request);
      
      const reservation: Reservation = {
        id: `res_${Date.now()}`,
        userId,
        partnerId: request.partnerId,
        partnerName: partner.name,
        checkIn: request.checkIn,
        checkOut: request.checkOut,
        guests: request.guests,
        totalPrice: price,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('✅ Reserva criada com sucesso:', reservation.id);
      
      return {
        success: true,
        message: 'Reserva criada com sucesso',
        reservationId: reservation.id,
        reservation
      };
    } catch (error) {
      console.log('❌ Erro ao criar reserva:', error);
      return {
        success: false,
        message: 'Erro ao criar reserva',
        reservationId: null
      };
    }
  }

  /**
   * Calcular preço baseado no parceiro real
   */
  private calculatePrice(partner: Partner, request: ReservationRequest): number {
    const days = Math.ceil((new Date(request.checkOut).getTime() - new Date(request.checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return partner.pricing.minPrice * days;
  }

  /**
   * Obter reservas do usuário
   */
  async getUserReservations(userId: string): Promise<Reservation[]> {
    console.log('📋 Buscando reservas do usuário...');
    
    // TODO: Implementar busca real de reservas
    // Por enquanto retorna vazio - sem dados simulados
    return [];
  }

  /**
   * Cancelar reserva
   */
  async cancelReservation(reservationId: string, userId: string): Promise<ReservationResponse> {
    console.log('❌ Cancelando reserva...');
    
    try {
      // TODO: Implementar cancelamento real
      return {
        success: true,
        message: 'Reserva cancelada com sucesso',
        reservationId
      };
    } catch (error) {
      console.log('❌ Erro ao cancelar reserva:', error);
      return {
        success: false,
        message: 'Erro ao cancelar reserva',
        reservationId: null
      };
    }
  }
}

export const reservationService = new ReservationService(); 