"use client";

import type {CharEntry} from "@/lib/types";
import {StrokeBox} from "@/components/word/StrokeBox";

interface WordInfoBoxProps {
  entry: CharEntry;
}

export function WordInfoBox({ entry }: WordInfoBoxProps) {
    const showTrad = entry.trad && entry.trad !== entry.char;

  return (
      <div className="relative w-full rounded-lg bg-ct-highlight p-4">

        {/* Stroke boxes */}
        <div className="flex flex-wrap justify-evenly gap-4 mb-5">
          <StrokeBox char={entry.char} simp={entry.char} trad={entry.trad ?? entry.char} />
          {showTrad && <StrokeBox char={entry.trad!} simp={entry.char} trad={entry.trad ?? entry.char} defaultTrad />}
        </div>

        {/* Bính âm / Hán Việt */}
          <p className="text-sm text-muted-foreground mb-1 text-center">
          Bính âm - Hán Việt
        </p>
          <div className="flex items-baseline justify-center gap-3 text-center">
          <span className="text-xl text-muted-foreground">{entry.pinyin}</span>
          {entry.sino_vietnamese ? (
            <span className="text-lg font-medium text-primary">
              {entry.sino_vietnamese}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground italic font-chinese">[{entry.char}]</span>
          )}
        </div>
      </div>
  );
}
