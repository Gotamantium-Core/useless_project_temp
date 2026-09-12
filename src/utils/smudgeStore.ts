type Listener = () => void;

let active = false;
let sessions = 0;
let seed = 0;

const listeners = new Set<Listener>();

function emit() {
    listeners.forEach((listener) => listener());
}

export function subscribe(listener: Listener): () => void {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

export function getActive(): boolean {
    return active;
}

export function getSessions(): number {
    return sessions;
}

export function getSeed(): number {
    return seed;
}

export function activateSmudges(): void {
    sessions += 1;
    active = true;
    seed = Date.now();

    emit();
}

export function reSmudge(): void {
    if (!active) {
        return;
    }

    seed = Date.now();

    emit();
}

export function deactivateSmudges(): void {
    active = false;

    emit();
}