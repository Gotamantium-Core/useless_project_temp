import {
    useEffect,
    useRef,
    useState,
} from "react";

import "./ShyCursor.css";

const DODGE_RADIUS = 50;
const WORRY_RADIUS = 90;
const FEAR_RADIUS = 80;

const SPRING_K = 200;
const DAMPING = 30;
const SPEED_CAP = 2600;
const JITTER = 6;

const IDLE_SPEED = 40;
const CREEP_DELAY_MS = 700;
const CREEP_RATE = 30;
const CREEP_MAX = 55;

const COWER_ON = 0.45;
const COWER_OFF = 0.3;

interface ShyRect {
    l: number;
    t: number;
    r: number;
    b: number;
}

interface NearestInfo {
    idx: number;
    nx: number;
    ny: number;
    d: number;
}

interface Sim {
    x: number;
    y: number;
    vx: number;
    vy: number;
}

function nearestPoint(
    rect: ShyRect,
    x: number,
    y: number
): { x: number; y: number } {
    const dxL = x - rect.l;
    const dxR = rect.r - x;
    const dyT = y - rect.t;
    const dyB = rect.b - y;

    const minX = Math.min(dxL, dxR);
    const minY = Math.min(dyT, dyB);

    if (minX < minY) {
        return {
            x: dxL < dxR ? rect.l : rect.r,
            y: Math.min(Math.max(y, rect.t), rect.b),
        };
    }

    return {
        x: Math.min(Math.max(x, rect.l), rect.r),
        y: dyT < dyB ? rect.t : rect.b,
    };
}

function nearestInfo(
    rects: ShyRect[],
    x: number,
    y: number
): NearestInfo {
    let bestIdx = -1;
    let bestD2 = Infinity;
    let bx = x;
    let by = y;

    for (let i = 0; i < rects.length; i += 1) {
        const n = nearestPoint(rects[i], x, y);
        const dx = x - n.x;
        const dy = y - n.y;
        const d2 = dx * dx + dy * dy;

        if (d2 < bestD2) {
            bestD2 = d2;
            bestIdx = i;
            bx = n.x;
            by = n.y;
        }
    }

    return bestIdx === -1
        ? { idx: -1, nx: x, ny: y, d: Infinity }
        : { idx: bestIdx, nx: bx, ny: by, d: Math.sqrt(bestD2) };
}

function measureShyRects(root: HTMLElement): ShyRect[] {
    const rects: ShyRect[] = [];

    root.querySelectorAll<HTMLElement>("[data-shy]").forEach(
        (el) => {
            const r = el.getBoundingClientRect();

            rects.push({
                l: r.left,
                t: r.top,
                r: r.right,
                b: r.bottom,
            });
        }
    );

    return rects;
}

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
    if (audioCtx === null) {
        try {
            audioCtx = new AudioContext();
        } catch {
            return null;
        }
    }

    if (audioCtx.state === "suspended") {
        void audioCtx.resume();
    }

    return audioCtx;
}

function tone(
    ctx: AudioContext,
    frequency: number,
    start: number,
    duration: number,
    type: OscillatorType,
    peak: number
) {
    const t = ctx.currentTime + start;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(
        peak,
        t + 0.008
    );
    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        t + duration
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + duration + 0.02);
}

function playDeny() {
    const ctx = getAudioCtx();

    if (!ctx) {
        return;
    }

    tone(ctx, 330, 0, 0.09, "square", 0.05);
    tone(ctx, 220, 0.12, 0.12, "square", 0.05);
}

function playJingle() {
    const ctx = getAudioCtx();

    if (!ctx) {
        return;
    }

    tone(ctx, 523.25, 0, 0.2, "triangle", 0.12);
    tone(ctx, 659.25, 0.1, 0.2, "triangle", 0.12);
    tone(ctx, 783.99, 0.2, 0.35, "triangle", 0.12);
}

