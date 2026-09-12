import { useState } from "react";

import { analyzePassword, rerollPassword } from "../utils/passwordDegrader";

import type { PasswordReport } from "../data/passwords";

import "./PasswordDegrader.css";

function PasswordDegrader() {
    const [password, setPassword] = useState<string>("");
    const [report, setReport] =
        useState<PasswordReport | null>(null);
    const [generatedCount, setGeneratedCount] =
        useState<number>(0);

    function handleAnalyze() {
        if (password.trim().length === 0) {
            return;
        }

        setReport(analyzePassword(password));
        setGeneratedCount((count) => count + 1);
    }

    function handleReroll() {
        if (!report) {
            return;
        }

        setReport(rerollPassword(report));
    }

    return (
        <div className="pwd-page">

            <header className="pwd-header">
                <div className="pwd-eyebrow">
                    UselessOS™ / Utility
                </div>

                <h1 className="pwd-title">
                    Password Strength Degrader
                </h1>

                <p className="pwd-subtitle">
                    A security auditor with fundamentally
                    antisocial priorities. Analyzes
                    perfectly secure passwords, then
                    persuades them to abandon their
                    principles.
                </p>
            </header>

            <section className="pwd-card">

                <div className="pwd-form">

                    <div className="form-group">
                        <label
                            className="form-label"
                            htmlFor="pwd-input"
                        >
                            Your password
                        </label>

                        <input
                            id="pwd-input"
                            className="pwd-input"
                            type="text"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleAnalyze();
                                }
                            }}
                            placeholder="A genuinely strong password, ideally"
                            spellCheck={false}
                            autoComplete="off"
                        />
                    </div>

                    <button
                        className="generate-button"
                        onClick={handleAnalyze}
                        disabled={password.trim().length === 0}
                    >
                        Degrade my password
                    </button>

                </div>

                {report ? (
                    <div
                        className="pwd-result"
                        aria-live="polite"
                        key={generatedCount}
                    >

                        {report.rejected ? (
                            <div className="pwd-rejection">
                                <p className="result-label">
                                    Submission rejected
                                </p>

                                <p className="pwd-rejection-text">
                                    {report.rejection}
                                </p>

                                <div className="pwd-suggestion">
                                    <span className="pwd-suggestion-label">
                                        While you're at it,
                                        might we suggest:
                                    </span>

                                    <code className="pwd-suggestion-code">
                                        {report.replacement}
                                    </code>
                                </div>
                            </div>
                        ) : (
                            <div className="pwd-analysis">

                                <div className="pwd-analysis-head">
                                    <p className="result-label">
                                        Analysis complete
                                    </p>

                                    <div className="pwd-badge">
                                        Degraded
                                    </div>
                                </div>

                                <p className="pwd-reviewed">
                                    Reviewed:{" "}
                                    <span className="pwd-reviewed-value">
                                        {password}
                                    </span>
                                </p>

                                <div className="pwd-metrics">
                                    <div className="pwd-metric">
                                        <span className="pwd-metric-label">
                                            Security level
                                        </span>

                                        <span className="pwd-metric-value">
                                            {report.metrics.security}
                                        </span>
                                    </div>

                                    <div className="pwd-metric">
                                        <span className="pwd-metric-label">
                                            Time to crack
                                        </span>

                                        <span className="pwd-metric-value">
                                            {report.metrics.crackTime}
                                        </span>
                                    </div>

                                    <div className="pwd-metric">
                                        <span className="pwd-metric-label">
                                            Memorability
                                        </span>

                                        <span className="pwd-metric-value">
                                            {report.metrics.memorability}
                                        </span>
                                    </div>
                                </div>

                                <div className="pwd-tips">
                                    <p className="result-label">
                                        Helpful tips
                                    </p>

                                    <ul className="pwd-tips-list">
                                        {report.tips.map(
                                            (tip, index) => (
                                                <li
                                                    key={index}
                                                >
                                                    {tip}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>

                                <div className="pwd-suggestion">
                                    <span className="pwd-suggestion-label">
                                        Magnificently worse:
                                    </span>

                                    <code className="pwd-suggestion-code">
                                        {report.replacement}
                                    </code>
                                </div>

                                <button
                                    className="pwd-again-button"
                                    onClick={handleReroll}
                                >
                                    Suggest a worse one
                                </button>

                            </div>
                        )}

                    </div>
                ) : (
                    <div className="pwd-result pwd-result-empty">
                        <p className="result-label">
                            No password harmed yet
                        </p>

                        <p className="result-placeholder">
                            Enter a password and press degrade.
                            Our auditor will either reject it
                            for being too responsible, or
                            gently talk it out of having
                            integrity.
                        </p>
                    </div>
                )}

                <div className="pwd-stats">
                    <span>Passwords wrecked</span>
                    <span>{generatedCount}</span>
                </div>

            </section>
        </div>
    );
}

export default PasswordDegrader;