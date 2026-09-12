type Listener = () => void;

const ON_KEY = "uselessos-music-on";
const VOL_KEY = "uselessos-music-vol";

const DEFAULT_ENABLED = true;
const DEFAULT_VOLUME = 0.38;

const LOOKAHEAD_MS = 250;
const SCHEDULE_AHEAD = 0.9;

interface GenConfig {
    id: string;
    name: string;
    bpm: number;
    chords: number[][];
    pads: boolean;
    bells: boolean;
    beat: "none" | "lofi";
    noise: "none" | "crackle" | "rain";
    bellDensity: number;
}

export interface TrackRef {
    id: string;
    name: string;
    kind: "gen" | "file";
}

const GEN_TRACKS: GenConfig[] = [
    {
        id: "gen-midnight",
        name: "Midnight Pads",
        bpm: 58,
        chords: [
            [45, 57, 60, 64, 67],
            [41, 53, 57, 60, 64],
            [48, 55, 59, 62, 66],
            [43, 55, 59, 62, 64],
        ],
        pads: true,
        bells: true,
        beat: "none",
        noise: "crackle",
        bellDensity: 0.14,
    },
    {
        id: "gen-lofi",
        name: "Lo-fi Lounge",
        bpm: 74,
        chords: [
            [48, 55, 59, 62, 64],
            [45, 57, 60, 64],
            [41, 53, 57, 60, 64],
            [43, 55, 59, 62],
        ],
        pads: true,
        bells: true,
        beat: "lofi",
        noise: "crackle",
        bellDensity: 0.1,
    },
    {
        id: "gen-village",
        name: "Village Bells",
        bpm: 66,
        chords: [
            [48, 52, 55, 60, 64],
            [43, 55, 59, 62],
            [45, 57, 60, 64],
            [40, 52, 55, 59, 62],
        ],
        pads: true,
        bells: true,
        beat: "none",
        noise: "crackle",
        bellDensity: 0.22,
    },
    {
        id: "gen-rain",
        name: "Dormroom Rain",
        bpm: 52,
        chords: [
            [45, 57, 60, 64],
            [38, 50, 53, 57],
            [41, 53, 57, 60],
            [40, 47, 52, 55, 59],
        ],
        pads: true,
        bells: true,
        beat: "none",
        noise: "rain",
        bellDensity: 0.12,
    },
];

const fileManifest = import.meta.glob(
    "/src/assets/music/*.{mp3,ogg,wav,webm}",
    {
        query: "?url",
        import: "default",
        eager: true,
    }
) as Record<string, string>;

