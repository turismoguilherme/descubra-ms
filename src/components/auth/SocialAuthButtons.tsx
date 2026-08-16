
import React from "react";
import { Button } from "@/components/ui/button";

interface SocialAuthButtonsProps {
  onSocialLogin?: (provider: 'google' | 'facebook') => void;
  loading?: boolean;
}

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ 
  onSocialLogin, 
  loading = false 
}) => {
  const handleGoogleLogin = async () => {
    console.log("🔵 GOOGLE: Usuário clicou no botão");
    console.log("🔵 GOOGLE: Estado loading:", loading);
    console.log("🔵 GOOGLE: Função onSocialLogin:", typeof onSocialLogin);
    
    if (loading) {
      console.log("🔵 GOOGLE: Cancelado - loading ativo");
      return;
    }
    
    if (onSocialLogin) {
      console.log("🔵 GOOGLE: Chamando onSocialLogin");
      try {
        await onSocialLogin('google');
        console.log("🔵 GOOGLE: onSocialLogin executado com sucesso");
      } catch (error) {
        console.error("🔵 GOOGLE: Erro em onSocialLogin:", error);
      }
    } else {
      console.error("🔵 GOOGLE: onSocialLogin não definido!");
    }
  };

  const handleFacebookLogin = async () => {
    console.log("🟣 FACEBOOK: Usuário clicou no botão");
    console.log("🟣 FACEBOOK: Estado loading:", loading);
    console.log("🟣 FACEBOOK: Função onSocialLogin:", typeof onSocialLogin);
    
    if (loading) {
      console.log("🟣 FACEBOOK: Cancelado - loading ativo");
      return;
    }
    
    if (onSocialLogin) {
      console.log("🟣 FACEBOOK: Chamando onSocialLogin");
      try {
        await onSocialLogin('facebook');
        console.log("🟣 FACEBOOK: onSocialLogin executado com sucesso");
      } catch (error) {
        console.error("🟣 FACEBOOK: Erro em onSocialLogin:", error);
      }
    } else {
      console.error("🟣 FACEBOOK: onSocialLogin não definido!");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="h-10 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
        </svg>
        {loading ? "..." : "Google"}
      </Button>
      
      <Button
        variant="outline"
        onClick={handleFacebookLogin}
        disabled={loading}
        className="h-10 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48">
          <path fill="#3F51B5" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"></path>
          <path fill="#FFF" d="M34.368,25H31v13h-5V25h-3v-4h3v-2.41c0.002-3.508,1.459-5.59,5.592-5.59H35v4h-2.287C31.104,17,31,17.6,31,18.723V21h4L34.368,25z"></path>
        </svg>
        {loading ? "..." : "Facebook"}
      </Button>
    </div>
  );
};

export default SocialAuthButtons;
