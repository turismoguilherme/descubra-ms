import { useEffect, useRef } from "react";
import {
  consumeGuataPendingContext,
  getGuataResumePrompt,
  type GuataPendingMessage,
} from "@/utils/guataPendingAction";

/**
 * Após login, retoma ação transacional pendente do Guatá.
 */
export function useGuataPendingResume(
  userId: string | undefined,
  onResume: (
    prompt: string,
    restoredHistory: string[],
    restoredMessages: GuataPendingMessage[],
  ) => void,
) {
  const resumedRef = useRef(false);

  useEffect(() => {
    if (!userId || resumedRef.current) return;

    const pending = consumeGuataPendingContext();
    if (!pending) return;

    resumedRef.current = true;
    onResume(getGuataResumePrompt(pending.action), pending.history, pending.messages);
  }, [userId, onResume]);
}
