import { useState } from "react";

import { procLevels } from "../data/procrastination";

import type {
    ProcLevelId,
} from "../data/procrastination";

import { generateSchedule } from "../utils/procrastinationGenerator";

import type {
    ProcSchedule,
} from "../utils/procrastinationGenerator";

import "./ProcrastinationOptimizer.css";

function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const rest = minutes - hours * 60;

    return rest === 0
        ? `${hours} hr`
        : `${hours} hr ${rest} min`;
}

function formatRegret(minutes: number): string {
    const rounded = Math.round(minutes);

    if (rounded === 1) {
        return "1 minute";
    }

    return `${rounded} minutes`;
}

function ProcrastinationOptimizer() {
    const [task, setTask] = useState<string>("");
    const [levelId, setLevelId] =
        useState<ProcLevelId>("avoidance");
    const [schedule, setSchedule] =
        useState<ProcSchedule | null>(null);
    const [generatedCount, setGeneratedCount] =
        useState<number>(0);
    const [planId, setPlanId] = useState<number>(0);

    function handleGenerate() {
        if (task.trim().length === 0) {
            return;
        }

        setPlanId((id) => id + 1);

        setSchedule(generateSchedule(task, levelId));
        setGeneratedCount((count) => count + 1);
    }

    const statsRows = schedule
        ? [
              {
                  label: "Total time procrastinated",
                  value: formatDuration(
                      schedule.stats.procrastinatedMinutes
                  ),
              },
              {
                  label: "Productivity avoided",
                  value: formatDuration(
                      schedule.stats.productivityAvoidedMinutes
                  ),
              },
              {
                  label: "Unnecessary activities",
                  value: String(
                      schedule.stats.unnecessaryActivities
                  ),
              },
              {
                  label: "Evening lost",
                  value: formatDuration(
                      schedule.totalMinutes
                  ),
              },
          ]
        : [];

    return (
        <div className="proc-page">

            <header className="proc-header">
                <div className="proc-eyebrow">
                    UselessOS™ / Utility
                </div>

                <h1 className="proc-title">
                    The Procrastination Optimizer
                </h1>

                <p className="proc-subtitle">
                    Machine-learning-free optimisation
                    technology that converts a doomed goal
                    into a beautifully choreographed
                    evening of doing anything else.
                </p>
            </header>

            <section className="proc-card">

                <div className="proc-form">

                    <div className="form-group">
                        <label
                            className="form-label"
                            htmlFor="proc-task"
                        >
                            Your task
                        </label>

                        <input
                            id="proc-task"
                            className="proc-input"
                            type="text"
                            value={task}
                            onChange={(e) =>
                                setTask(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleGenerate();
                                }
                            }}
                            placeholder="Study for tomorrow's exam"
                            spellCheck={false}
                        />
                    </div>

                    <div className="form-group">

                        <div>
                            <div className="form-label">
                                Procrastination level
                            </div>

                            <p className="form-hint">
                                How seriously should we
                                take avoiding the task?
                            </p>
                        </div>

                        <div className="proc-level-grid">

                            {procLevels.map((level) => (
                                <label
                                    className="level-option"
                                    key={level.id}
                                >
                                    <input
                                        type="radio"
                                        name="proc-level"
                                        value={level.id}
                                        checked={levelId === level.id}
                                        onChange={() =>
                                            setLevelId(level.id)
                                        }
                                    />

                                    <span className="level-button">
                                        <span className="level-name">
                                            {level.name}
                                        </span>

                                        <span className="level-description">
                                            {level.description}
                                        </span>
                                    </span>
                                </label>
                            ))}

                        </div>
                    </div>

                    <button
                        className="generate-button"
                        onClick={handleGenerate}
                        disabled={task.trim().length === 0}
                    >
                        Generate optimal schedule
                    </button>

                </div>

                <div className="proc-result-wrap">

                    {schedule ? (
                        <div
                            className="proc-result"
                            aria-live="polite"
                        >

                            <p className="result-label">
                                Your optimised evening ·
                                starting 8:00 PM
                            </p>

                            <ol className="proc-timeline">
                                {schedule.entries.map(
                                    (entry, index) => (
                                        <li
                                            className={[
                                                "proc-entry",
                                                `proc-entry-${entry.kind}`,
                                            ].join(" ")}
                                            key={`${planId}-${index}`}
                                            style={{
                                                animationDelay: `${index * 0.07}s`,
                                            }}
                                        >
                                            <span className="proc-entry-time">
                                                {entry.time}
                                            </span>

                                            <span className="proc-entry-line" />

                                            <span className="proc-entry-label">
                                                {entry.label}
                                            </span>
                                        </li>
                                    )
                                )}
                            </ol>

                            <div className="proc-metrics">
                                {statsRows.map((row) => (
                                    <div
                                        className="proc-metric"
                                        key={row.label}
                                    >
                                        <span className="proc-metric-label">
                                            {row.label}
                                        </span>

                                        <span className="proc-metric-value">
                                            {row.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="proc-punchline">
                                <p className="punchline-text">
                                    You could have finished
                                    this{" "}
                                    <strong>
                                        {formatRegret(
                                            schedule.stats.regretMinutesAgo
                                        )}
                                    </strong>{" "}
                                    ago.
                                </p>

                                <p className="punchline-sub">
                                    Instead, it is now a
                                    core memory and a
                                    personality trait.
                                </p>
                            </div>

                            <button
                                className="proc-again-button"
                                onClick={handleGenerate}
                            >
                                Mix it up again
                            </button>

                        </div>
                    ) : (
                        <div className="proc-result proc-result-empty">
                            <p className="result-label">
                                No avoidance scheduled yet
                            </p>

                            <p className="result-placeholder">
                                Enter a task, choose a level
                                of commitment to not doing
                                it, and press generate. Your
                                meticulously wasted evening
                                will appear here.
                            </p>
                        </div>
                    )}

                </div>

                <div className="proc-stats">
                    <span>Schedules generated</span>
                    <span>{generatedCount}</span>
                </div>

            </section>
        </div>
    );
}

export default ProcrastinationOptimizer;