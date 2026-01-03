import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, FileText } from "lucide-react";
import { useKodaLanguage } from "@/hooks/useKodaLanguage";

const Privacy = () => {
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
            <Shield className="w-8 h-8 text-white" />
            <h1 className="text-4xl font-bold text-white">
              {isFrench ? 'Politique de confidentialité' : 'Privacy Policy'}
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
                  <Lock className="w-6 h-6" />
                  1. Introduction
                </h2>
                <p className="text-white/90 leading-relaxed">
                  Koda est un assistant de voyage alimenté par l'IA conçu pour vous aider à explorer le Canada. 
                  Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Eye className="w-6 h-6" />
                  2. Informations que nous collectons
                </h2>
                <p className="text-white/90 leading-relaxed mb-3">
                  Nous collectons uniquement les informations nécessaires pour fournir nos services:
                </p>
                <ul className="list-disc list-inside space-y-2 text-white/90 ml-4">
                  <li>Messages de conversation (stockés temporairement)</li>
                  <li>Préférences de langue</li>
                  <li>Données de navigation anonymes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  3. Utilisation des informations
                </h2>
                <p className="text-white/90 leading-relaxed">
                  Vos informations sont utilisées uniquement pour améliorer votre expérience avec Koda et fournir 
                  des réponses pertinentes à vos questions sur le Canada.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Protection des données</h2>
                <p className="text-white/90 leading-relaxed">
                  Nous ne partageons pas vos données personnelles avec des tiers. Toutes les conversations sont 
                  traitées de manière sécurisée et ne sont pas stockées de manière permanente.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Vos droits</h2>
                <p className="text-white/90 leading-relaxed">
                  Vous pouvez à tout moment effacer votre historique de conversation directement dans l'interface Koda.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Contact</h2>
                <p className="text-white/90 leading-relaxed">
                  Pour toute question concernant cette politique de confidentialité, veuillez nous contacter via 
                  les canaux officiels de ViajARTur.
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  1. Introduction
                </h2>
                <p className="text-white/90 leading-relaxed">
                  Koda is an AI-powered travel assistant designed to help you explore Canada. 
                  This privacy policy explains how we collect, use, and protect your information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Eye className="w-6 h-6" />
                  2. Information We Collect
                </h2>
                <p className="text-white/90 leading-relaxed mb-3">
                  We only collect information necessary to provide our services:
                </p>
                <ul className="list-disc list-inside space-y-2 text-white/90 ml-4">
                  <li>Conversation messages (temporarily stored)</li>
                  <li>Language preferences</li>
                  <li>Anonymous navigation data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  3. How We Use Your Information
                </h2>
                <p className="text-white/90 leading-relaxed">
                  Your information is used solely to improve your experience with Koda and provide 
                  relevant answers to your questions about Canada.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Data Protection</h2>
                <p className="text-white/90 leading-relaxed">
                  We do not share your personal data with third parties. All conversations are 
                  processed securely and are not permanently stored.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
                <p className="text-white/90 leading-relaxed">
                  You can clear your conversation history at any time directly in the Koda interface.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Contact</h2>
                <p className="text-white/90 leading-relaxed">
                  For any questions regarding this privacy policy, please contact us through 
                  ViajARTur's official channels.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Privacy;

