"use client";

import {useEffect, useRef, useState} from "react";
import {RotateCcw} from "lucide-react";
import {Switch} from "@/components/ui/switch";

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
    simp: string;
    trad: string;
    defaultTrad?: boolean;
}

export function StrokeBox({simp, trad, defaultTrad = false}: StrokeBoxProps) {
    const hasDifferentTrad = trad && trad !== simp;
    const [tradAvailable, setTradAvailable] = useState(defaultTrad);
    const [useTrad, setUseTrad] = useState(defaultTrad);
    const character = useTrad ? trad : simp;

    useEffect(() => {
        if (!hasDifferentTrad) return;
        fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${trad}.json`, {method: "HEAD"})
            .then(r => setTradAvailable(r.ok))
            .catch(() => setTradAvailable(false));
    }, [trad, hasDifferentTrad]);

    const writerRef = useRef<{ animateCharacter: () => void } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const generationRef = useRef(0);
    const [available, setAvailable] = useState(true);

    useEffect(() => {
        const gen = ++generationRef.current;
        const timeout = setTimeout(() => {
            const el = containerRef.current;
            if (!el) return;
            el.innerHTML = "";
            setAvailable(true);

            function init() {
                if (!el || !window.HanziWriter) return;
                el.innerHTML = "";
                writerRef.current = window.HanziWriter.create(el, character, {
                    width: 140,
                    height: 140,
                    padding: 5,
                    showOutline: true,          // show/hide ghost outline on first render
                    strokeAnimationSpeed: 1,    // speed multiplier (> 0)
                    delayBetweenStrokes: 150,   // ms pause between strokes

                    // showCharacter: true       // show/hide final character after animation
                    // strokeFadeDuration: 400   // ms transition time when strokes appear/disappear
                    // delayBetweenLoops: 2000   // ms between animation loops (for looping)
                    strokeColor: '#23264e',        // color of drawn strokes
                    radicalColor: 'rgb(126,110,232)',         // separate color for radical
                    outlineColor: '#ccc',      // outline color
                    // drawingColor: '#333'      // user-drawn line color in quiz
                    // drawingWidth: 4            // width of user-drawn lines
                    // highlightCompleteColor: null  // completion flash color
                    // charDataLoader: null      // custom character data loader
                    // onLoadCharDataSuccess: null  // callback on data load success
                    // onLoadCharDataError: null   // callback on data load error
                    renderer: 'canvas'            // 'svg' or 'canvas'
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
        return () => clearTimeout(timeout);
    }, [character]);

    return (
        <div
            className={`rounded-lg shadow bg-white p-3 flex flex-col items-center gap-3 relative ${available ? "" : "hidden"}`}>
            <div className="flex items-center justify-end w-full">
                <button
                    type="button"
                    title="Xem lại"
                    onClick={() => writerRef.current?.animateCharacter()}
                    className="opacity-60 hover:opacity-100 p-1 rounded hover:bg-background/50"
                >
                    <RotateCcw className="h-3.5 w-3.5"/>
                </button>
            </div>
            <div
                ref={containerRef}
                style={{width: 140, height: 140}}
                aria-label={`Hoạt ảnh nét chữ: ${character}`}
            />
            <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {useTrad ? "Phồn thể" : "Giản thể"}
        </span>
                <Switch
                    checked={useTrad}
                    onCheckedChange={setUseTrad}
                />
            </div>
        </div>
    );
}