import { useSyncExternalStore } from "react";

import {
    activateSmudges,
    deactivateSmudges,
    getActive,
    getSessions,
    reSmudge,
    subscribe,
} from "../utils/smudgeStore";

import "./ScreenSmudger.css";

function ScreenSmudger() {
    const active = useSyncExternalStore(subscribe, getActive);
    const sessions = useSyncExternalStore(
        subscribe,
        getSessions
    );

    function handleToggle() {
        if (active) {
            deactivateSmudges();
        } else {
            activateSmudges();
        }
    }

    return (
        <div className="smg-page">

            <header className="smg-header">
                <div className="smg-eyebrow">
                    UselessOS™ / Interface
                </div>

                <h1 className="smg-title">
                    The Virtual Screen Smudger
                </h1>

                <p className="smg-subtitle">
                    An embedded script that applies decades
                    of grime to your screen in seconds.
                    Fingerprints, coffee rings, dust — all
                    lovingly rendered and un-wipeable. Until
                    you press Remove, obviously.
                </p>
            </header>

            <section className="smg-card">

                <div className="smg-status-row">
                    <span className="smg-status-label">
                        Current screen state
                    </span>

                    <span
                        className={
                            active
                                ? "smg-status smg-status-active"
                                : "smg-status"
                        }
                    >
                        {active
                            ? "Ruinously dirty"
                            : "Suspiciously clean"}
                    </span>
                </div>

                <p className="smg-description">
                    Activate to smear fingerprints, coffee
                    rings, and a fine layer of dust over the
                    whole site — every page, every tool,
                    right on top of the DOM. It never blocks
                    clicks, and it never deletes itself.
                    When you've had enough, one button (this
                    page or the floating pill) restores order.
                </p>

                <div className="smg-actions">
                    {active ? (
                        <>
                            <button
                                type="button"
                                className="generate-button"
                                onClick={handleToggle}
                            >
                                Remove the smudges
                            </button>

                            <button
                                type="button"
                                className="smg-again-button"
                                onClick={reSmudge}
                            >
                                Re-smudge (fresh grime)
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="generate-button"
                            onClick={handleToggle}
                        >
                            Smudge the entire site
                        </button>
                    )}
                </div>

                <div className="smg-note">
                    {active
                        ? "The smudges are live site-wide right now. A Remove smudges pill is floating in the corner for emergencies."
                        : "Smudges are currently off. The site looks clean. We both know it can't last."}
                </div>

                <div className="smg-stats">
                    <span>Times smudged</span>
                    <span>{sessions}</span>
                </div>

            </section>
        </div>
    );
}

export default ScreenSmudger;