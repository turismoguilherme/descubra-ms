
import React, { useState } from "react";
import UniversalLayout from "@/components/layout/UniversalLayout";
import { usePartners } from "@/hooks/usePartners";
import { PartnerCard } from "@/components/partners/PartnerCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";

const Partners = () => {
    console.log("🤝 PARTNERS: Componente Partners sendo renderizado");
    
    const { partners, isLoading, error } = usePartners('approved');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<'all' | 'local' | 'regional' | 'estadual'>('all');
    
    console.log("🤝 PARTNERS: Estado - isLoading:", isLoading, "partners.length:", partners.length, "error:", error);

    const filtered = partners.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                            (p.city || '').toLowerCase().includes(search.toLowerCase()) ||
                            (p.segment || '').toLowerCase().includes(search.toLowerCase());
        const matchCat = category === 'all' || p.category === category;
        return matchSearch && matchCat;
    });

    console.log("🔍 Partners Component: isLoading", isLoading, "partners.length", partners.length, "error", error);

    return (
        <UniversalLayout>
            <main className="flex-grow">
                <div className="bg-gray-50">
                    <div className="ms-container py-16 text-center">
                        <h1 className="text-4xl font-bold text-ms-primary-blue">Nossos Parceiros</h1>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                            Conheça as empresas e organizações que apoiam o turismo em Mato Grosso do Sul e ajudam a fortalecer nosso destino.
                        </p>
                    </div>
                </div>

                <div className="ms-container py-12">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <Input placeholder="Buscar por nome, cidade ou segmento..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                            <SelectTrigger className="w-full md:w-[220px]">
                                <SelectValue placeholder="Categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as categorias</SelectItem>
                                <SelectItem value="local">Local</SelectItem>
                                <SelectItem value="regional">Regional</SelectItem>
                                <SelectItem value="estadual">Estadual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} className="h-60 w-full" />
                            ))}
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered.map(partner => (
                                <PartnerCard key={partner.id} partner={partner} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-lg bg-gray-50">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-800">Nenhum parceiro encontrado.</h2>
                            <p className="text-muted-foreground mt-2">Tente alterar os filtros ou a busca.</p>
                        </div>
                    )}
                </div>

                <div className="bg-ms-secondary-yellow/10">
                    <div className="ms-container py-16 text-center">
                        <h2 className="text-3xl font-bold">Quer ser um parceiro?</h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                            Junte-se a nós e ajude a promover as maravilhas de Mato Grosso do Sul. Sua marca em destaque para milhares de turistas.
                        </p>
                        <Button asChild size="lg" className="mt-8 bg-ms-secondary-yellow text-black hover:bg-ms-secondary-yellow/90 font-bold shadow-lg">
                            <Link to="/seja-um-parceiro">Quero ser um parceiro</Link>
                        </Button>
                    </div>
                </div>
            </main>
        </UniversalLayout>
    );
}

export default Partners;
