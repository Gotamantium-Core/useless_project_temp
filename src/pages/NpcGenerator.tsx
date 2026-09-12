import { useState } from "react";

import { npcStats } from "../data/npc";

import type { NpcProfile } from "../data/npc";

import { generateNpcProfile } from "../utils/npcGenerator";

import "./NpcGenerator.css";

function NpcGenerator() {
    const [name, setName] = useState<string>("");
    const [profile, setProfile] =
        useState<NpcProfile | null>(null);
    const [generatedCount, setGeneratedCount] =
        useState<number>(0);
    const [profileId, setProfileId] = useState<number>(0);

    function handleGenerate() {
        if (name.trim().length === 0) {
            return;
        }

        setProfileId((id) => id + 1);

        setProfile(generateNpcProfile(name));
        setGeneratedCount((count) => count + 1);
    }

    function handleReRoll() {
        if (name.trim().length === 0) {
            return;
        }

        setProfileId((id) => id + 1);

        setProfile(generateNpcProfile(name));
        setGeneratedCount((count) => count + 1);
    }

    return (
        <div className="npc-page">

            <header className="npc-header">
                <div className="npc-eyebrow">
                    UselessOS™ / Utility
                </div>

                <h1 className="npc-title">
                    Campus NPC Generator
                </h1>

                <p className="npc-subtitle">
                    Transforms your classmates into
                    low-resolution RPG characters with
                    questionable stats and zero side
                    quests.
                </p>
            </header>

            <section className="npc-card">

                <div className="npc-form">

                    <div className="form-group">
                        <label
                            className="form-label"
                            htmlFor="npc-name"
                        >
                            Character name
                        </label>

                        <input
                            id="npc-name"
                            className="npc-input"
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleGenerate();
                                }
                            }}
                            placeholder="Arjun"
                            spellCheck={false}
                        />
                    </div>

                    <button
                        className="generate-button"
                        onClick={handleGenerate}
                        disabled={name.trim().length === 0}
                    >
                        Generate NPC
                    </button>

                </div>

                <div className="npc-result-wrap">

                    {profile ? (
                        <div
                            className="npc-result"
                            aria-live="polite"
                            key={profileId}
                        >

                            <div className="npc-profile-card">

                                <div className="npc-profile-name">
                                    {profile.name}
                                </div>

                                <div className="npc-stat-list">
                                    {npcStats.map((stat) => {
                                        const value =
                                            profile.stats[
                                                stat.id
                                            ] ?? 0;

                                        return (
                                            <div
                                                className="npc-stat"
                                                key={stat.id}
                                            >
                                                <div className="npc-stat-row">
                                                    <span className="npc-stat-label">
                                                        {stat.label}
                                                    </span>

                                                    <span className="npc-stat-value">
                                                        {value}%
                                                    </span>
                                                </div>

                                                <div className="npc-stat-track">
                                                    <div
                                                        className={[
                                                            "npc-stat-fill",
                                                            `npc-stat-fill--${stat.id}`,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" ")}
                                                        style={{
                                                            width: `${value}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="npc-ability">
                                    <span className="npc-ability-label">
                                        Special Ability
                                    </span>

                                    <span className="npc-ability-text">
                                        {profile.ability}
                                    </span>
                                </div>

                            </div>

                            <div className="npc-quote">
                                <p className="npc-quote-text">
                                    “{profile.quote}”
                                </p>
                            </div>

                            <button
                                className="npc-again-button"
                                onClick={handleReRoll}
                            >
                                Mix it up again
                            </button>

                        </div>
                    ) : (
                        <div className="npc-result npc-result-empty">
                            <p className="result-label">
                                No character detected
                            </p>

                            <p className="result-placeholder">
                                Enter someone's name and press
                                generate. Their completely
                                useless RPG profile will
                                appear here.
                            </p>
                        </div>
                    )}

                </div>

                <div className="npc-stats">
                    <span>NPCs generated</span>
                    <span>{generatedCount}</span>
                </div>

            </section>
        </div>
    );
}

export default NpcGenerator;