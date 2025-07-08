
import { Partner } from "@/hooks/usePartners";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Building, MapPin } from "lucide-react";

export function PartnerCard({ partner }: { partner: Partner }) {
  const categoryLabels = {
    local: 'Parceiro Local',
    regional: 'Parceiro Regional',
    estadual: 'Parceiro Estadual',
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          {partner.logo_url ? (
            <img 
              src={partner.logo_url} 
              alt={`Logo de ${partner.name}`} 
              className="h-16 w-16 object-contain rounded-md border p-1 bg-white flex-shrink-0" 
            />
          ) : (
             <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Building className="h-8 w-8 text-gray-400"/>
            </div>
          )}
          <div className="flex-grow">
            <CardTitle className="text-lg">{partner.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{partner.segment || 'Parceiro'}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <MapPin size={14} />
                <span>{partner.city || 'Campo Grande'}</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ms-primary-blue bg-blue-50 rounded-full px-3 py-1 inline-block">
                {partner.category ? categoryLabels[partner.category] : 'Parceiro'}
            </p>
        </div>
        {partner.website_link && (
          <a
            href={partner.website_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline mt-4 flex items-center gap-2"
          >
            <Globe size={14} />
            Visitar site
          </a>
        )}
      </CardContent>
    </Card>
  );
}
