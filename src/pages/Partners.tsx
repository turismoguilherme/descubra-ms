import React, { useState, useEffect } from "react";
import UniversalLayout from "@/components/layout/UniversalLayout";
import { usePartners, Partner } from "@/hooks/usePartners";
import { PartnerCard } from "@/components/partners/PartnerCard";
import { PartnerDetailModal } from "@/components/partners/PartnerDetailModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Users, Search, Sparkles, X } from "lucide-react";
import { usePersonalization } from "@/hooks/usePersonalization";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Partners = () => {
    const { partners, isLoading } = usePartners('approved');
    const [search, setSearch] = useState('');
    const [partnerType, setPartnerType] = useState<string>('all');
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [showPersonalization, setShowPersonalization] = useState(true);
    
    // Personalização baseada no perfil
    const { partnerFilters, personalizationMessage, isPersonalized } = usePersonalization();
    
    // Aplicar filtros automáticos baseados no perfil
    useEffect(() => {
        if (partnerFilters && isPersonalized && partnerType === 'all') {
            // Aplicar filtro de cidade se disponível
            if (partnerFilters.suggestedCity && !search) {
                // Não aplicar automaticamente, apenas sugerir
            }
            
            // Aplicar filtro de tipo se disponível
            if (partnerFilters.suggestedTypes && partnerFilters.suggestedTypes.length > 0) {
                // Sugerir o primeiro tipo, mas não aplicar automaticamente
                // O usuário pode ver a sugestão e aplicar se quiser
            }
        }
    }, [partnerFilters, isPersonalized, partnerType, search]);

    const partnerTypes = [
        { value: 'all', label: 'Todos os tipos' },
        { value: 'hotel', label: 'Hotel' },
        { value: 'pousada', label: 'Pousada' },
        { value: 'resort', label: 'Resort' },
        { value: 'restaurante', label: 'Restaurante' },
        { value: 'atrativo_turistico', label: 'Atrativo Turístico' },
        { value: 'agencia_turismo', label: 'Agência de Turismo' },
        { value: 'transporte', label: 'Transporte' },
    ];

    const filtered = partners.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                            (p.description || '').toLowerCase().includes(search.toLowerCase()) ||
                            (p.address || '').toLowerCase().includes(search.toLowerCase());
        const matchType = partnerType === 'all' || p.partner_type === partnerType;
        return matchSearch && matchType;
    });

    const handleViewMore = (partner: Partner) => {
        setSelectedPartner(partner);
        setModalOpen(true);
    };

    return (
        <UniversalLayout>
            <main className="flex-grow">
                {/* Hero */}
                <div className="bg-gradient-to-r from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green py-16">
                    <div className="ms-container text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                                <Users size={48} className="text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Nossos Parceiros
                        </h1>
                        <p className="text-white/90 text-lg max-w-2xl mx-auto">
                            Conheça as empresas que fazem parte da rede Descubra MS
                        </p>
                    </div>
                </div>

                {/* Personalização - Alerta */}
                {isPersonalized && showPersonalization && personalizationMessage && (
                    <div className="ms-container py-4">
                        <Alert className="bg-gradient-to-r from-ms-primary-blue/10 to-ms-discovery-teal/10 border-ms-primary-blue/30">
                            <Sparkles className="h-4 w-4 text-ms-primary-blue" />
                            <AlertDescription className="flex items-center justify-between">
                                <div>
                                    <strong className="text-ms-primary-blue">{personalizationMessage.title}</strong>
                                    <p className="text-sm text-gray-700 mt-1">{personalizationMessage.description}</p>
                                    {partnerFilters?.suggestedCity && (
                                        <p className="text-xs text-gray-600 mt-1">
                                            💡 Sugestão: Parceiros em {partnerFilters.suggestedCity}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPersonalization(false)}
                                    className="ml-4"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {/* Filtros */}
                <div className="bg-white border-b sticky top-0 z-10">
                    <div className="ms-container py-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input 
                                    placeholder={partnerFilters?.suggestedCity ? `Buscar em ${partnerFilters.suggestedCity}...` : "Buscar parceiro..."} 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={partnerType} onValueChange={setPartnerType}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {partnerTypes.map(t => (
                                        <SelectItem key={t.value} value={t.value}>
                                            {t.label}
                                            {partnerFilters?.suggestedTypes?.includes(t.value) && isPersonalized && (
                                                <span className="ml-2 text-ms-primary-blue">⭐</span>
                                            )}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {partnerFilters?.suggestedTypes && partnerFilters.suggestedTypes.length > 0 && isPersonalized && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        // Aplicar primeiro tipo sugerido
                                        if (partnerFilters.suggestedTypes && partnerFilters.suggestedTypes.length > 0) {
                                            setPartnerType(partnerFilters.suggestedTypes[0]);
                                        }
                                    }}
                                    className="whitespace-nowrap"
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Sugeridos para mim
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lista */}
                <div className="bg-gray-50 min-h-[400px]">
                    <div className="ms-container py-10">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <Skeleton key={i} className="h-72 rounded-2xl" />
                                ))}
                            </div>
                        ) : filtered.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filtered.map(partner => (
                                    <PartnerCard 
                                        key={partner.id} 
                                        partner={partner}
                                        onViewMore={() => handleViewMore(partner)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                    Nenhum parceiro encontrado
                                </h2>
                                <Button 
                                    variant="outline"
                                    onClick={() => {
                                        setSearch('');
                                        setPartnerType('all');
                                    }}
                                >
                                    Limpar filtros
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal">
                    <div className="ms-container py-16 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Quer fazer parte dessa rede?
                        </h2>
                        <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
                            Cadastre seu empreendimento e alcance milhares de turistas que visitam 
                            Mato Grosso do Sul. Ofereça descontos exclusivos pelo Passaporte Digital!
                        </p>
                        <Button 
                            asChild 
                            size="lg" 
                            className="bg-ms-secondary-yellow text-black hover:bg-ms-secondary-yellow/90 font-bold shadow-lg px-8"
                        >
                            <Link to="/descubramatogrossodosul/seja-um-parceiro">
                                Quero ser um parceiro
                            </Link>
                        </Button>
                    </div>
                </div>
            </main>

            {/* Modal */}
            <PartnerDetailModal 
                partner={selectedPartner}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </UniversalLayout>
    );
}

export default Partners;
