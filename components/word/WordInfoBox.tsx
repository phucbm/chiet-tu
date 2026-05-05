"use client";

import type {CharEntry} from "@/lib/types";

interface WordInfoBoxProps {
  entry: CharEntry;
}

export function WordInfoBox({ entry }: WordInfoBoxProps) {
    const showTrad = entry.trad && entry.trad !== entry.char;

  return (
    <>
      <div className="relative w-full rounded-lg shadow bg-white p-3">

        {/* Giản thể / Phồn thể */}
          <div className="flex flex-wrap justify-evenly gap-3 mb-5">
              <div className="flex flex-col justify-center items-center">
                  <span className="text-sm text-muted-foreground mb-1 text-center">
                      Giản thể
                  </span>
                  <span className="simp font-chinese md:text-8xl text-6xl leading-none select-all">
                {entry.char}
              </span>
              </div>
              {showTrad && (
                  <div className="flex flex-col justify-center items-center">
                      <span className="text-sm text-muted-foreground mb-1 text-center">Phồn thể</span>
                      <span
                          className="simp font-chinese md:text-8xl text-6xl leading-none select-all text-green-500">
                {entry.trad}
              </span>
                  </div>
              )}
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
    </>
  );
}