function verdictLine(
    attempts: number,
    won: boolean,
    wonBy: "mouse" | "keyboard" | null
): string {
    if (won && wonBy === "keyboard") {
        return "Keyboard victory. Unorthodox, effective, arguably cheating. The button is filing a complaint.";
    }

    if (won) {
        return "You actually clicked it. The button is in shock. It is now allowing your cursor to rest on it, because it no longer has anything left to fear.";
    }

    if (attempts === 0) {
        return "The button is ready. It has always been ready. It will also never be ready.";
    }

    if (attempts < 5) {
        return "The button senses a cursor. It knows what cursors like you are capable of.";
    }

    if (attempts < 12) {
        return "You got within about fifty pixels. The button respects that, and it will never forgive it.";
    }

    if (attempts < 25) {
        return "This is now a standoff over absolutely nothing. Neither side is willing to yield.";
    }

    if (attempts < 45) {
        return "The cursor is not running away. It is selecting a more defensible position.";
    }

    if (attempts < 80) {
        return "You have made this personal. The button has a family.";
    }

    return "Achievement unlocked: Longest Distance Courier. The click you cannot deliver has become local legend.";
}

function ShyCursor() {
    const [attempts, setAttempts] = useState<number>(0);
    const [successes, setSuccesses] = useState<number>(0);
    const [won, setWon] = useState<boolean>(false);
    const [wonBy, setWonBy] =
        useState<"mouse" | "keyboard" | null>(null);

    const pageRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);

    const mouseRef = useRef({ x: 0, y: 0 });
    const prevMouseRef = useRef({ x: 0, y: 0, t: 0 });
    const simRef = useRef<Sim>({
        x: Math.round(window.innerWidth / 2),
        y: Math.round(window.innerHeight * 0.4),
        vx: 0,
        vy: 0,
    });
    const rafRef = useRef<number | null>(null);

    const shyRectsRef = useRef<ShyRect[]>([]);
    const shyActiveRef = useRef<boolean>(true);
    const creepRef = useRef<number>(0);
    const pinnedSinceRef = useRef<number>(0);
    const cowerOnRef = useRef<boolean>(false);
    const scaredOnRef = useRef<boolean>(false);
    const mountedRef = useRef<boolean>(false);

    useEffect(() => {
        mountedRef.current = true;

        document.documentElement.classList.add(
            "shy-cursor-active"
        );

        if (pageRef.current) {
            shyRectsRef.current = measureShyRects(
                pageRef.current
            );
        } else {
            shyRectsRef.current = [];
        }

        const onPointerMove = (e: PointerEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const onResize = () => {
            if (pageRef.current) {
                shyRectsRef.current = measureShyRects(
                    pageRef.current
                );
            }
        };

        let scrollScheduled = false;

        const onScroll = () => {
            if (scrollScheduled || !pageRef.current) {
                return;
            }

            scrollScheduled = true;

            requestAnimationFrame(() => {
                scrollScheduled = false;

                if (pageRef.current) {
                    shyRectsRef.current = measureShyRects(
                        pageRef.current
                    );
                }
            });
        };

        const onDocumentClick = (e: MouseEvent) => {
            const target = e.target as Element | null;

            if (!target || !mountedRef.current) {
                return;
            }

            if (
                shyActiveRef.current &&
                target.closest("[data-shy]")
            ) {
                shyActiveRef.current = false;

                setWonBy(
                    e.detail === 0 ? "keyboard" : "mouse"
                );
                setWon(true);
                setSuccesses((prev) => prev + 1);

                playJingle();

                return;
            }

            if (target.closest("[data-shy]")) {
                return;
            }

            if (target.closest("[data-control]")) {
                return;
            }

            if (
                cardRef.current &&
                cardRef.current.contains(target)
            ) {
                setAttempts((prev) => prev + 1);

                playDeny();
            }
        };

        window.addEventListener(
            "pointermove",
            onPointerMove
        );
        window.addEventListener("click", onDocumentClick);
        window.addEventListener("resize", onResize);
        window.addEventListener("scroll", onScroll, {
            passive: true,
        });

        let last = performance.now();

        const tick = (now: number) => {
            if (!mountedRef.current) {
                return;
            }

            const dtMs = Math.min(now - last, 50);

            last = now;

            const dt = dtMs / 1000;

            const mouse = mouseRef.current;
            const sim = simRef.current;
            const rects = shyRectsRef.current;
            const active = shyActiveRef.current;

            const prev = prevMouseRef.current;
            const moved = Math.hypot(
                mouse.x - prev.x,
                mouse.y - prev.y
            );
            const mouseSpeed =
                prev.t === 0
                    ? 0
                    : (moved / Math.max(dtMs, 1)) * 1000;

            prevMouseRef.current = {
                x: mouse.x,
                y: mouse.y,
                t: now,
            };

            if (!active) {
                creepRef.current = 0;
                pinnedSinceRef.current = 0;
            } else {
                const pinnedInfo = nearestInfo(
                    rects,
                    mouse.x,
                    mouse.y
                );
                const pinned =
                    pinnedInfo.idx !== -1 &&
                    pinnedInfo.d < DODGE_RADIUS;

                if (pinned) {
                    if (mouseSpeed < IDLE_SPEED) {
                        if (pinnedSinceRef.current === 0) {
                            pinnedSinceRef.current = now;
                        }

                        if (
                            now - pinnedSinceRef.current >=
                            CREEP_DELAY_MS
                        ) {
                            creepRef.current = Math.min(
                                creepRef.current +
                                    CREEP_RATE * dt,
                                CREEP_MAX
                            );
                        }
                    } else {
                        pinnedSinceRef.current = 0;
                    }
                } else {
                    pinnedSinceRef.current = 0;
                    creepRef.current = 0;
                }
            }

            let desiredX = mouse.x;
            let desiredY = mouse.y;
            let dodging = false;

            if (active) {
                const info = nearestInfo(
                    rects,
                    desiredX,
                    desiredY
                );

                if (
                    info.idx !== -1 &&
                    info.d < DODGE_RADIUS &&
                    info.d > 0.001
                ) {
                    dodging = true;

                    const rect = rects[info.idx];
                    const cxx = (rect.l + rect.r) / 2;
                    const cyy = (rect.t + rect.b) / 2;

                    let ox = info.nx - cxx;
                    let oy = info.ny - cyy;
                    let od = Math.hypot(ox, oy);

                    if (od < 0.001) {
                        ox = (desiredX - info.nx) / info.d;
                        oy = (desiredY - info.ny) / info.d;
                        od = 1;
                    }

                    const ring = DODGE_RADIUS + creepRef.current;
                    const dirX = ox / od;
                    const dirY = oy / od;

                    desiredX = info.nx + dirX * ring;
                    desiredY = info.ny + dirY * ring;
                }
            }

            let wobble = 0;

            if (dodging) {
                wobble = JITTER;
            } else if (active) {
                const wi = nearestInfo(
                    rects,
                    mouse.x,
                    mouse.y
                );

                if (
                    wi.idx !== -1 &&
                    wi.d < WORRY_RADIUS
                ) {
                    wobble =
                        JITTER * (1 - wi.d / WORRY_RADIUS);
                }
            }

            if (wobble > 0) {
                desiredX +=
                    (Math.random() * 2 - 1) * wobble;
                desiredY +=
                    (Math.random() * 2 - 1) * wobble;
            }

            const ax =
                (desiredX - sim.x) * SPRING_K -
                sim.vx * DAMPING;
            const ay =
                (desiredY - sim.y) * SPRING_K -
                sim.vy * DAMPING;

            sim.vx += ax * dt;
            sim.vy += ay * dt;

            const speed = Math.hypot(sim.vx, sim.vy);

            if (speed > SPEED_CAP) {
                sim.vx = (sim.vx / speed) * SPEED_CAP;
                sim.vy = (sim.vy / speed) * SPEED_CAP;
            }

            sim.x += sim.vx * dt;
            sim.y += sim.vy * dt;

            const cursor = cursorRef.current;

            if (cursor) {
                const near = nearestInfo(
                    rects,
                    sim.x,
                    sim.y
                );
                const scared =
                    active &&
                    near.idx !== -1 &&
                    near.d < WORRY_RADIUS;

                if (scared !== scaredOnRef.current) {
                    scaredOnRef.current = scared;

                    cursor.classList.toggle("scared", scared);
                }

                cursor.style.transform = `translate3d(${
                    sim.x - 2
                }px, ${sim.y - 2}px, 0)`;
            }

            const card = cardRef.current;

            if (card) {
                let fear = 0;

                if (active) {
                    const fmi = nearestInfo(
                        rects,
                        mouse.x,
                        mouse.y
                    );

                    if (fmi.idx !== -1) {
                        fear = Math.max(
                            0,
                            1 - fmi.d / FEAR_RADIUS
                        );
                    }
                }

                const cowering =
                    fear >= COWER_ON ||
                    (cowerOnRef.current && fear >= COWER_OFF);

                if (cowering !== cowerOnRef.current) {
                    cowerOnRef.current = cowering;

                    card.dataset.cower = String(cowering);
                }
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            mountedRef.current = false;

            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }

            window.removeEventListener(
                "pointermove",
                onPointerMove
            );
            window.removeEventListener(
                "click",
                onDocumentClick
            );
            window.removeEventListener("resize", onResize);
            window.removeEventListener("scroll", onScroll);

            document.documentElement.classList.remove(
                "shy-cursor-active"
            );
        };
    }, []);

    function handleReset() {
        shyActiveRef.current = true;
        pinnedSinceRef.current = 0;
        creepRef.current = 0;

        setWon(false);
        setWonBy(null);
        setAttempts(0);
    }

    return (
        <div className="shy-page" ref={pageRef}>

            <header className="shy-header">
                <div className="shy-eyebrow">
                    UselessOS™ / Input Devices
                </div>

                <h1 className="shy-title">
                    The Shy Cursor
                </h1>

                <p className="shy-subtitle">
                    A pointer with a rich interior life. Its
                    preferred sport is declining to be within
                    fifty pixels of anything labeled “Submit”.
                </p>
            </header>

            <section className="shy-card" ref={cardRef}>

                <div className="shy-bait-main">
                    <span className="shy-bait-note">
                        This button is real. It would like you
                        to believe otherwise.
                    </span>

                    <button
                        className={`shy-button shy-button-big${
                            won ? " is-won" : ""
                        }`}
                        data-shy
                        type="button"
                    >
                        {won ? "Fine. You win." : "Click Here"}
                    </button>

                    <span className="shy-bait-note">
                        please don’t.
                    </span>
                </div>

                <div className="shy-card-divider" />

                <form
                    className="shy-bait"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <label
                        className="shy-label"
                        htmlFor="shy-real-name"
                    >
                        Your real name (rhetorical)
                    </label>

                    <input
                        id="shy-real-name"
                        className="shy-input"
                        placeholder="Type something. Not that it submits."
                    />

                    <button
                        className="shy-button shy-button-submit"
                        data-shy
                        type="button"
                    >
                        Submit
                    </button>
                </form>

                <div
                    className="shy-verdict"
                    aria-live="polite"
                >
                    <p className="shy-verdict-label">
                        Live status
                    </p>

                    <p className="shy-verdict-line">
                        {verdictLine(attempts, won, wonBy)}
                    </p>
                </div>

                <div className="shy-stats">
                    <span>Clicks survived</span>
                    <span>{attempts}</span>
                </div>

                <div className="shy-stats">
                    <span>Victories</span>
                    <span>{successes}</span>
                </div>

                <div className="shy-actions">
                    <button
                        className="shy-reset"
                        data-control
                        type="button"
                        onClick={handleReset}
                    >
                        Reset the grudge
                    </button>
                </div>

            </section>

            <div
                className="shy-cursor"
                ref={cursorRef}
                aria-hidden="true"
            >
                <svg
                    viewBox="0 0 36 36"
                    width="36"
                    height="36"
                >
                    <path
                        className="shy-cursor-body"
                        d="M3 3 L3 27 L10.5 23.6 L13.8 33.4 L18.4 31.4 L15.2 22.4 L24.5 21.4 Z"
                    />

                    <circle
                        className="shy-cursor-eye"
                        cx="11.5"
                        cy="13.5"
                        r="2.2"
                    />

                    <circle
                        className="shy-cursor-eye"
                        cx="17.5"
                        cy="12.5"
                        r="2.2"
                    />

                    <circle
                        className="shy-cursor-glint"
                        cx="12.4"
                        cy="12.7"
                        r="0.8"
                    />

                    <circle
                        className="shy-cursor-glint"
                        cx="18.4"
                        cy="11.7"
                        r="0.8"
                    />
                </svg>
            </div>

        </div>
    );
}

export default ShyCursor;