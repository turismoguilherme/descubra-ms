import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { useKodaLanguage } from "@/hooks/useKodaLanguage";

const Terms = () => {
  const { language } = useKodaLanguage();
  const isFrench = language === 'fr';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-700 via-blue-600 to-red-700">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/koda" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {isFrench ? 'Retour à Koda' : 'Back to Koda'}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-white" />
            <h1 className="text-4xl font-bold text-white">
              {isFrench ? 'Conditions d\'utilisation' : 'Terms of Use'}
            </h1>
          </div>
          <p className="text-white/70 text-sm mt-2">
            {isFrench 
              ? 'Dernière mise à jour: Janvier 2025'
              : 'Last updated: January 2025'}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white space-y-6">
          {/* Disclaimer */}
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium">
              {isFrench 
                ? '⚠️ Projet indépendant de ViajARTur, non affilié au gouvernement du Canada'
                : '⚠️ Independent project by ViajARTur, not affiliated with the Government of Canada'}
            </p>
          </div>

          {isFrench ? (
            <>
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  1. Acceptation des conditions
                </h2>
                <p className="text-white/90 leading-relaxed">
                  En utilisant Koda, vous acceptez ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, 
                  veuillez ne pas utiliser le service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  2. Description du service
                </h2>
                <p className="text-white/90 leading-relaxed">
                  Koda est un assistant de voyage alimenté par l'IA qui fournit des informations et des recommandations 
                  sur le tourisme au Canada. Les informations fournies sont à titre informatif uniquement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. Utilisation appropriée</h2>
                <p className="text-white/90 leading-relaxed mb-3">
                  Vous vous engagez à utiliser Koda de manière appropriée et légale. Il est interdit de:
                </p>
                <ul className="list-disc list-inside space-y-2 text-white/90 ml-4">
                  <li>Utiliser le service à des fins illégales</li>
                  <li>Tenter d'accéder à des parties non autorisées du système</li>
                  <li>Transmettre du contenu offensant ou inapproprié</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Exactitude des informations</h2>
                <p className="text-white/90 leading-relaxed">
                  Bien que nous nous efforcions de fournir des informations précises, Koda est un service d'IA et 
                  les informations peuvent contenir des erreurs. Nous ne garantissons pas l'exactitude complète 
                  de toutes les réponses.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Limitation de responsabilité</h2>
                <p className="text-white/90 leading-relaxed">
                  ViajARTur et Koda ne sont pas responsables des décisions prises sur la base des informations fournies 
                  par le service. Les utilisateurs sont responsables de vérifier les informations importantes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Modifications</h2>
                <p className="text-white/90 leading-relaxed">
                  Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications seront 
                  publiées sur cette page.
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  1. Acceptance of Terms
                </h2>
                <p className="text-white/90 leading-relaxed">
                  By using Koda, you agree to these terms of use. If you do not agree to these terms, 
                  please do not use the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  2. Service Description
                </h2>
                <p className="text-white/90 leading-relaxed">
                  Koda is an AI-powered travel assistant that provides information and recommendations 
                  about tourism in Canada. Information provided is for informational purposes only.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. Appropriate Use</h2>
                <p className="text-white/90 leading-relaxed mb-3">
                  You agree to use Koda appropriately and legally. It is prohibited to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-white/90 ml-4">
                  <li>Use the service for illegal purposes</li>
                  <li>Attempt to access unauthorized parts of the system</li>
                  <li>Transmit offensive or inappropriate content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Information Accuracy</h2>
                <p className="text-white/90 leading-relaxed">
                  While we strive to provide accurate information, Koda is an AI service and information may contain errors. 
                  We do not guarantee complete accuracy of all responses.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Limitation of Liability</h2>
                <p className="text-white/90 leading-relaxed">
                  ViajARTur and Koda are not responsible for decisions made based on information provided by the service. 
                  Users are responsible for verifying important information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Modifications</h2>
                <p className="text-white/90 leading-relaxed">
                  We reserve the right to modify these terms at any time. Changes will be published on this page.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Terms;

