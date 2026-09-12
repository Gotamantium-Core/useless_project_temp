import {
    ClockIcon,
    ExcuseIcon,
    KeyboardIcon,
    LockIcon,
    NpcIcon,
    ScreenIcon,
    SlingshotIcon,
} from "./ToolIcons";

import "./BgArt.css";

function BoltDoodle() {
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
            <path d="M13 2 4 13h6l-1 9 9-11h-6l1-9Z" />
        </svg>
    );
}

function SpiralDoodle() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="2.5" />
            <circle cx="12" cy="12" r="6" />
            <path d="M18 12a6 6 0 1 1-6-6" />
        </svg>
    );
}

function ArrowDoodle() {
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
            <path d="M4 20 9.5 6l4 8.5L19 5" />
            <path d="M16.5 5H19v2.5" />
        </svg>
    );
}

function ScribbleDoodle() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
        >
            <path d="M2 6c2-1.5 3 1.5 4.5 0s3 1.5 4.5 0 2.5-1.5 4 0 2 0.5 4 0" />
        </svg>
    );
}

function StarDoodle() {
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
            <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z" />
        </svg>
    );
}

function QuestionMarkDoodle() {
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
            <path d="M9.5 9a2.5 2.5 0 1 1 4 .6c-.8.9-1.5 1.4-1.5 2.6" />
            <circle cx="12" cy="17" r="1.2" fill="currentColor" stroke="none" />
        </svg>
    );
}

function RingDoodle() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
        >
            <ellipse
                cx="12"
                cy="12"
                rx="10"
                ry="4.5"
                transform="rotate(-18 12 12)"
                strokeDasharray="3 3"
            />
            <circle cx="20" cy="10" r="1.4" fill="currentColor" stroke="none" />
            <circle cx="5" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
        </svg>
    );
}

function DotsDoodle() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
        >
            <circle cx="6" cy="6" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
            <circle cx="18" cy="7" r="1.2" fill="currentColor" stroke="none" />
        </svg>
    );
}

interface WaveProps {
    d: string;
    filled?: boolean;
    className?: string;
}

