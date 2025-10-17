

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Heart, Star, Globe, MapPin, Camera } from "lucide-react";

const Welcome = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Floating elements for visual appeal */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-bounce">
          <Sparkles className="w-6 h-6 text-ms-secondary-yellow opacity-60" />
        </div>
        <div className="absolute top-32 right-20 animate-pulse">
          <Heart className="w-8 h-8 text-red-300 opacity-50" />
        </div>
        <div className="absolute bottom-40 left-20 animate-bounce delay-1000">
          <Star className="w-5 h-5 text-white opacity-40" />
        </div>
        <div className="absolute top-60 right-32 animate-pulse delay-500">
          <Sparkles className="w-4 h-4 text-ms-pantanal-green opacity-60" />
        </div>
        <div className="absolute top-1/2 left-16 animate-bounce delay-700">
          <MapPin className="w-5 h-5 text-ms-secondary-yellow opacity-50" />
        </div>
        <div className="absolute bottom-60 right-16 animate-pulse delay-300">
          <Camera className="w-6 h-6 text-white opacity-40" />
        </div>
      </div>

      <main className="flex-grow flex flex-col">
        {/* Hero background with elegant gradient */}
        <div className="relative flex-grow flex items-center justify-center">
          {/* Smooth animated background */}
          <div className="absolute inset-0 bg-[url('https://source.unsplash.com/photo-1513635269975-59663e0ac1ad')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-br from-ms-primary-blue/85 via-ms-discovery-teal/75 to-ms-pantanal-green/85"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-ms-secondary-yellow/10 to-ms-cerrado-orange/5"></div>
            {/* Subtle moving light effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-pulse opacity-30"></div>
          </div>

          {/* Content with smooth animations */}
          <div className="relative z-10 text-center px-4 py-16">
            <div className="animate-fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-6 drop-shadow-lg transform transition-all duration-500 hover:scale-105">
                Descubra Mato Grosso do Sul
              </h1>
              
              <p className="text-xl text-white mb-10 max-w-2xl mx-auto animate-fade-in delay-300">
                Do Pantanal ao Cerrado, explore paisagens únicas, rica biodiversidade e cultura autêntica no coração da América do Sul.
                <span className="inline-block ml-2">🦎</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-500">
              <Link to="/register">
                <Button className="bg-ms-secondary-yellow hover:bg-ms-secondary-yellow/90 text-black text-lg px-8 py-6 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-ms-secondary-yellow/20">
                  Cadastre-se <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/ms/login">
                <Button className="bg-ms-primary-blue hover:bg-ms-primary-blue/90 text-white text-lg px-8 py-6 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Já tenho conta
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 animate-fade-in delay-700">
              <p className="text-white/80 text-sm mb-2">Ou entre com:</p>
              <div className="flex justify-center gap-4">
                <button className="bg-white rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-3 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                  </svg>
                </button>
                <button className="bg-white rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:-rotate-3 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#3F51B5" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"></path>
                    <path fill="#FFF" d="M34.368,25H31v13h-5V25h-3v-4h3v-2.41c0.002-3.508,1.459-5.59,5.592-5.59H35v4h-2.287C31.104,17,31,17.6,31,18.723V21h4L34.368,25z"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Creative exploration section */}
            <div className="mt-12 animate-fade-in delay-1000">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md mx-auto transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-ms-secondary-yellow rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-black" />
                    </div>
                    <div className="w-8 h-8 bg-ms-pantanal-green rounded-full flex items-center justify-center">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-8 h-8 bg-ms-cerrado-orange rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  Explore o Inexplorado
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Pantanal, Bonito, Serra da Bodoquena... 
                  <br />
                  <span className="text-ms-secondary-yellow font-medium">Cada destino uma nova história!</span>
                </p>
                <div className="flex justify-center mt-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-ms-secondary-yellow fill-current animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Welcome;

