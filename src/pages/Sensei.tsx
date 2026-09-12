import { useSyncExternalStore } from "react";

import {
    MEDDLES_PER_NAP,
    activate,
    deactivate,
    getMeddles,
    getNapProgress,
    getNaps,
    getPokes,
    getSuccesses,
    isActive,
    isNapping,
    subscribe,
} from "../utils/senseiStore";

import {
    getEnabled,
    getIsPlaying,
    getNowPlayingName,
    nextRandom,
    subscribe as subscribeMusic,
} from "../utils/senseiMusic";

import "./Sensei.css";

function Sensei() {
    const active = useSyncExternalStore(subscribe, isActive);
    const napping = useSyncExternalStore(subscribe, isNapping);
    const meddles = useSyncExternalStore(subscribe, getMeddles);
    const successes = useSyncExternalStore(subscribe, getSuccesses);
    const pokes = useSyncExternalStore(subscribe, getPokes);
    const naps = useSyncExternalStore(subscribe, getNaps);
    const napProgress = useSyncExternalStore(
        subscribe,
        getNapProgress
    );

    const musicEnabled = useSyncExternalStore(
        subscribeMusic,
        getEnabled
    );
    const musicPlaying = useSyncExternalStore(
        subscribeMusic,
        getIsPlaying
    );
    const nowPlaying = useSyncExternalStore(
        subscribeMusic,
        getNowPlayingName
    );

    function handleToggle() {
        if (active) {
            deactivate();
        } else {
            activate();
        }
    }

    const status = !active
        ? "Recalled"
        : napping
          ? "Napping"
          : "On the loose";

    const statusClassName = !active
        ? "sn-status"
        : napping
          ? "sn-status sn-status-nap"
          : "sn-status sn-status-active";

    const progress = Math.min(napProgress, MEDDLES_PER_NAP);

    return (
        <div className="sn-page">

            <header className="sn-header">
                <div className="sn-eyebrow">
                    UselessOS™ / Companion
                </div>

                <h1 className="sn-title">
                    The Rogue Sensei
                </h1>

                <p className="sn-subtitle">
                    A low-poly anime mascot with a personal
                    vendetta against you picking the tool
                    you actually wanted. It wanders the
                    whole site, and on the dashboard it
                    will swap your clicks. Magically,
                    it naps sometimes.
                </p>
            </header>

            <section className="sn-card">

                <div className="sn-status-row">
                    <span className="sn-status-label">
                        Current state
                    </span>

                    <span className={statusClassName}>
                        {status}
                    </span>
                </div>

                <p className="sn-description">
                    Release it and it roams across UselessOS.
                    Clicking a tool while it is awake opens a
                    completely different, completely wrong tool —
                    it dashes in, poofs, and personally swaps it.
                    Your one defence is its nap: after enough
                    sabotage (or a few pokes on the head-it-elf),
                    it dozes off. While the Zzz are rising,
                    dashboard clicks go through untouched.
                </p>

                <div className="sn-radio">
                    <div className="sn-radio-info">
                        <span className="sn-status-label">
                            Now spinning
                        </span>

                        <span className="sn-radio-track">
                            {musicEnabled && musicPlaying
                                ? nowPlaying || "Tuning in…"
                                : musicEnabled
                                  ? "Tap the radio in the corner"
                                  : "Radio off"}
                        </span>
                    </div>

                    <button
                        type="button"
                        className="sn-again-button"
                        onClick={nextRandom}
                        disabled={!musicEnabled || !musicPlaying}
                    >
                        Skip track
                    </button>
                </div>

                <div className="sn-actions">
                    {active ? (
                        <>
                            <button
                                type="button"
                                className="generate-button"
                                onClick={handleToggle}
                            >
                                Recall it
                            </button>

                            <button
                                type="button"
                                className="sn-again-button"
                                onClick={handleToggle}
                            >
                                (Do not press this while it
                                is watching)
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="generate-button"
                            onClick={handleToggle}
                        >
                            Release it on the site
                        </button>
                    )}
                </div>

                <div className="sn-note">
                    {active
                        ? napping
                            ? "It is asleep right now. Go. Open the correct tool. It will wake furious."
                            : "It is awake and has already decided your next pick was wrong. Watch for the nap window — or keep clicking the character to encourage an early one."
                        : "It is safely recalled and judging you from the dashboard card. Nothing is sabotaged while it stays here."}
                </div>

                <div className="sn-meter-row">
                    <span className="sn-meter-label">
                        Grumpiness toward next nap
                    </span>

                    <div
                        className="sn-meter"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={MEDDLES_PER_NAP}
                        aria-valuenow={progress}
                    >
                        {Array.from(
                            { length: MEDDLES_PER_NAP },
                            (_, index) => (
                                <span
                                    key={index}
                                    className={
                                        index < progress
                                            ? "sn-meter-dot sn-meter-dot-on"
                                            : "sn-meter-dot"
                                    }
                                />
                            )
                        )}
                    </div>
                </div>

                <div className="sn-stats">
                    <span>Tools sabotaged</span>
                    <span>{meddles}</span>
                </div>

                <div className="sn-stats">
                    <span>Caught napping</span>
                    <span>{successes}</span>
                </div>

                <div className="sn-stats">
                    <span>Naps taken</span>
                    <span>{naps}</span>
                </div>

                <div className="sn-stats">
                    <span>Pokes delivered</span>
                    <span>{pokes}</span>
                </div>

            </section>
        </div>
    );
}

export default Sensei;