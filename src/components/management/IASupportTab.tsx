
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { IASupportTabProps } from "./ia-support/types";
import { useIASupport } from "./ia-support/useIASupport";
import ConversationMessages from "./ia-support/ConversationMessages";
import MessageInput from "./ia-support/MessageInput";
import SuggestionQuestions from "./ia-support/SuggestionQuestions";
import ExportConversation from "./ia-support/ExportConversation";
import AboutSupport from "./ia-support/AboutSupport";

const IASupportTab = ({ isAttendant }: IASupportTabProps) => {
  const {
    iaQuery,
    setIaQuery,
    conversations,
    isLoading,
    isExporting,
    messagesEndRef,
    handleIAQuery,
    handleKeyDown,
    handleFeedback,
    handleExportConversation
  } = useIASupport();

  // This tab should only be displayed for attendants
  if (!isAttendant) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">IA de Suporte ao Atendimento</CardTitle>
        <ExportConversation 
          conversations={conversations}
          isExporting={isExporting}
          isLoading={isLoading}
          handleExportConversation={handleExportConversation}
        />
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto mb-4">
            <ConversationMessages 
              conversations={conversations}
              onFeedback={handleFeedback}
              messagesEndRef={messagesEndRef}
              showSources={true} // Apenas para os atendentes vemos as fontes
            />
          </div>
          
          <MessageInput 
            iaQuery={iaQuery}
            setIaQuery={setIaQuery}
            handleIAQuery={handleIAQuery}
            isLoading={isLoading}
            handleKeyDown={handleKeyDown}
          />
          
          <SuggestionQuestions setIaQuery={setIaQuery} />
          <AboutSupport />
        </div>
      </CardContent>
    </Card>
  );
};

export default IASupportTab;
