import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useKodaInput = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const { toast } = useToast();

  const handleKeyDown = (e: React.KeyboardEvent, callback?: () => void) => {
    if (e.key === 'Enter' && inputMessage.trim() !== "" && callback) {
      callback();
    }
  };

  const toggleMicrophone = () => {
    if (!isRecordingAudio) {
      toast({
        title: "🎤 Voice Recording",
        description: "This feature will be available in a future update. For now, please use the keyboard to chat with Koda!",
        duration: 4000,
      });
    }
    setIsRecordingAudio(!isRecordingAudio);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  return {
    inputMessage,
    setInputMessage,
    isRecordingAudio,
    toggleMicrophone,
    handleKeyDown,
    handleSuggestionClick
  };
};
