
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SuggestionForm from "@/components/auth/SuggestionForm";

const Contribute = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green py-12 px-4 flex items-center justify-center">
        <SuggestionForm />
      </main>
      <Footer />
    </div>
  );
};

export default Contribute;
