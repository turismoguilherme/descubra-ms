import UniversalLayout from "@/components/layout/UniversalLayout";
import { Calendar } from "lucide-react";
import EventCalendar from "@/components/events/EventCalendar";

const Eventos = () => {
  return (
    <UniversalLayout>
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-ms-cerrado-orange to-ms-guavira-purple py-16">
          <div className="ms-container text-center">
            <Calendar size={48} className="text-white mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-6">Eventos</h1>
            <p className="text-white/90 text-xl max-w-2xl mx-auto">
              Confira o calendário de eventos culturais, festivais e celebrações do Descubra Mato Grosso do Sul
            </p>
          </div>
        </div>

        <div className="ms-container py-12">
          {/* Calendário de Eventos */}
          <EventCalendar autoLoad={true} />
        </div>
      </main>
    </UniversalLayout>
  );
};

export default Eventos;

