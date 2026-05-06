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
            ) => {
                animateCharacter: () => void;
                hideCharacter: () => void;
                showCharacter: () => void;
                updateColor: (target: string, color: string) => void;
                setCharacter: (char: string) => void;
                clear: () => void;
            }
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

    const writerRef = useRef<{ animateCharacter: () => void; clear?: () => void } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const generationRef = useRef(0);
    const [containerKey, setContainerKey] = useState(0);

    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;

        const observer = new ResizeObserver(() => {
            setContainerKey(k => k + 1);
        });
        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        onAvailabilityChange?.(dataAvailable);
    }, [dataAvailable, onAvailabilityChange]);

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
                const size = el.clientWidth || 140; // use container width
                writerRef.current = window.HanziWriter.create(el, character, {
                    width: size,
                    height: size,
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
    }, [character, containerKey]);

    return (
        <div>
            <div
                className="rounded-lg md:w-[200px] w-[140px] overflow-hidden shadow bg-white flex flex-col items-center gap-3 relative">
                {/*redraw*/}
                {
                    dataAvailable && (
                        <div className="absolute top-1 right-1 z-20">
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
                <div ref={wrapperRef} className="relative w-full aspect-square">
                    {/*draw grid*/}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="flex justify-evenly absolute inset-0">
                            <i className="border border-dashed"></i>
                            <i className="border"></i>
                            <i className="border border-dashed"></i>
                        </div>
                        <div className="flex flex-col justify-evenly absolute inset-0">
                            <i className="border border-dashed"></i>
                            <i className="border"></i>
                            <i className="border border-dashed"></i>
                        </div>
                    </div>
                    {/*canvas*/}
                    <div
                        ref={containerRef}
                        key={containerKey}
                        className="absolute inset-0 size-full flex justify-center items-center"
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