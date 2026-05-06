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
        <div>
            <div className="rounded-lg overflow-hidden shadow bg-white flex flex-col items-center gap-3 relative">
                {/*redraw*/}
                {
                    dataAvailable && (
                        <div className="absolute top-1 right-1 z-20 flex items-center justify-end w-full">
                            <button
                                type="button"
                                title="Xem lại"
                                onClick={() => writerRef.current?.animateCharacter()}
                                className={cn("p-1 rounded hover:bg-background/50 opacity-30")}
                            >
                                <RotateCcw className="h-3.5 w-3.5 opacity-60 hover:opacity-100"/>
                            </button>
                        </div>
                    )
                }
                <div className="relative" style={{width: 140, height: 140}}>
                    {/*draw grid*/}
                    <svg
                        className="stroke-draw-grid absolute inset-0 w-full h-full"
                        viewBox="0 0 140 140"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <line className="stroke-draw-grid__line--vertical-1 opacity-40" x1="35" y1="0" x2="35" y2="140" stroke="#d1d5db" strokeWidth="0.75"/>
                        <line className="stroke-draw-grid__line--vertical-2" x1="70" y1="0" x2="70" y2="140" stroke="#d1d5db" strokeWidth="0.75"/>
                        <line className="stroke-draw-grid__line--vertical-3 opacity-40" x1="105" y1="0" x2="105" y2="140" stroke="#d1d5db" strokeWidth="0.75"/>

                        <line className="stroke-draw-grid__line--horizontal-1 opacity-40" x1="0" y1="35" x2="140" y2="35" stroke="#d1d5db" strokeWidth="0.75"/>
                        <line className="stroke-draw-grid__line--horizontal-2" x1="0" y1="70" x2="140" y2="70" stroke="#d1d5db" strokeWidth="0.75"/>
                        <line className="stroke-draw-grid__line--horizontal-3 opacity-40" x1="0" y1="105" x2="140" y2="105" stroke="#d1d5db" strokeWidth="0.75"/>
                    </svg>
                    {/*canvas*/}
                    <div
                        ref={containerRef}
                        className="absolute inset-0 size-full flex justify-center items-center"
                        style={{width: 140, height: 140}}
                        aria-label={`Hoạt ảnh nét chữ: ${character}`}
                    >
                        {loading || !dataAvailable && (
                            <div
                                className="absolute inset-0 size-full flex justify-center items-center font-chinese md:text-8xl text-6xl">
                                {character}
                            </div>
                        )}

                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center text-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">
                      {useTrad ? "Phồn thể" : "Giản thể"}
                    </span>
                {!singleChar && (
                    <Switch
                        checked={useTrad}
                        onCheckedChange={setUseTrad}
                    />
                )}
            </div>
        </div>
    );
}