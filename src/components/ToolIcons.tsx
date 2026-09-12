function ExcuseIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="12" x2="13" y2="12" />
        </svg>
    );
}

function KeyboardIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <line x1="6" y1="10" x2="6" y2="10" />
            <line x1="10" y1="10" x2="10" y2="10" />
            <line x1="14" y1="10" x2="14" y2="10" />
            <line x1="18" y1="10" x2="18" y2="10" />
            <line x1="6" y1="14" x2="6" y2="14" />
            <line x1="10" y1="14" x2="16" y2="14" />
            <line x1="18" y1="14" x2="18" y2="14" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3.5 2" />
            <path d="M12 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
            <path d="M17.5 3.8l1.2-1.2" strokeDasharray="0.5 1.6" />
            <path d="M21 9.5l-1.6 0.1" strokeDasharray="0.5 1.6" />
            <path d="M3 9.5l1.6 0.1" strokeDasharray="0.5 1.6" />
        </svg>
    );
}

function NpcIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
            <path d="M12 16l1.5-1" strokeDasharray="1.5 2" />
        </svg>
    );
}

function SlingshotIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M6 3l5 6-5 6" />
            <path d="M18 3l-5 6 5 6" />
            <line x1="11" y1="9" x2="13" y2="9" />
            <circle cx="12" cy="9" r="2" />
            <line x1="12" y1="11" x2="12" y2="20" />
            <line x1="7" y1="20" x2="17" y2="20" />
        </svg>
    );
}

export {
    ExcuseIcon,
    KeyboardIcon,
    ClockIcon,
    SlingshotIcon,
    NpcIcon,
};