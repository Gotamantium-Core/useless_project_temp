import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import type {
    ChangeEvent,
    DragEvent,
    PointerEvent,
} from "react";

import "./SlingshotSlider.css";

const BALL_RADIUS = 26;
const MAX_PULL = 190;
const MAX_SPEED = 4200;
const AIR_DAMPING = 0.985;
const WALL_RESTITUTION = 0.82;
const SETTLE_SPEED = 14;
const FLIGHT_LIMIT_MS = 14000;
const OVERPULL_POWER = 0.62;
const PHYSICS_DT = 1 / 120;
const MAX_CATCH_UP_MS = 250;

interface Vec {
    x: number;
    y: number;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function verdictFor(volume: number, overpull: boolean): string {
    const base =
        volume >= 85
            ? "EAR-PIERCING. Permanence not guaranteed."
            : volume >= 60
              ? "Loud. Your neighbors are taking notes."
              : volume >= 30
                ? "Pedestrian. Exciting as a toaster manual."
                : "A whisper. Your speakers respectfully disagree.";

    return overpull ? `Overpull detected — ${base}` : base;
}

function SlingshotSlider() {
    const [phase, setPhase] = useState<
        "idle" | "aiming" | "flying" | "settled"
    >("idle");
    const [volume, setVolume] = useState(0);
    const [verdict, setVerdict] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [randomOffsetPct, setRandomOffsetPct] = useState<number | null>(null);
    const [launches, setLaunches] = useState(0);
    const [peakVolume, setPeakVolume] = useState(0);
    const [muted, setMuted] = useState(false);

    const sceneRef = useRef<SVGSVGElement>(null);
    const forkRef = useRef<SVGGElement>(null);
    const maxRingRef = useRef<SVGCircleElement>(null);
    const ringRef = useRef<SVGCircleElement>(null);
    const bandARef = useRef<SVGLineElement>(null);
    const bandBRef = useRef<SVGLineElement>(null);
    const ballRef = useRef<HTMLDivElement>(null);
    const powerRef = useRef<HTMLDivElement>(null);
    const volTextRef = useRef<HTMLSpanElement>(null);
    const markerRef = useRef<HTMLDivElement>(null);
    const railRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const viewRef = useRef({
        w: window.innerWidth,
        h: window.innerHeight,
    });
    const anchorRef = useRef<Vec>({ x: 0, y: 0 });
    const tipARef = useRef<Vec>({ x: 0, y: 0 });
    const tipBRef = useRef<Vec>({ x: 0, y: 0 });
    const ballPosRef = useRef<Vec>({ x: 0, y: 0 });
    const ballVelRef = useRef<Vec>({ x: 0, y: 0 });
    const aimTargetRef = useRef<Vec>({ x: 0, y: 0 });
    const rollRef = useRef(0);
    const railWidthRef = useRef(0);
    const aimRef = useRef(false);
    const overpullRef = useRef(false);
    const offsetRef = useRef<number | null>(null);
    const phaseRef = useRef(phase);
    const mutedRef = useRef(muted);
    const mountedRef = useRef(false);
    const rafRef = useRef<number | null>(null);
    const aimRafRef = useRef<number | null>(null);
    const objectUrlRef = useRef<string | null>(null);
    const toneRef = useRef<{
        ctx: AudioContext;
        osc: OscillatorNode;
        gain: GainNode;
    } | null>(null);

    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);

    useEffect(() => {
        mutedRef.current = muted;
    }, [muted]);

    const getVolumeFromX = useCallback((x: number): number => {
        const { w } = viewRef.current;
        const { x: ax } = anchorRef.current;
        const span = Math.max(1, w - ax - BALL_RADIUS);

        return clamp(((x - ax) / span) * 100, 0, 100);
    }, []);

    const syncScene = useCallback(() => {
        const b = ballPosRef.current;

        if (ballRef.current) {
            const roll = (rollRef.current / BALL_RADIUS) * (180 / Math.PI);

            ballRef.current.style.transform =
                `translate3d(${b.x}px, ${b.y}px, 0) rotate(${roll}deg)`;
        }

        if (bandARef.current) {
            bandARef.current.setAttribute("x2", String(b.x));
            bandARef.current.setAttribute("y2", String(b.y));
        }

        if (bandBRef.current) {
            bandBRef.current.setAttribute("x2", String(b.x));
            bandBRef.current.setAttribute("y2", String(b.y));
        }
    }, []);

