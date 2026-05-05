"use client";

import {useEffect, useRef, useState} from "react";
import {RotateCcw} from "lucide-react";
import {Switch} from "@/components/ui/switch";
import {cn} from "@/lib/utils";

declare global {
    interface Window {
        HanziWriter: {
            create: (
                el: HTMLElement,
                char: string,
                options: Record<string, unknown>
            ) => { animateCharacter: () => void }
        }
    }
}

interface StrokeBoxProps {
    char?: string; // display single char without toggle
    simp: string;
    trad: string;
    defaultTrad?: boolean;
    onAvailabilityChange?: (available: boolean) => void;
}

export function StrokeBox({char: singleChar, simp, trad, defaultTrad = false, onAvailabilityChange}: StrokeBoxProps) {
    const hasDifferentTrad = trad && trad !== simp;
    const [tradAvailable, setTradAvailable] = useState(defaultTrad);
    const [useTrad, setUseTrad] = useState(defaultTrad);
    const character = singleChar ?? (useTrad ? trad : simp);
    const [dataAvailable, setDataAvailable] = useState(false);
    const [loading, setLoading] = useState(true);

    const writerRef = useRef<{ animateCharacter: () => void } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const generationRef = useRef(0);

    useEffect(() => {
        setLoading(true);
        setDataAvailable(false);
    }, [character]);

    useEffect(() => {
        if (!hasDifferentTrad) return;
        fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${trad}.json`, {method: "HEAD"})
            .then(r => setTradAvailable(r.ok))
            .catch(() => setTradAvailable(false));
    }, [trad, hasDifferentTrad]);

    useEffect(() => {
        const gen = ++generationRef.current;
        let cancelled = false;

        const timeout = setTimeout(() => {
            const el = containerRef.current;
            if (!el || cancelled) return;

            function init() {
                if (!el || !window.HanziWriter || cancelled) return;
                writerRef.current = window.HanziWriter.create(el, character, {
                    width: 140,
                    height: 140,
                    padding: 5,
                    showOutline: true,
                    strokeAnimationSpeed: 1,
                    delayBetweenStrokes: 150,
                    strokeColor: '#23264e',
                    radicalColor: 'rgb(126,110,232)',
                    outlineColor: '#ccc',
                    onLoadCharDataSuccess: () => {
                        if (cancelled) return;
                        setLoading(false);
                        setDataAvailable(true);
                    },
                    onLoadCharDataError: () => {
                        if (cancelled) return;
                        setLoading(false);
                        setDataAvailable(false);
                    },
                    renderer: 'canvas'
                });
                writerRef.current?.animateCharacter();
            }

            if (window.HanziWriter) {
                init();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js';
            script.onload = init;
            document.head.appendChild(script);
        }, 100);

        return () => {
            cancelled = true;
            clearTimeout(timeout);
            writerRef.current = null;
        };
    }, [character]);

    return (
        <div className="rounded-lg shadow bg-white p-3 flex flex-col items-center gap-3 relative">
            <div className="absolute top-1 right-1 z-20 flex items-center justify-end w-full">
                <button
                    type="button"
                    title="Xem lại"
                    onClick={() => writerRef.current?.animateCharacter()}
                    className={cn("p-1 rounded hover:bg-background/50",
                        !dataAvailable && "invisible"
                    )}
                >
                    <RotateCcw className="h-3.5 w-3.5 opacity-60 hover:opacity-100"/>
                </button>
            </div>
            <div
                ref={containerRef}
                className="flex items-center justify-center"
                style={{width: 140, height: 140}}
                aria-label={`Hoạt ảnh nét chữ: ${character}`}
            >
                {loading && (
                    <div className="rounded border-2 border-dashed border-muted animate-pulse font-chinese text-6xl text-muted-foreground/30">
                        {character}
                    </div>
                )}
                {!loading && !dataAvailable && (
                    <span className="font-chinese text-6xl leading-none select-all text-muted-foreground/50">
                        {character}
                    </span>
                )}
            </div>
            {!dataAvailable && (
            <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {useTrad ? "Phồn thể" : "Giản thể"}
        </span>
                {!singleChar && (
                <Switch
                    checked={useTrad}
                    onCheckedChange={setUseTrad}
                />
                )}
            </div>
            )}
        </div>
    );
}