function prettifyName(path: string): string {
    const base = path.split("/").pop() ?? path;
    const name = base.replace(/\.[a-z0-9]+$/i, "");

    return name
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

const FILE_TRACKS: TrackRef[] = Object.keys(fileManifest).map(
    (path, index) => ({
        id: `file-${index}`,
        name: prettifyName(path),
        kind: "file" as const,
    })
);

const listeners = new Set<Listener>();

function emit() {
    listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener): () => void {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

function readStored(key: string, fallback: string): string {
    try {
        return localStorage.getItem(key) ?? fallback;
    } catch {
        return fallback;
    }
}

function writeStored(key: string, value: string) {
    try {
        localStorage.setItem(key, value);
    } catch {
        void value;
    }
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverbSend: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

let enabled = readStored(ON_KEY, String(DEFAULT_ENABLED)) === "true";
let volume = Number(readStored(VOL_KEY, String(DEFAULT_VOLUME)));
let started = false;
let powerOn = false;
let paused = false;
let current: TrackRef | null = null;
let nowName = "";

let genPlayer: {
    cfg: GenConfig;
    bus: GainNode;
    interval: number;
    step: number;
    stepStart: number;
    stepDur: number;
    beds: Array<() => void>;
} | null = null;

const filePlayers = new Map<
    string,
    { el: HTMLAudioElement; src: MediaElementAudioSourceNode; gain: GainNode }
>();

function midiToFreq(step: number): number {
    return 440 * Math.pow(2, (step - 69) / 12);
}

function getNoiseBuffer(c: AudioContext): AudioBuffer {
    if (noiseBuf !== null) {
        return noiseBuf;
    }

    const len = Math.floor(c.sampleRate * 1);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);

    for (let i = 0; i < len; i += 1) {
        data[i] = Math.random() * 2 - 1;
    }

    noiseBuf = buf;

    return buf;
}

function makeImpulse(
    c: AudioContext,
    seconds: number,
    decay: number
): AudioBuffer {
    const len = Math.floor(c.sampleRate * seconds);
    const buf = c.createBuffer(2, len, c.sampleRate);

    for (let channel = 0; channel < 2; channel += 1) {
        const data = buf.getChannelData(channel);

        for (let i = 0; i < len; i += 1) {
            data[i] =
                (Math.random() * 2 - 1) *
                Math.pow(1 - i / len, decay);
        }
    }

    return buf;
}

function createCtx(): AudioContext | null {
    if (ctx !== null) {
        return ctx;
    }

    try {
        ctx = new AudioContext();
    } catch {
        return null;
    }

    if (ctx.state === "suspended") {
        void ctx.resume();
    }

    master = ctx.createGain();
    master.gain.value = 0;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.knee.value = 18;
    comp.ratio.value = 5;
    comp.attack.value = 0.005;
    comp.release.value = 0.25;

    master.connect(comp);
    comp.connect(ctx.destination);

    const convolver = ctx.createConvolver();
    convolver.buffer = makeImpulse(ctx, 2.6, 3.4);
    convolver.normalize = true;

    reverbSend = ctx.createGain();
    reverbSend.gain.value = 0.5;

    const reverbReturn = ctx.createGain();
    reverbReturn.gain.value = 0.7;

    convolver.connect(reverbReturn);
    reverbReturn.connect(master);

    return ctx;
}

function targets(node: AudioNode) {
    node.connect(master!);

    if (reverbSend !== null) {
        node.connect(reverbSend);
    }
}

function connectToVerb(node: AudioNode) {
    if (reverbSend !== null) {
        node.connect(reverbSend);
    }
}

function targetOutputLevel(): number {
    if (!enabled || !powerOn) {
        return 0;
    }

    if (paused) {
        return 0;
    }

    return Math.min(volume, 1);
}

function applyRamp(duration = 0.7) {
    if (master === null) {
        return;
    }

    const t = ctx!.currentTime;

    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
    master.gain.linearRampToValueAtTime(
        Math.max(targetOutputLevel(), 0),
        t + duration
    );
}

function playTone(
    frequency: number,
    start: number,
    duration: number,
    type: OscillatorType,
    peak: number,
    glideTo?: number
) {
    const c = createCtx();

    if (c === null || master === null) {
        return;
    }

    const t = c.currentTime + start;

    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, t);

    if (glideTo !== undefined && glideTo !== frequency) {
        osc.frequency.exponentialRampToValueAtTime(
            Math.max(glideTo, 0.1),
            t + duration * 0.9
        );
    }

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    gain.connect(master);

    connectToVerb(gain);

    osc.start(t);
    osc.stop(t + duration + 0.05);
}

function playPoof() {
    playTone(260, 0, 0.12, "square", 0.045);
    playTone(130, 0.06, 0.16, "square", 0.035);
}

function playSnore() {
    playTone(150, 0, 0.32, "sine", 0.04);
    playTone(112, 0.28, 0.4, "sine", 0.03);
}

function playPop() {
    playTone(520, 0, 0.08, "square", 0.045);
    playTone(700, 0.05, 0.1, "square", 0.035);
}

function playSwapTone() {
    playTone(300, 0, 0.3, "sawtooth", 0.05, 150);
    playTone(150, 0, 0.34, "sine", 0.06, 70);
}

function playVictoryTone() {
    playTone(784, 0, 0.14, "triangle", 0.06);
    playTone(988, 0.09, 0.14, "triangle", 0.06);
    playTone(1175, 0.18, 0.26, "triangle", 0.06);
}

function getTrackList(): TrackRef[] {
    return [...GEN_TRACKS.map((t) => ({
        id: t.id,
        name: t.name,
        kind: "gen" as const,
    })), ...FILE_TRACKS];
}

function pickRandomTrack(): TrackRef | null {
    const list = getTrackList();

    if (list.length === 0) {
        return null;
    }

    const candidates = list.filter((t) => t.id !== current?.id);

    const pool = candidates.length > 0 ? candidates : list;

    return pool[Math.floor(Math.random() * pool.length)];
}

function schedulePad(
    c: AudioContext,
    bus: GainNode,
    cfg: GenConfig,
    chord: number[],
    when: number
) {
    const barDur = (60 / cfg.bpm) * 4;

    chord.forEach((note) => {
        if (!cfg.pads) {
            return;
        }

        const freq = midiToFreq(note);

        const oscA = c.createOscillator();
        const oscB = c.createOscillator();
        const filter = c.createBiquadFilter();
        const gain = c.createGain();

        oscA.type = "sawtooth";
        oscB.type = "sawtooth";
        oscA.frequency.value = freq;
        oscB.frequency.value = freq * 1.004;

        filter.type = "lowpass";
        filter.frequency.value = 950;
        filter.Q.value = 0.6;

        gain.gain.setValueAtTime(0.0001, when);
        gain.gain.linearRampToValueAtTime(0.05, when + 1.9);
        gain.gain.setValueAtTime(0.05, when + barDur - 2.4);
        gain.gain.linearRampToValueAtTime(0.0001, when + barDur - 0.2);

        oscA.connect(filter);
        oscB.connect(filter);
        filter.connect(gain);
        gain.connect(bus);
        connectToVerb(gain);

        oscA.start(when);
        oscB.start(when);
        oscA.stop(when + barDur + 0.1);
        oscB.stop(when + barDur + 0.1);
    });

    const bass = c.createOscillator();
    const bassGain = c.createGain();

    bass.type = "sine";
    bass.frequency.value = midiToFreq(chord[0] - 12);

    bassGain.gain.setValueAtTime(0.0001, when);
    bassGain.gain.linearRampToValueAtTime(0.09, when + 0.6);
    bassGain.gain.setValueAtTime(0.09, when + barDur - 1.6);
    bassGain.gain.linearRampToValueAtTime(0.0001, when + barDur - 0.2);

    bass.connect(bassGain);
    bassGain.connect(bus);

    bass.start(when);
    bass.stop(when + barDur + 0.1);
}

function buildEcho(c: AudioContext, bus: GainNode) {
    const delay = c.createDelay(0.9);
    const feedback = c.createGain();
    const wet = c.createGain();

    delay.delayTime.value = 0.42;
    feedback.gain.value = 0.42;
    wet.gain.value = 0.5;

    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(bus);

    return {
        input: delay as AudioNode,
    };
}

function scheduleBell(
    c: AudioContext,
    bus: GainNode,
    echoInput: AudioNode | null,
    chord: number[],
    when: number
) {
    const root = chord[Math.floor(Math.random() * chord.length)];

    const note = root + (Math.random() < 0.5 ? 12 : 24);
    const freq = midiToFreq(note);

    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = "triangle";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(0.045, when + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 1.4);

    osc.connect(gain);
    gain.connect(bus);

    if (echoInput !== null) {
        const send = c.createGain();
        send.gain.value = 0.6;
        gain.connect(send);
        send.connect(echoInput);
    }

    osc.start(when);
    osc.stop(when + 1.5);
}

function scheduleBeat(
    c: AudioContext,
    bus: GainNode,
    cfg: GenConfig,
    stepInBar: number,
    when: number
) {
    if (cfg.beat !== "lofi") {
        return;
    }

    const noise = getNoiseBuffer(c);

    if (stepInBar % 4 === 0) {
        const osc = c.createOscillator();
        const gain = c.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(135, when);
        osc.frequency.exponentialRampToValueAtTime(42, when + 0.1);

        gain.gain.setValueAtTime(0.55, when);
        gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.2);

        osc.connect(gain);
        gain.connect(bus);

        osc.start(when);
        osc.stop(when + 0.25);
    }

    if (stepInBar % 2 === 0) {
        const src = c.createBufferSource();
        const filter = c.createBiquadFilter();
        const gain = c.createGain();

        src.buffer = noise;
        filter.type = "highpass";
        filter.frequency.value = 5200;

        gain.gain.setValueAtTime(0.09, when);
        gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.035);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(bus);

        src.start(when);
        src.stop(when + 0.05);
    }

    if (stepInBar === 4 && cfg.noise !== "rain") {
        const src = c.createBufferSource();
        const filter = c.createBiquadFilter();
        const gain = c.createGain();

        src.buffer = noise;
        filter.type = "bandpass";
        filter.frequency.value = 1800;
        filter.Q.value = 1.2;

        gain.gain.setValueAtTime(0.22, when);
        gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.12);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(bus);

        src.start(when);
        src.stop(when + 0.15);
    }
}

