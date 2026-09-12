import { useEffect, useState, useSyncExternalStore } from "react";

import { deactivateSmudges, getSeed, subscribe } from "../utils/smudgeStore";

import { generateSmudgeSet } from "../utils/smudgeGenerator";

import type { SmudgeBlob, SmudgeRect } from "../utils/smudgeGenerator";

import "./SmudgeOverlay.css";

function measureRects(): SmudgeRect[] {
    const rects: SmudgeRect[] = [];

    const rectOf = (el: Element) => {
        const r = el.getBoundingClientRect();

        if (r.width <= 0 || r.height <= 0) {
            return;
        }

        rects.push({
            l: r.left,
            t: r.top,
            r: r.right,
            b: r.bottom,
        });
    };

    document
        .querySelectorAll(".main-content")
        .forEach(rectOf);

    document.querySelectorAll(".tool-card").forEach(rectOf);

    document
        .querySelectorAll(
            ".generate-button, .form-select, .proc-input, .pwd-input, .shy-input, .npc-input, .level-button, .shy-button-big"
        )
        .forEach(rectOf);

    return rects;
}

function SmudgeOverlay() {
    const seed = useSyncExternalStore(subscribe, getSeed);

    const [blobs, setBlobs] = useState<SmudgeBlob[]>([]);
    const [film, setFilm] = useState<number>(0);

    useEffect(() => {
        let scheduled = false;

        const recompute = () => {
            scheduled = false;

            const set = generateSmudgeSet(
                measureRects(),
                seed
            );

            setBlobs(set.blobs);
            setFilm(set.film);
        };

        const schedule = () => {
            if (scheduled) {
                return;
            }

            scheduled = true;

            requestAnimationFrame(recompute);
        };

        recompute();

        window.addEventListener("resize", schedule);
        window.addEventListener("scroll", schedule, {
            passive: true,
        });

        const root = document.getElementById("root");
        const observer = root
            ? new MutationObserver(schedule)
            : null;

        if (observer && root !== null) {
            observer.observe(root, {
                childList: true,
                subtree: true,
            });
        }

        return () => {
            window.removeEventListener("resize", schedule);
            window.removeEventListener("scroll", schedule);
            observer?.disconnect();
        };
    }, [seed]);

    return (
        <>
            <svg
                className="smudge-overlay"
                aria-hidden="true"
            >
                <defs>
                    <filter
                        id="smudge-blur"
                        x="-40%"
                        y="-40%"
                        width="180%"
                        height="180%"
                    >
                        <feGaussianBlur stdDeviation="2.6" />
                    </filter>

                    <filter
                        id="smudge-wobble"
                        x="-40%"
                        y="-40%"
                        width="180%"
                        height="180%"
                    >
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.035"
                            numOctaves="3"
                            result="noise"
                        />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale="16"
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>

                    <pattern
                        id="smudge-dust-pattern"
                        width="150"
                        height="150"
                        patternUnits="userSpaceOnUse"
                    >
                        <circle
                            cx="20"
                            cy="34"
                            r="1.1"
                            className="smudge-dust-dot"
                            opacity="0.7"
                        />
                        <circle
                            cx="72"
                            cy="78"
                            r="1.5"
                            className="smudge-dust-dot"
                            opacity="0.5"
                        />
                        <circle
                            cx="118"
                            cy="42"
                            r="0.9"
                            className="smudge-dust-dot"
                            opacity="0.8"
                        />
                        <circle
                            cx="46"
                            cy="112"
                            r="1.2"
                            className="smudge-dust-dot"
                            opacity="0.45"
                        />
                        <circle
                            cx="132"
                            cy="126"
                            r="0.8"
                            className="smudge-dust-dot"
                            opacity="0.6"
                        />
                        <circle
                            cx="14"
                            cy="86"
                            r="0.7"
                            className="smudge-dust-dot"
                            opacity="0.5"
                        />
                    </pattern>
                </defs>

                <rect
                    className="smudge-film"
                    width="100%"
                    height="100%"
                    fill="url(#smudge-dust-pattern)"
                    opacity={film}
                />

                {blobs.map((blob, index) => {
                    if (blob.type === "fingerprint") {
                        return (
                            <g
                                key={`${blob.type}-${index}`}
                                transform={`translate(${blob.x} ${blob.y}) rotate(${blob.rotation}) scale(${blob.scale})`}
                                opacity={blob.opacity}
                                filter="url(#smudge-blur)"
                            >
                                <ellipse
                                    cx="0"
                                    cy="2"
                                    rx="34"
                                    ry="26"
                                    className="smudge-fingerprint-base"
                                />

                                {blob.arcs.map((d, arcIndex) => (
                                    <path
                                        key={arcIndex}
                                        d={d}
                                        fill="none"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        className="smudge-fingerprint-line"
                                    />
                                ))}
                            </g>
                        );
                    }

                    if (blob.type === "coffee") {
                        return (
                            <g
                                key={`${blob.type}-${index}`}
                                transform={`translate(${blob.x} ${blob.y}) rotate(${blob.rotation})`}
                                opacity={blob.opacity}
                            >
                                <ellipse
                                    cx="0"
                                    cy="0"
                                    rx={blob.radius}
                                    ry={blob.radius * 1.08}
                                    className="smudge-coffee-ring"
                                />

                                <ellipse
                                    cx="0"
                                    cy="0"
                                    rx={blob.radius * 0.62}
                                    ry={blob.radius * 0.7}
                                    className="smudge-coffee-fill"
                                    filter="url(#smudge-blur)"
                                />
                            </g>
                        );
                    }

                    return (
                        <circle
                            key={`${blob.type}-${index}`}
                            cx={blob.x}
                            cy={blob.y}
                            r={blob.r}
                            className="smudge-dust-dot"
                            opacity={blob.opacity}
                        />
                    );
                })}
            </svg>

            <button
                type="button"
                className="smudge-remove"
                onClick={deactivateSmudges}
            >
                Remove smudges
            </button>
        </>
    );
}

export default SmudgeOverlay;