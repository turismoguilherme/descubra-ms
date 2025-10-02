import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Mail, Phone, Globe, Star, Eye, MousePointer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OverflowOnePartner } from '@/hooks/useOverflowOnePartners';

interface OverflowOnePartnerCardProps {
  partner: OverflowOnePartner;
  showActions?: boolean;
  onViewDetails?: (partner: OverflowOnePartner) => void;
}

const OverflowOnePartnerCard: React.FC<OverflowOnePartnerCardProps> = ({ 
  partner, 
  showActions = true,
  onViewDetails 
}) => {
  const getBusinessTypeLabel = (type: string) => {
    const types = {
      'technology': 'Tecnologia',
      'consulting': 'Consultoria',
      'marketing': 'Marketing',
      'design': 'Design',
      'development': 'Desenvolvimento',
      'infrastructure': 'Infraestrutura',
      'security': 'Segurança',
      'analytics': 'Analytics',
      'communication': 'Comunicação',
      'other': 'Outros'
    };
    return types[type as keyof typeof types] || type;
  };

  const getCompanySizeLabel = (size: string) => {
    const sizes = {
      'startup': 'Startup',
      'small': 'Pequena',
      'medium': 'Média',
      'large': 'Grande',
      'enterprise': 'Enterprise'
    };
    return sizes[size as keyof typeof sizes] || size;
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'premium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'enterprise': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              {partner.logo_url ? (
                <img 
                  src={partner.logo_url} 
                  alt={partner.company_name}
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <Building2 className="h-6 w-6 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                {partner.company_name}
              </h3>
              {partner.trade_name && (
                <p className="text-sm text-gray-500 truncate">
                  {partner.trade_name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {partner.featured && (
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
            )}
            {partner.verified && (
              <Badge variant="outline" className="text-xs">
                Verificado
              </Badge>
            )}
          </div>
        </div>

        {/* Business Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="h-4 w-4" />
            <span>{getBusinessTypeLabel(partner.business_type)}</span>
            <span className="text-gray-400">•</span>
            <span>{getCompanySizeLabel(partner.company_size)}</span>
          </div>
          
          {partner.city && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{partner.city}{partner.state && `, ${partner.state}`}</span>
            </div>
          )}
          
          {partner.contact_email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span className="truncate">{partner.contact_email}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {partner.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {partner.description}
          </p>
        )}

        {/* Services */}
        {partner.services_offered && partner.services_offered.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Serviços:</p>
            <div className="flex flex-wrap gap-1">
              {partner.services_offered.slice(0, 3).map((service, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {service}
                </Badge>
              ))}
              {partner.services_offered.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{partner.services_offered.length - 3} mais
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={getPlanBadgeColor(partner.subscription_plan)}>
            {partner.subscription_plan.toUpperCase()}
          </Badge>
          <Badge className={getStatusBadgeColor(partner.status)}>
            {partner.status === 'approved' ? 'Aprovado' : 
             partner.status === 'pending' ? 'Pendente' :
             partner.status === 'rejected' ? 'Rejeitado' : 'Suspenso'}
          </Badge>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{partner.total_views || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MousePointer className="h-3 w-3" />
              <span>{partner.total_clicks || 0}</span>
            </div>
          </div>
          {partner.conversion_rate && partner.conversion_rate > 0 && (
            <div className="text-green-600 font-medium">
              {partner.conversion_rate.toFixed(1)}% conversão
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => onViewDetails?.(partner)}
            >
              Ver Detalhes
            </Button>
            {partner.website_url && (
              <Button 
                size="sm" 
                variant="outline"
                asChild
              >
                <a 
                  href={partner.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <Globe className="h-3 w-3" />
                  Site
                </a>
              </Button>
            )}
            {partner.contact_whatsapp && (
              <Button 
                size="sm" 
                variant="outline"
                asChild
              >
                <a 
                  href={`https://wa.me/${partner.contact_whatsapp.replace(/\D/g, '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <Phone className="h-3 w-3" />
                  WhatsApp
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OverflowOnePartnerCard;