function scheduleCrackle(
    c: AudioContext,
    bus: GainNode,
    cfg: GenConfig,
    when: number
) {
    if (cfg.noise !== "crackle") {
        return;
    }

    if (Math.random() > 0.18) {
        return;
    }

    const src = c.createBufferSource();
    const filter = c.createBiquadFilter();
    const gain = c.createGain();

    src.buffer = getNoiseBuffer(c);
    filter.type = "bandpass";
    filter.frequency.value = 2000 + Math.random() * 3200;
    filter.Q.value = 4;

    const dur = 0.004 + Math.random() * 0.01;

    gain.gain.setValueAtTime(0.06 + Math.random() * 0.05, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(bus);

    src.start(when);
    src.stop(when + dur + 0.02);
}

function startBeds(
    c: AudioContext,
    bus: GainNode,
    cfg: GenConfig
): Array<() => void> {
    if (cfg.noise !== "rain") {
        return [];
    }

    const src = c.createBufferSource();
    const filter = c.createBiquadFilter();
    const gain = c.createGain();
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();

    src.buffer = getNoiseBuffer(c);
    src.loop = true;

    filter.type = "lowpass";
    filter.frequency.value = 800;

    gain.gain.value = 0.03;

    lfo.type = "sine";
    lfo.frequency.value = 0.14;

    lfoGain.gain.value = 0.012;

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(bus);

    src.start();
    lfo.start();

    return [
        () => {
            src.stop();
            lfo.stop();
        },
    ];
}

function startGenPlayer(cfg: GenConfig) {
    const c = ctx!;
    const bus = c.createGain();
    const echo = buildEcho(c, bus);

    bus.gain.value = 0.0001;
    targets(bus);

    const playbackStart = c.currentTime + 0.12;
    const stepDur = (60 / cfg.bpm) / 2;
    const totalSteps = 32;

    const beds = startBeds(c, bus, cfg);

    let step = 0;

    const timer = window.setInterval(() => {
        if (!master) {
            return;
        }

        const ahead = c.currentTime + SCHEDULE_AHEAD;

        while (playbackStart + step * stepDur < ahead) {
            const when = playbackStart + step * stepDur;
            const s = step % totalSteps;
            const stepInBar = s % 8;
            const barIndex = Math.floor(s / 8);
            const chord = cfg.chords[barIndex % cfg.chords.length];

            if (stepInBar === 0) {
                schedulePad(c, bus, cfg, chord, when);
            }

            if (cfg.bells && Math.random() < cfg.bellDensity) {
                scheduleBell(c, bus, echo.input, chord, when);
            }

            scheduleBeat(c, bus, cfg, stepInBar, when);
            scheduleCrackle(c, bus, cfg, when);

            step += 1;
        }
    }, LOOKAHEAD_MS);

    bus.gain.linearRampToValueAtTime(1, c.currentTime + 1.2);

    genPlayer = {
        cfg,
        bus,
        interval: timer,
        step,
        stepStart: playbackStart,
        stepDur,
        beds,
    };
}

function startFilePlayer(ref: TrackRef) {
    const c = ctx!;
    const url = fileManifest[Object.keys(fileManifest)[Number(ref.id.slice(5))]];

    if (!url) {
        return;
    }

    let held = filePlayers.get(ref.id);

    if (!held) {
        const el = new Audio();
        el.src = url;
        el.loop = true;
        el.preload = "auto";

        const src = c.createMediaElementSource(el);
        const gain = c.createGain();

        gain.gain.value = 0.0001;

        src.connect(gain);
        targets(gain);

        held = { el, src, gain };
        filePlayers.set(ref.id, held);
    }

    held.el.currentTime = 0;
    void held.el.play().catch(() => undefined);
    held.gain.gain.linearRampToValueAtTime(1, c.currentTime + 1.1);
}

function fadeOutCurrent(duration: number) {
    const c = ctx;

    if (!c) {
        return;
    }

    if (genPlayer !== null) {
        const p = genPlayer;

        p.bus.gain.cancelScheduledValues(c.currentTime);
        p.bus.gain.setValueAtTime(
            Math.max(p.bus.gain.value, 0.0001),
            c.currentTime
        );
        p.bus.gain.linearRampToValueAtTime(0.0001, c.currentTime + duration);

        window.setTimeout(() => {
            window.clearInterval(p.interval);
            p.beds.forEach((stop) => stop());
        }, duration * 1000 + 60);

        genPlayer = null;
    }

    if (current?.kind === "file") {
        const held = current && filePlayers.get(current.id);

        if (held) {
            held.gain.gain.cancelScheduledValues(c.currentTime);
            held.gain.gain.setValueAtTime(
                Math.max(held.gain.gain.value, 0.0001),
                c.currentTime
            );
            held.gain.gain.linearRampToValueAtTime(
                0.0001,
                c.currentTime + duration
            );

            window.setTimeout(() => {
                held.el.pause();
            }, duration * 1000 + 60);
        }
    }
}

function switchTo(ref: TrackRef) {
    fadeOutCurrent(0.5);

    current = ref;
    nowName = ref.name;
    powerOn = true;

    if (ref.kind === "gen") {
        const cfg = GEN_TRACKS.find((t) => t.id === ref.id);

        if (cfg) {
            startGenPlayer(cfg);
        }
    } else {
        startFilePlayer(ref);
    }

    applyRamp(1.2);

    emit();
}

function ensureStarted() {
    if (started) {
        if (ctx !== null && ctx.state === "suspended") {
            void ctx.resume();
        }

        return;
    }

    const c = createCtx();

    if (c === null) {
        return;
    }

    started = true;

    if (enabled) {
        const first = pickRandomTrack();

        if (first) {
            switchTo(first);
        }
    }
}

function armAutostart(): () => void {
    function handle() {
        ensureStarted();
        disarm();
    }

    function disarm() {
        window.removeEventListener("pointerdown", handle);
        window.removeEventListener("keydown", handle);
    }

    window.addEventListener("pointerdown", handle);
    window.addEventListener("keydown", handle);

    return disarm;
}

function nextRandom() {
    if (!started) {
        ensureStarted();
    }

    if (!started) {
        return;
    }

    const nextTrack = pickRandomTrack();

    if (nextTrack) {
        switchTo(nextTrack);
    }
}

function toggleEnabled() {
    if (!started) {
        ensureStarted();
    }

    if (!started) {
        return;
    }

    const next = !enabled;

    enabled = next;
    writeStored(ON_KEY, String(next));

    if (next && !powerOn) {
        const first = pickRandomTrack();

        if (first) {
            switchTo(first);
        }
    }

    applyRamp();

    emit();
}

function setEnabled(next: boolean) {
    if (enabled === next) {
        return;
    }

    enabled = next;
    writeStored(ON_KEY, String(next));

    if (next && !powerOn) {
        const first = pickRandomTrack();

        if (first) {
            switchTo(first);
        }
    }

    applyRamp();

    emit();
}

function setVolume(next: number) {
    volume = Math.min(Math.max(next, 0), 1);
    writeStored(VOL_KEY, String(volume));

    applyRamp();

    emit();
}

function setPaused(next: boolean) {
    paused = next;
    applyRamp();
}

function dipVolume() {
    if (master === null || ctx === null) {
        return;
    }

    const c = ctx;
    const t = c.currentTime;

    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
    master.gain.linearRampToValueAtTime(volume * 0.22, t + 0.18);

    window.setTimeout(() => {
        applyRamp();
    }, 1500);
}

function bumpVolume() {
    if (master === null || ctx === null) {
        return;
    }

    const c = ctx;
    const t = c.currentTime;

    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
    master.gain.linearRampToValueAtTime(
        Math.min(volume * 1.9, 1),
        t + 0.15
    );

    window.setTimeout(() => {
        applyRamp();
    }, 1600);
}

function fakePause() {
    setPaused(true);

    const dur = 3200 + Math.random() * 6000;

    window.setTimeout(() => {
        setPaused(false);
    }, dur);
}

const SKIP_LINES = [
    "This one slaps. Next.",
    "Nah. Needs more cowbell.",
    "Mid-argument with the playlist.",
    "Respect the craft, not the track.",
    "Changing the vibe.",
];

const DIP_LINES = [
    "Tasteful fade. For drama.",
    "Hold on. Deep focus moment.",
    "The bridge is coming.",
];

const BUMP_LINES = [
    "Protagonist volume boost.",
    "That one hits different.",
    "Turn it up. Sensei's authority.",
];

const PAUSE_LINES = [
    "Dramatic pause. Artists need them.",
    "Silence. So you can appreciate it.",
    "Rest. The beat is tired.",
];

export function djTakeWheel(): {
    caption: string;
    action: "skip" | "dip" | "bump" | "pause";
} | null {
    if (!started || !enabled) {
        return null;
    }

    if (paused) {
        setPaused(false);
    }

    const roll = Math.random();

    if (roll < 0.42) {
        nextRandom();

        return {
            action: "skip",
            caption: SKIP_LINES[Math.floor(Math.random() * SKIP_LINES.length)],
        };
    }

    if (roll < 0.62) {
        dipVolume();

        return {
            action: "dip",
            caption: DIP_LINES[Math.floor(Math.random() * DIP_LINES.length)],
        };
    }

    if (roll < 0.82) {
        bumpVolume();

        return {
            action: "bump",
            caption: BUMP_LINES[Math.floor(Math.random() * BUMP_LINES.length)],
        };
    }

    fakePause();

    return {
        action: "pause",
        caption: PAUSE_LINES[Math.floor(Math.random() * PAUSE_LINES.length)],
    };
}

function getEnabled(): boolean {
    return enabled;
}

function getIsStarted(): boolean {
    return started;
}

function getIsPlaying(): boolean {
    return started && enabled && powerOn && !paused;
}

function getNowPlayingName(): string {
    return nowName;
}

function getNowPlaying(): TrackRef | null {
    return current;
}

export {
    subscribe,
    armAutostart,
    ensureStarted,
    nextRandom,
    toggleEnabled,
    setEnabled,
    setVolume,
    getEnabled,
    getIsStarted,
    getIsPlaying,
    getNowPlayingName,
    getNowPlaying,
    getTrackList,
    playPoof,
    playSnore,
    playPop,
    playSwapTone,
    playVictoryTone,
};