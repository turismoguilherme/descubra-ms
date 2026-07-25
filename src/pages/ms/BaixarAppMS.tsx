import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Smartphone,
  ShieldCheck,
  FolderOpen,
  Settings,
  CheckCircle2,
  Apple,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import UniversalLayout from "@/components/layout/UniversalLayout";
import { Button } from "@/components/ui/button";
import { isNativeApp } from "@/native/capacitorBridge";

/** URL do APK — sobrescreva com VITE_ANDROID_APK_URL se hospedar fora do site */
const APK_URL =
  (import.meta.env.VITE_ANDROID_APK_URL as string | undefined)?.trim() ||
  "/downloads/descubra-ms.apk";

const APK_VERSION =
  (import.meta.env.VITE_ANDROID_APK_VERSION as string | undefined)?.trim() ||
  "1.0.0";

const steps = [
  {
    icon: Download,
    title: "Baixe o arquivo",
    text: "Toque no botão “Baixar app Android”. O arquivo .apk será salvo no celular.",
  },
  {
    icon: FolderOpen,
    title: "Abra o download",
    text: "Nas notificações ou na pasta Downloads, toque no arquivo Descubra MS.",
  },
  {
    icon: Settings,
    title: "Permita a instalação",
    text: "Se o Android pedir, permita instalar apps desta fonte (Chrome ou Arquivos). É o procedimento normal fora da Play Store.",
  },
  {
    icon: CheckCircle2,
    title: "Instale e abra",
    text: "Confirme a instalação. O ícone Descubra MS aparece na tela inicial — abra e explore com o Guatá.",
  },
];

const BaixarAppMS = () => {
  const [apkReady, setApkReady] = useState<boolean | null>(null);
  const native = useMemo(() => isNativeApp(), []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(APK_URL, { method: "HEAD", cache: "no-store" });
        if (!cancelled) setApkReady(res.ok);
      } catch {
        if (!cancelled) setApkReady(false);
      }
    };
    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <UniversalLayout>
      <main className="flex-grow bg-gradient-to-b from-emerald-50 via-white to-sky-50">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0B3D2E] via-ms-pantanal-green to-ms-primary-blue py-16 md:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_45%)]" />
          <div className="relative ms-container text-center text-white px-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm mb-6 backdrop-blur-sm">
              <Smartphone className="h-4 w-4" />
              App oficial · Android
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">
              Baixe o Descubra MS
            </h1>
            <p className="text-white/95 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
              Leve destinos, eventos, passaporte digital e o Guatá no seu celular —
              direto pelo site, sem precisar da Play Store.
            </p>

            {native ? (
              <p className="text-white/90 text-base max-w-xl mx-auto">
                Você já está no app Descubra MS. Aproveite a experiência por aqui.
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {apkReady === false ? (
                  <Button
                    size="lg"
                    disabled
                    className="bg-white/30 text-white cursor-not-allowed"
                  >
                    APK em preparação
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-[#0B3D2E] hover:bg-emerald-50 font-semibold shadow-lg"
                  >
                    <a href={APK_URL} download={`descubra-ms-${APK_VERSION}.apk`}>
                      <Download className="h-5 w-5 mr-2" />
                      Baixar app Android
                    </a>
                  </Button>
                )}
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/70 bg-transparent text-white hover:bg-white/10"
                >
                  <a href="#como-instalar">
                    Ver passo a passo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            )}

            <p className="mt-4 text-white/75 text-sm">
              Versão {APK_VERSION}
              {apkReady === false && " · arquivo ainda não publicado no servidor"}
            </p>
          </div>
        </section>

        <section id="como-instalar" className="ms-container py-14 px-4 scroll-mt-20">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold text-ms-primary-blue mb-3">
              Como instalar no Android
            </h2>
            <p className="text-gray-600 text-lg">
              Quatro passos simples. Na primeira vez o celular pede permissão —
              isso é normal para apps baixados pelo site.
            </p>
          </div>

          <ol className="max-w-3xl mx-auto space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className="flex gap-4 md:gap-5 items-start"
                >
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0B3D2E] text-white font-bold text-lg">
                      {index + 1}
                    </span>
                    {index < steps.length - 1 && (
                      <span className="mt-2 w-px flex-1 min-h-[1.5rem] bg-emerald-200" />
                    )}
                  </div>
                  <div className="pb-2 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-5 w-5 text-ms-pantanal-green" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{step.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="ms-container pb-14 px-4">
          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <ShieldCheck className="h-8 w-8 text-ms-pantanal-green mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                É seguro?
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Sim. O aplicativo é o canal oficial do Descubra Mato Grosso do Sul.
                Baixe apenas por este site. Em breve também poderá estar nas lojas.
              </p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
              <Apple className="h-8 w-8 text-ms-primary-blue mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                E o iPhone?
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                No iOS o download direto pelo site não é permitido pela Apple.
                Use o site no Safari ou o Guatá no WhatsApp.
              </p>
              <Link
                to="/descubrams/guata"
                className="text-ms-primary-blue font-medium text-sm inline-flex items-center gap-1 hover:underline"
              >
                Abrir Guatá no site
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="ms-container pb-16 px-4">
          <div className="max-w-3xl mx-auto rounded-2xl bg-[#0B3D2E]/[5%] border border-[#0B3D2E]/15 p-6 md:p-8">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-6 w-6 text-[#0B3D2E] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Problemas na instalação?
                </h3>
                <ul className="text-gray-600 text-sm space-y-2 list-disc pl-4">
                  <li>
                    Se aparecer “bloqueado por segurança”, abra as configurações
                    sugeridas e permita a instalação desta vez.
                  </li>
                  <li>
                    Prefira baixar pelo Chrome no próprio celular Android.
                  </li>
                  <li>
                    Já tem uma versão antiga? Desinstale antes ou confirme a
                    atualização quando o instalador pedir.
                  </li>
                </ul>
                {!native && apkReady !== false && (
                  <Button asChild className="mt-5 bg-[#0B3D2E] hover:bg-[#0a3327]">
                    <a href={APK_URL} download={`descubra-ms-${APK_VERSION}.apk`}>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar novamente
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </UniversalLayout>
  );
};

export default BaixarAppMS;
