
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PartnerForm } from "@/components/partners/PartnerForm";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const BecomePartner = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green py-12 px-4 flex items-center justify-center">
                <div className="ms-container max-w-3xl w-full mx-auto bg-black bg-opacity-20 text-white rounded-lg shadow-lg p-6 sm:p-8">
                     <Link to="/parceiros" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-6">
                        <ArrowLeft size={16} />
                        Voltar para a galeria de parceiros
                    </Link>
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white">Formulário de Parceria</h1>
                        <p className="text-gray-300 mt-2">
                            Preencha os dados abaixo para solicitar sua parceria. Entraremos em contato em breve.
                        </p>
                    </div>
                    <PartnerForm />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default BecomePartner;