    const updateTrack = useCallback((v: number) => {
        if (volTextRef.current) {
            volTextRef.current.textContent = `${Math.round(v)}%`;
        }

        if (markerRef.current) {
            const pct = clamp(v, 0, 100) / 100;
            const x = railWidthRef.current * pct - 9;

            markerRef.current.style.transform =
                `translate3d(${x}px, -50%, 0)`;
        }
    }, []);

    const layout = useCallback(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        viewRef.current = { w, h };

        const ax = clamp(w * 0.16, 110, 250);
        const ay = Math.max(170, h - 110);

        anchorRef.current = { x: ax, y: ay };
        tipARef.current = { x: ax - 26, y: ay - 50 };
        tipBRef.current = { x: ax + 26, y: ay - 50 };

        if (sceneRef.current) {
            sceneRef.current.setAttribute("width", String(w));
            sceneRef.current.setAttribute("height", String(h));
        }

        if (forkRef.current) {
            forkRef.current.setAttribute(
                "transform",
                `translate(${ax}, ${ay})`
            );
        }

        if (maxRingRef.current) {
            maxRingRef.current.setAttribute("cx", String(ax));
            maxRingRef.current.setAttribute("cy", String(ay));
            maxRingRef.current.setAttribute("r", String(MAX_PULL));
        }

        if (bandARef.current) {
            bandARef.current.setAttribute("x1", String(tipARef.current.x));
            bandARef.current.setAttribute("y1", String(tipARef.current.y));
        }

        if (bandBRef.current) {
            bandBRef.current.setAttribute("x1", String(tipBRef.current.x));
            bandBRef.current.setAttribute("y1", String(tipBRef.current.y));
        }

        railWidthRef.current = railRef.current?.offsetWidth ?? 0;

        if (phaseRef.current !== "flying" && !aimRef.current) {
            ballPosRef.current = { x: ax, y: ay };
        }

        syncScene();
    }, [syncScene]);

    const applyVolume = useCallback((v: number) => {
        const pct = clamp(v, 0, 100) / 100;
        const g = Math.pow(pct, 1.6);

        if (audioRef.current && audioRef.current.src) {
            audioRef.current.volume = mutedRef.current ? 0 : g * 0.9;
        }

        if (toneRef.current) {
            const hasSong = Boolean(audioRef.current?.src);
            toneRef.current.gain.gain.value = mutedRef.current
                ? 0
                : hasSong
                  ? 0
                  : g * 0.35;

            if (!hasSong) {
                toneRef.current.osc.frequency.value =
                    180 + pct * 260;
            }
        }
    }, []);

    const ensureTone = useCallback(() => {
        if (toneRef.current) {
            return;
        }

        try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sawtooth";
            osc.frequency.value = 180;
            gain.gain.value = 0;

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            toneRef.current = { ctx, osc, gain };
        } catch {
            toneRef.current = null;
        }
    }, []);

    const startSongAt = useCallback((percent: number): boolean => {
        const audio = audioRef.current;

        if (
            !audio ||
            !audio.src ||
            !Number.isFinite(audio.duration) ||
            audio.duration <= 0
        ) {
            return false;
        }

        const time = percent * audio.duration;
        const maxStart = Math.max(0, audio.duration - 1);

        audio.currentTime = Math.min(time, maxStart);
        audio.play().catch(() => undefined);

        return true;
    }, []);

    const pickOverpullVolume = useCallback((): number => {
        if (Math.random() < 0.72) {
            return 78 + Math.round(Math.random() * 22);
        }

        return Math.round(Math.random() * 100);
    }, []);

    const finishFlight = useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        const pos = ballPosRef.current;

        let final = getVolumeFromX(pos.x);
        let snap = false;

        if (overpullRef.current) {
            final = pickOverpullVolume();
            snap = true;
        }

        final = clamp(Math.round(final), 0, 100);

        setVolume(final);
        setVerdict(verdictFor(final, overpullRef.current));
        setPeakVolume((peak) => Math.max(peak, final));

        applyVolume(final);
        updateTrack(final);

        if (snap) {
            const { w } = viewRef.current;
            const { x: ax } = anchorRef.current;
            const span = Math.max(1, w - ax - BALL_RADIUS);
            const targetX = ax + (final / 100) * span;

            const tween = (): void => {
                const d = targetX - pos.x;

                if (Math.abs(d) < 0.5 || !mountedRef.current) {
                    pos.x = targetX;
                    syncScene();
                    return;
                }

                pos.x += d * 0.14;
                syncScene();
                rafRef.current = requestAnimationFrame(tween);
            };

            rafRef.current = requestAnimationFrame(tween);
        }

        if (ballRef.current) {
            ballRef.current.style.pointerEvents = "auto";
        }

        setPhase("settled");
    }, [applyVolume, getVolumeFromX, pickOverpullVolume, syncScene, updateTrack]);

    const handleLaunch = useCallback(() => {
        if (aimRafRef.current !== null) {
            cancelAnimationFrame(aimRafRef.current);
            aimRafRef.current = null;
        }

        const pos = ballPosRef.current;
        const a = anchorRef.current;

        const dx = a.x - pos.x;
        const dy = a.y - pos.y;
        const dist = Math.hypot(dx, dy);
        const power = clamp(dist / MAX_PULL, 0, 1);
        const speed = MAX_SPEED * power * power;
        const n = dist === 0 ? 1 : dist;

        ballVelRef.current = {
            x: (dx / n) * speed,
            y: (dy / n) * speed,
        };

        overpullRef.current = power >= OVERPULL_POWER;

        setLaunches((count) => count + 1);
        setVolume(0);
        setVerdict(null);

        offsetRef.current = 0.12 + Math.random() * 0.78;
        const usedSong = startSongAt(offsetRef.current);

        setRandomOffsetPct(
            usedSong && offsetRef.current !== null
                ? Math.round(offsetRef.current * 100)
                : null
        );

        if (!usedSong) {
            ensureTone();
        }

        if (powerRef.current) {
            powerRef.current.style.display = "none";
        }

        if (ringRef.current) {
            ringRef.current.setAttribute("opacity", "0");
        }

        if (ballRef.current) {
            ballRef.current.style.pointerEvents = "none";
        }

        setPhase("flying");

        const started = performance.now();
        let accum = 0;
        let last = started;

        const step = (now: number): void => {
            if (!mountedRef.current) {
                return;
            }

            let frameMs = now - last;

            last = now;

            if (frameMs < 0) {
                frameMs = 0;
            } else if (frameMs > MAX_CATCH_UP_MS) {
                frameMs = MAX_CATCH_UP_MS;
            }

            if (now - started > FLIGHT_LIMIT_MS) {
                finishFlight();
                return;
            }

            accum += frameMs / 1000;

            const vel = ballVelRef.current;
            const p = ballPosRef.current;
            const { w, h } = viewRef.current;
            const damp = Math.pow(AIR_DAMPING, 60 * PHYSICS_DT);

            let guard = 0;

            while (accum >= PHYSICS_DT && guard < 40) {
                vel.x *= damp;
                vel.y *= damp;

                const stepDist =
                    Math.hypot(vel.x, vel.y) * PHYSICS_DT;
                const sub = Math.max(1, Math.ceil(stepDist / 4));
                const sx = (vel.x * PHYSICS_DT) / sub;
                const sy = (vel.y * PHYSICS_DT) / sub;

                for (let i = 0; i < sub; i += 1) {
                    p.x += sx;
                    p.y += sy;

                    if (p.x < BALL_RADIUS) {
                        p.x = BALL_RADIUS;
                        vel.x = Math.abs(vel.x) * WALL_RESTITUTION;
                    } else if (p.x > w - BALL_RADIUS) {
                        p.x = w - BALL_RADIUS;
                        vel.x = -Math.abs(vel.x) * WALL_RESTITUTION;
                    }

                    if (p.y < BALL_RADIUS) {
                        p.y = BALL_RADIUS;
                        vel.y = Math.abs(vel.y) * WALL_RESTITUTION;
                    } else if (p.y > h - BALL_RADIUS) {
                        p.y = h - BALL_RADIUS;
                        vel.y = -Math.abs(vel.y) * WALL_RESTITUTION;
                    }
                }

                rollRef.current += vel.x * PHYSICS_DT;

                accum -= PHYSICS_DT;
                guard += 1;

                if (Math.hypot(vel.x, vel.y) < SETTLE_SPEED) {
                    finishFlight();
                    return;
                }
            }

            syncScene();

            const v = getVolumeFromX(p.x);

            updateTrack(v);
            applyVolume(v);

            rafRef.current = requestAnimationFrame(step);
        };

        rafRef.current = requestAnimationFrame(step);
    }, [
        applyVolume,
        ensureTone,
        finishFlight,
        getVolumeFromX,
        startSongAt,
        syncScene,
        updateTrack,
    ]);

    function renderAimVisuals(power: number) {
        const b = ballPosRef.current;
        const ring = ringRef.current;

        if (ring) {
            ring.setAttribute("cx", String(b.x));
            ring.setAttribute("cy", String(b.y));
            ring.setAttribute("r", String(BALL_RADIUS + power * 18));
            ring.setAttribute("opacity", "1");
            ring.setAttribute(
                "stroke",
                power >= OVERPULL_POWER ? "#dc2626" : "#7c3aed"
            );
        }

        if (powerRef.current) {
            powerRef.current.style.display = "block";
            powerRef.current.style.left = String(b.x + 44);
            powerRef.current.style.top = String(b.y - 40);
            powerRef.current.textContent =
                power >= OVERPULL_POWER
                    ? `${Math.round(power * 100)}% (too far)`
                    : `${Math.round(power * 100)}%`;
        }
    }

    function cancelAimLoop() {
        if (aimRafRef.current !== null) {
            cancelAnimationFrame(aimRafRef.current);
            aimRafRef.current = null;
        }
    }

    function startAimLoop() {
        cancelAimLoop();

        let last = performance.now();

        const loop = (now: number): void => {
            if (!mountedRef.current || !aimRef.current) {
                return;
            }

            const dt = Math.min(0.05, (now - last) / 1000);

            last = now;

            const a = anchorRef.current;
            const t = aimTargetRef.current;
            const dx = t.x - a.x;
            const dy = t.y - a.y;
            const dist = Math.hypot(dx, dy);
            const pull = Math.min(dist, MAX_PULL);
            const nx = dist === 0 ? 0 : dx / dist;
            const ny = dist === 0 ? 0 : dy / dist;

            const desired = {
                x: a.x + nx * pull,
                y: a.y + ny * pull,
            };

            const p = ballPosRef.current;
            const k = 1 - Math.exp(-dt * 22);

            p.x += (desired.x - p.x) * k;
            p.y += (desired.y - p.y) * k;

            const power = clamp(
                Math.hypot(p.x - a.x, p.y - a.y) / MAX_PULL,
                0,
                1
            );

            overpullRef.current = power >= OVERPULL_POWER;

            renderAimVisuals(power);
            syncScene();

            aimRafRef.current = requestAnimationFrame(loop);
        };

        aimRafRef.current = requestAnimationFrame(loop);
    }

    function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
        if (phaseRef.current === "flying") {
            return;
        }

        e.preventDefault();

        aimRef.current = true;
        aimTargetRef.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);

        setPhase("aiming");

        startAimLoop();
    }

    function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
        if (!aimRef.current) {
            return;
        }

        aimTargetRef.current = { x: e.clientX, y: e.clientY };
    }

    function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
        if (!aimRef.current) {
            return;
        }

        aimRef.current = false;

        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }

        handleLaunch();
    }

    function handlePointerCancel(e: PointerEvent<HTMLDivElement>) {
        if (!aimRef.current) {
            return;
        }

        aimRef.current = false;

        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }

        handleLaunch();
    }

    function loadSong(file: File) {
        if (!file.type.startsWith("audio/")) {
            return;
        }

        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
        }

        const url = URL.createObjectURL(file);

        objectUrlRef.current = url;

        if (audioRef.current) {
            audioRef.current.src = url;
        }

        setFileName(file.name);
        setRandomOffsetPct(null);
    }

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (file) {
            loadSong(file);
        }
    }

    function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();

        const file = e.dataTransfer.files?.[0];

        if (file) {
            loadSong(file);
        }
    }

    function handleDragOver(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
    }

    function handleBrowse() {
        fileInputRef.current?.click();
    }

    function handleSilence() {
        const next = !mutedRef.current;

        setMuted(next);

        if (next) {
            audioRef.current?.pause();

            if (toneRef.current) {
                toneRef.current.gain.gain.value = 0;
            }
        } else {
            const pct = getVolumeFromX(ballPosRef.current.x);

            applyVolume(pct);
            audioRef.current?.play().catch(() => undefined);
        }
    }

    useEffect(() => {
        mountedRef.current = true;

        const audio = audioRef.current;

        layout();
        updateTrack(0);
        syncScene();

        window.addEventListener("resize", layout);

        return () => {
            mountedRef.current = false;

            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }

            if (aimRafRef.current !== null) {
                cancelAnimationFrame(aimRafRef.current);
                aimRafRef.current = null;
            }

            window.removeEventListener("resize", layout);

            if (toneRef.current) {
                toneRef.current.osc.disconnect();
                toneRef.current.gain.disconnect();
                toneRef.current.ctx.close().catch(() => undefined);
                toneRef.current = null;
            }

            audio?.pause();

            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
        };
    }, [layout, syncScene, updateTrack]);

    return (
        <div className="slingshot-page">

            <div className="slingshot-stage">
                <svg
                    ref={sceneRef}
                    className="slingshot-scene"
                    aria-hidden="true"
                >
                    <circle
                        ref={maxRingRef}
                        className="slingshot-maxring"
                        fill="none"
                    />
                    <line
                        ref={bandARef}
                        className="slingshot-band slingshot-band-a"
                    />
                    <line
                        ref={bandBRef}
                        className="slingshot-band slingshot-band-b"
                    />
                    <g ref={forkRef} className="slingshot-fork">
                        <circle
                            className="fork-tip"
                            cx="-26"
                            cy="-50"
                            r="7"
                        />
                        <circle
                            className="fork-tip"
                            cx="26"
                            cy="-50"
                            r="7"
                        />
                        <line
                            className="fork-arm"
                            x1="-26"
                            y1="-50"
                            x2="0"
                            y2="6"
                        />
                        <line
                            className="fork-arm"
                            x1="26"
                            y1="-50"
                            x2="0"
                            y2="6"
                        />
                        <line
                            className="fork-handle"
                            x1="0"
                            y1="6"
                            x2="0"
                            y2="70"
                        />
                        <line
                            className="fork-foot"
                            x1="-16"
                            y1="70"
                            x2="16"
                            y2="70"
                        />
                    </g>
                    <circle
                        ref={ringRef}
                        className="slingshot-ring"
                        fill="none"
                        opacity="0"
                    />
                </svg>

                <div
                    ref={powerRef}
                    className="slingshot-power"
                    style={{ display: "none" }}
                >
                    0%
                </div>

                <div
                    ref={ballRef}
                    className="slingshot-ball"
                    role="button"
                    aria-label="Slingshot ball. Hold, pull back, release to set the volume."
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                >
                    <span className="slingshot-ball-shine" aria-hidden="true" />
                </div>
            </div>

            <aside className="slingshot-panel">

                <header className="slingshot-header">
                    <div className="slingshot-eyebrow">
                        UselessOS™ / Utility
                    </div>
                    <h1 className="slingshot-title">
                        The Slingshot Volume Slider
                    </h1>
                    <p className="slingshot-subtitle">
                        Forget dragging a dot down a line. Arm the
                        slingshot, let rip, and whatever the browser
                        decides your ears deserve is what they get.
                        Overshoot and the whole thing becomes a
                        pinball machine with your hearing on the line.
                    </p>
                </header>

                <div
                    className="slingshot-dropzone"
                    onClick={handleBrowse}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    {fileName ? (
                        <span className="dropzone-file">
                            Armed: <strong>{fileName}</strong> — starts
                            from a random part of itself. Always.
                        </span>
                    ) : (
                        <span className="dropzone-hint">
                            Drop a song to arm it
                            <small>…or click to browse. Playback starts
                            at a random point. We choose. You cope.</small>
                        </span>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    hidden
                    onChange={handleFileChange}
                />

                <div className="slingshot-howto">
                    Grab the ball. Pull back further than you should.
                    Release. Your ears will tell you the rest.
                </div>

                <div className="slingshot-readout">
                    <span className="slingshot-readout-label">
                        Volume
                    </span>
                    <span className="slingshot-readout-value">
                        {volume}%
                    </span>
                </div>

                <div className="slingshot-verdict" aria-live="polite">
                    {verdict ?? "No volume yet. Have you tried committing fully?"}
                </div>

                {randomOffsetPct !== null && (
                    <div className="slingshot-offset">
                        Entered at {randomOffsetPct}% of the track.
                        Greetings from somewhere in the middle.
                    </div>
                )}

                <div className="slingshot-actions">
                    <button
                        type="button"
                        className="slingshot-mute"
                        onClick={handleSilence}
                    >
                        {muted ? "Unmute the chaos" : "Respect your ears"}
                    </button>
                </div>

                <div className="slingshot-stats">
                    <span>
                        Launches
                        <em>{launches}</em>
                    </span>
                    <span>
                        Peak damage
                        <em>{peakVolume}%</em>
                    </span>
                </div>

            </aside>

            <div className="slingshot-track">
                <span className="slingshot-track-label">whisper</span>
                <div className="slingshot-rail" ref={railRef}>
                    <div
                        ref={markerRef}
                        className="slingshot-marker"
                        style={{ transform: "translate3d(-9px, -50%, 0)" }}
                    />
                </div>
                <span className="slingshot-track-label slingshot-track-label-danger">
                    ear-piercing
                </span>
                <span ref={volTextRef} className="slingshot-track-value">
                    0%
                </span>
            </div>

            <audio ref={audioRef} preload="auto" />

        </div>
    );
}

export default SlingshotSlider;