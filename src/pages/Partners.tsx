
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { usePartners } from "@/hooks/usePartners";
import { PartnerCard } from "@/components/partners/PartnerCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";

const Partners = () => {
    const { partners, isLoading, error } = usePartners();

    console.log("🔍 Partners Component: isLoading", isLoading, "partners.length", partners.length, "error", error);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
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
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} className="h-60 w-full" />
                            ))}
                        </div>
                    ) : partners.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {partners.map(partner => (
                                <PartnerCard key={partner.id} partner={partner} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-lg bg-gray-50">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-800">Nenhum parceiro encontrado.</h2>
                            <p className="text-muted-foreground mt-2">Ainda não temos parceiros institucionais. Seja o primeiro a apoiar!</p>
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
            <Footer />
        </div>
    );
}

export default Partners;
