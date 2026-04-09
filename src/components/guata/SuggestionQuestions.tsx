
import React, { useEffect, useState } from "react";
import { platformContentService } from "@/services/admin/platformContentService";
import { GUATA_DEFAULT_SUGGESTION_QUESTIONS } from "@/components/guata/guataSuggestionDefaults";

interface SuggestionQuestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

function parseSuggestionJson(raw: string | null | undefined): string[] {
  if (!raw || !String(raw).trim()) return [];
  try {
    const parsed = JSON.parse(String(raw));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => (typeof x === "string" ? x.trim() : String(x).trim()))
      .filter(Boolean);
  } catch {
    return [];
  }
}

const SuggestionQuestions = ({ onSuggestionClick }: SuggestionQuestionsProps) => {
  const [items, setItems] = useState<string[]>(GUATA_DEFAULT_SUGGESTION_QUESTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await platformContentService.getContent(["guata_chat_suggestion_questions"]);
        const row = rows.find((r) => r.content_key === "guata_chat_suggestion_questions");
        const fromDb = parseSuggestionJson(row?.content_value ?? null);
        if (!cancelled) {
          setItems(fromDb.length > 0 ? fromDb : GUATA_DEFAULT_SUGGESTION_QUESTIONS);
        }
      } catch {
        if (!cancelled) setItems(GUATA_DEFAULT_SUGGESTION_QUESTIONS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <h3 className="text-xl font-semibold text-white mb-4">Sugestões de perguntas:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-white/20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h3 className="text-xl font-semibold text-white mb-4">Sugestões de perguntas:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((text, idx) => (
          <button
            key={`${idx}-${text.slice(0, 24)}`}
            type="button"
            className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md text-left text-gray-700 transition-all hover:bg-ms-guavira-purple/5"
            onClick={() => onSuggestionClick(text)}
          >
            &quot;{text}&quot;
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionQuestions;
