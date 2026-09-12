type Listener = () => void;

export const MEDDLES_PER_NAP = 4;
const NAP_DURATION_MS = 8000;

interface SenseiTarget {
    x: number;
    y: number;
    t: number;
}

let active = false;
let meddles = 0;
let successes = 0;
let pokes = 0;
let naps = 0;

let napProgress = 0;
let napping = false;
let busy = false;
let celebrate = 0;

let napTimer: number | null = null;

const target: SenseiTarget = { x: 0, y: 0, t: 0 };

const listeners = new Set<Listener>();

let scheduled = false;

function emit() {
    if (scheduled) {
        return;
    }

    scheduled = true;

    queueMicrotask(() => {
        scheduled = false;

        listeners.forEach((listener) => listener());
    });
}

export function subscribe(listener: Listener): () => void {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

export function isActive(): boolean {
    return active;
}

export function getMeddles(): number {
    return meddles;
}

export function getSuccesses(): number {
    return successes;
}

export function getPokes(): number {
    return pokes;
}

export function getNaps(): number {
    return naps;
}

export function getNapProgress(): number {
    return napProgress;
}

export function isNapping(): boolean {
    return napping;
}

export function isBusy(): boolean {
    return busy;
}

export function getMeddleTarget(): SenseiTarget {
    return target;
}

export function getCelebrate(): number {
    return celebrate;
}

function clearNapTimer() {
    if (napTimer !== null) {
        window.clearTimeout(napTimer);
        napTimer = null;
    }
}

function endNap() {
    napping = false;
    clearNapTimer();
}

function startNap() {
    if (napping) {
        return;
    }

    napping = true;
    naps += 1;
    napProgress = 0;

    clearNapTimer();

    napTimer = window.setTimeout(() => {
        napping = false;
        napTimer = null;
        emit();
    }, NAP_DURATION_MS);

    emit();
}

export function activate() {
    if (active) {
        return;
    }

    active = true;
    napProgress = 0;
    busy = false;

    emit();
}

export function deactivate() {
    if (!active) {
        return;
    }

    active = false;

    endNap();
    busy = false;
    target.t = 0;
    celebrate = 0;

    emit();
}

export function recordMeddle(
    rect: { x: number; y: number }
): boolean {
    if (!active || busy || napping) {
        return false;
    }

    meddles += 1;
    busy = true;
    napProgress += 1;

    target.x = rect.x;
    target.y = rect.y;
    target.t = Date.now();

    emit();

    return true;
}

export function finishMeddle() {
    busy = false;

    clearNapTimer();

    if (napProgress >= MEDDLES_PER_NAP) {
        startNap();
    } else {
        emit();
    }
}

export function recordSuccess() {
    if (!active || !napping) {
        return false;
    }

    successes += 1;
    celebrate = Date.now();
    endNap();

    emit();

    return true;
}

export function poke(): boolean {
    if (!active || napping || busy) {
        return false;
    }

    pokes += 1;
    napProgress += 1;

    if (napProgress >= MEDDLES_PER_NAP) {
        startNap();
    } else {
        emit();
    }

    return true;
}