function Wave({ d, filled = false, className = "" }: WaveProps) {
    const full = filled ? `${d} L1440 240 L0 240 Z` : d;

    return (
        <svg
            className={`bg-art-wave ${className}`}
            viewBox="0 0 1440 240"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <path
                d={full}
                fill={filled ? "currentColor" : "none"}
                stroke={filled ? "none" : "currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function FrameDoodle() {
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
            <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="3"
                transform="rotate(-8 12 12)"
                strokeDasharray="4 3"
            />
            <path d="M8 19.5l.5-2M16.5 4.5l-.5 2" strokeDasharray="1.5 2" />
        </svg>
    );
}

function BgArt() {
    return (
        <div
            className="bg-art"
            role="presentation"
            aria-hidden="true"
        >
            <svg
                className="bg-art-pattern"
                viewBox="0 0 120 120"
                fill="none"
                aria-hidden="true"
            >
                <defs>
                    <pattern
                        id="bg-dot-pattern"
                        width="24"
                        height="24"
                        patternUnits="userSpaceOnUse"
                    >
                        <circle
                            cx="1.5"
                            cy="1.5"
                            r="1"
                            fill="currentColor"
                        />
                    </pattern>
                </defs>
                <rect
                    width="120"
                    height="120"
                    fill="url(#bg-dot-pattern)"
                />
            </svg>

            <Wave
                d="M0 130 C 180 70, 360 70, 540 120 S 900 190, 1080 140 S 1300 70, 1440 120"
                className="bg-art-wave-1"
            />

            <Wave
                d="M0 90 C 240 150, 480 150, 660 100 S 1020 40, 1200 80 S 1380 170, 1440 140"
                filled
                className="bg-art-wave-2"
            />

            <Wave
                d="M0 160 C 220 60, 440 60, 640 140 S 980 220, 1180 130 S 1360 90, 1440 150"
                className="bg-art-wave-3"
            />

            <Wave
                d="M0 110 C 200 180, 440 180, 640 90 S 980 20, 1200 100 S 1360 160, 1440 120"
                filled
                className="bg-art-wave-4"
            />

            <div className="bg-art-glow-left bg-art-glow" />

            <div className="bg-art-glow-right bg-art-glow" />

            <span className="bg-doodle bg-doodle-tl bg-doodle-lg bg-doodle-soft bg-doodle-drift-slow">
                <KeyboardIcon />
            </span>

            <span className="bg-doodle bg-doodle-tr bg-doodle-lg bg-doodle-soft bg-doodle-drift">
                <ClockIcon />
            </span>

            <span className="bg-doodle bg-doodle-ml bg-doodle-md bg-doodle-mind bg-doodle-bob">
                <SlingshotIcon />
            </span>

            <span className="bg-doodle bg-doodle-mr bg-doodle-md bg-doodle-mind bg-doodle-bob">
                <LockIcon />
            </span>

            <span className="bg-doodle bg-doodle-bl bg-doodle-lg bg-doodle-soft bg-doodle-bob">
                <ExcuseIcon />
            </span>

            <span className="bg-doodle bg-doodle-br bg-doodle-lg bg-doodle-soft bg-doodle-drift-slow">
                <NpcIcon />
            </span>

            <span className="bg-doodle bg-doodle-bolt bg-doodle-md bg-doodle-strong">
                <BoltDoodle />
            </span>

            <span className="bg-doodle bg-doodle-spiral bg-doodle-lg bg-doodle-soft bg-doodle-spin">
                <SpiralDoodle />
            </span>

            <span className="bg-doodle bg-doodle-arrow bg-doodle-sm bg-doodle-mind">
                <ArrowDoodle />
            </span>

            <span className="bg-doodle bg-doodle-arrow2 bg-doodle-sm bg-doodle-mind">
                <ArrowDoodle />
            </span>

            <span className="bg-doodle bg-doodle-scribble bg-doodle-sm bg-doodle-mind">
                <ScribbleDoodle />
            </span>

            <span className="bg-doodle bg-doodle-scribble2 bg-doodle-md bg-doodle-soft bg-doodle-drift">
                <ScreenIcon />
            </span>

            <span className="bg-doodle bg-doodle-star bg-doodle-xs bg-doodle-strong bg-doodle-bob">
                <StarDoodle />
            </span>

            <span className="bg-doodle bg-doodle-star2 bg-doodle-sm bg-doodle-mind bg-doodle-bob">
                <StarDoodle />
            </span>

            <span className="bg-doodle bg-doodle-star3 bg-doodle-sm bg-doodle-strong bg-doodle-bob">
                <StarDoodle />
            </span>

            <span className="bg-doodle bg-doodle-q bg-doodle-xs bg-doodle-mind">
                <QuestionMarkDoodle />
            </span>

            <span className="bg-doodle bg-doodle-q2 bg-doodle-xs bg-doodle-mind">
                <QuestionMarkDoodle />
            </span>

            <span className="bg-doodle bg-doodle-ring bg-doodle-sm bg-doodle-soft bg-doodle-spin">
                <RingDoodle />
            </span>

            <span className="bg-doodle bg-doodle-ring2 bg-doodle-sm bg-doodle-soft bg-doodle-spin">
                <RingDoodle />
            </span>

            <span className="bg-doodle bg-doodle-dots bg-doodle-xs bg-doodle-mind">
                <DotsDoodle />
            </span>

            <span className="bg-doodle bg-doodle-dots2 bg-doodle-xs bg-doodle-mind">
                <DotsDoodle />
            </span>

            <span className="bg-doodle bg-doodle-frame bg-doodle-lg bg-doodle-soft">
                <FrameDoodle />
            </span>
        </div>
    );
}

export default BgArt;