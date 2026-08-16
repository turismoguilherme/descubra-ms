
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Calendar, MapPin, Phone, ExternalLink } from "lucide-react";
import { UserBenefit, RouteBenefit } from "@/types/passport";
import { useToast } from "@/hooks/use-toast";

interface BenefitsPanelProps {
  userBenefits: UserBenefit[];
  availableBenefits: RouteBenefit[];
  onUseBenefit: (benefitId: string) => void;
}

const BenefitsPanel = ({ userBenefits, availableBenefits, onUseBenefit }: BenefitsPanelProps) => {
  const { toast } = useToast();

  const handleUseBenefit = (benefit: UserBenefit) => {
    if (benefit.is_used) {
      toast({
        title: "Benefício já utilizado",
        description: "Este benefício já foi resgatado anteriormente.",
        variant: "destructive",
      });
      return;
    }

    onUseBenefit(benefit.id);
  };

  const getBenefitStatusBadge = (benefit: UserBenefit) => {
    if (benefit.is_used) {
      return <Badge variant="secondary">Usado</Badge>;
    }
    
    if (benefit.expires_at && new Date(benefit.expires_at) < new Date()) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    
    return <Badge variant="default">Disponível</Badge>;
  };

  const formatBenefitValue = (benefit: RouteBenefit) => {
    if (benefit.discount_percentage) {
      return `${benefit.discount_percentage}% de desconto`;
    }
    
    if (benefit.value_percentage) {
      return `${benefit.value_percentage}% OFF`;
    }
    
    if (benefit.value_amount) {
      return `R$ ${benefit.value_amount} de desconto`;
    }
    
    return "Benefício especial";
  };

  const formatExpiryDate = (benefit: RouteBenefit) => {
    if (benefit.valid_until) {
      return new Date(benefit.valid_until).toLocaleDateString('pt-BR');
    }
    
    if (benefit.expiry_date) {
      return new Date(benefit.expiry_date).toLocaleDateString('pt-BR');
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Meus Benefícios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Meus Benefícios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userBenefits.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Você ainda não possui benefícios. Complete roteiros para ganhar recompensas!
            </p>
          ) : (
            <div className="grid gap-4">
              {userBenefits.map((benefit) => (
                <div key={benefit.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{benefit.benefit_name}</h4>
                    {getBenefitStatusBadge(benefit)}
                  </div>
                  
                  {benefit.description && (
                    <p className="text-gray-600 text-sm mb-3">{benefit.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {benefit.expires_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Expira em: {new Date(benefit.expires_at).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                    
                    {!benefit.is_used && (
                      <Button
                        size="sm"
                        onClick={() => handleUseBenefit(benefit)}
                        disabled={benefit.expires_at ? new Date(benefit.expires_at) < new Date() : false}
                      >
                        {benefit.redemption_code ? `Código: ${benefit.redemption_code}` : "Usar Benefício"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benefícios Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Benefícios Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableBenefits.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nenhum benefício disponível no momento.
            </p>
          ) : (
            <div className="grid gap-4">
              {availableBenefits.map((benefit) => (
                <div key={benefit.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{benefit.title}</h4>
                    <Badge variant="outline">{formatBenefitValue(benefit)}</Badge>
                  </div>
                  
                  {benefit.description && (
                    <p className="text-gray-600 text-sm mb-3">{benefit.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {benefit.partner_name && (
                      <div className="flex items-center gap-2">
                        <strong>Parceiro:</strong> {benefit.partner_name}
                      </div>
                    )}
                    
                    {benefit.where_to_claim && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <strong>Onde resgatar:</strong> {benefit.where_to_claim}
                      </div>
                    )}
                    
                    <div>
                      <strong>Como resgatar:</strong> {benefit.how_to_claim}
                    </div>
                    
                    {formatExpiryDate(benefit) && (
                      <div className="flex items-center gap-2 text-orange-600">
                        <Calendar className="w-4 h-4" />
                        <strong>Válido até:</strong> {formatExpiryDate(benefit)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BenefitsPanel;
