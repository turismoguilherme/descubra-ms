
import React, { useEffect, useState } from "react";
import { platformContentService } from "@/services/admin/platformContentService";
import { GUATA_DEFAULT_SUGGESTION_QUESTIONS } from "@/components/guata/guataSuggestionDefaults";
import { cn } from "@/lib/utils";

interface SuggestionQuestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  suggestionsOverride?: string[];
  /**
   * sidebar: grade vertical (desktop, coluna lateral).
   * carousel: chips horizontais com scroll lateral (legado).
   * inline: grade 2x3 dentro do painel do chat (mobile/totem).
   */
  variant?: "sidebar" | "carousel" | "inline";
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

const SuggestionQuestions = ({
  onSuggestionClick,
  suggestionsOverride,
  variant = "sidebar",
}: SuggestionQuestionsProps) => {
  const hasOverride = Array.isArray(suggestionsOverride) && suggestionsOverride.length > 0;
  const [items, setItems] = useState<string[]>(
    hasOverride ? suggestionsOverride : GUATA_DEFAULT_SUGGESTION_QUESTIONS
  );
  const [loading, setLoading] = useState(!hasOverride);

  useEffect(() => {
    if (hasOverride) {
      setItems(suggestionsOverride);
      setLoading(false);
      return;
    }

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
  }, [hasOverride, suggestionsOverride]);

  if (loading) {
    if (variant === "inline") {
      return (
        <div className="w-full animate-pulse">
          <div className="h-3 w-40 bg-white/20 rounded mb-2" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-white/20" />
            ))}
          </div>
        </div>
      );
    }
    if (variant === "carousel") {
      return (
        <div className="w-full overflow-x-auto scrollbar-none">
          <div className="flex gap-2 px-1 py-2 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 w-48 flex-shrink-0 rounded-full bg-white/20" />
            ))}
          </div>
        </div>
      );
    }
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

  if (variant === "carousel") {
    return (
      <div
        className="w-full overflow-x-auto overscroll-x-contain snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        aria-label="Sugestões de perguntas"
      >
        <style>{`
          .guata-chip-carousel::-webkit-scrollbar { display: none; }
        `}</style>
        <div className="guata-chip-carousel flex gap-2 px-1 py-2 w-max">
          {items.map((text, idx) => (
            <button
              key={`${idx}-${text.slice(0, 24)}`}
              type="button"
              onClick={() => onSuggestionClick(text)}
              className={cn(
                "snap-start flex-shrink-0 max-w-[18rem]",
                "rounded-full border border-white/30 bg-white/10 backdrop-blur",
                "px-4 py-2 text-sm text-white whitespace-nowrap",
                "hover:bg-white/20 hover:border-white/50 active:scale-95",
                "transition-all"
              )}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    const displayItems = items.slice(0, 6);
    return (
      <div className="w-full" aria-label="Sugestões de perguntas">
        <p className="text-xs text-gray-400 mb-2 px-1">Sugestões de perguntas:</p>
        <div className="grid grid-cols-2 gap-2">
          {displayItems.map((text, idx) => (
            <button
              key={`${idx}-${text.slice(0, 24)}`}
              type="button"
              onClick={() => onSuggestionClick(text)}
              className={cn(
                "rounded-lg border border-white/20 bg-white/10 backdrop-blur",
                "px-3 py-2.5 text-sm text-white text-left leading-snug",
                "hover:bg-white/20 hover:border-white/40 active:scale-[0.98]",
                "transition-all min-h-[3rem]"
              )}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    );
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
