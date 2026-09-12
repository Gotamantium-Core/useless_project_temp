type Listener = () => void;

let pending: string | null = null;

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

export function getPending(): string | null {
    return pending;
}

export function requestOpen(toolId: string) {
    pending = toolId;

    emit();
}

export function clearPending() {
    pending = null;
}