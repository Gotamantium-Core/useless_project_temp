import { useSyncExternalStore } from "react";

import {
    getEnabled,
    getIsPlaying,
    getNowPlayingName,
    nextRandom,
    subscribe,
    toggleEnabled,
} from "../utils/senseiMusic";

import "./MusicPill.css";

function MusicPill() {
    const enabled = useSyncExternalStore(subscribe, getEnabled);
    const playing = useSyncExternalStore(subscribe, getIsPlaying);
    const name = useSyncExternalStore(subscribe, getNowPlayingName);

    const label = !enabled
        ? "Radio off"
        : playing
          ? name
            ? `Now · ${name}`
            : "Tuning in…"
          : "Tap to play";

    return (
        <div className="music-pill">
            <button
                type="button"
                className="music-pill-main"
                aria-label={
                    enabled
                        ? "Turn the radio off"
                        : "Turn the radio on"
                }
                onClick={toggleEnabled}
            >
                <span
                    className={
                        playing
                            ? "music-pill-icon music-pill-icon-on"
                            : "music-pill-icon"
                    }
                    aria-hidden="true"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                    </svg>
                </span>

                <span className="music-pill-label">{label}</span>
            </button>

            {playing && (
                <button
                    type="button"
                    className="music-pill-skip"
                    aria-label="Skip to the next track"
                    onClick={nextRandom}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <polygon points="5 4 15 12 5 20 5 4" />
                        <line x1="19" y1="5" x2="19" y2="19" />
                    </svg>
                </button>
            )}
        </div>
    );
}

export default MusicPill;