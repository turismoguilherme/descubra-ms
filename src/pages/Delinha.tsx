import React from 'react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Delinha = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-purple-700 to-indigo-900 text-white">
      <Navbar />
      <main className="flex-grow py-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo(a) ao Delinha!</h1>
          <p className="text-lg">Este é o espaço da inteligência artificial Delinha. Em breve, muitas novidades por aqui.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Delinha; 