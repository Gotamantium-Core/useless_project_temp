import {
    degradationTips,
    mediocrePasswords,
    rejectionReasons,
    securityMetrics,
} from "../data/passwords";

import type { PasswordReport } from "../data/passwords";

function pick<T>(items: readonly T[]): T {
    return items[
        Math.floor(Math.random() * items.length)
    ];
}

export function hasStrongChars(password: string): boolean {
    return /[^a-zA-Z]/.test(password);
}

export function analyzePassword(
    password: string
): PasswordReport {
    const rejected = hasStrongChars(password);

    if (rejected) {
        return {
            rejected: true,
            rejection: pick(rejectionReasons),
            replacement: pick(mediocrePasswords),
            tips: [],
            metrics: securityMetrics,
        };
    }

    return {
        rejected: false,
        rejection: "",
        replacement: pick(mediocrePasswords),
        tips: [pick(degradationTips), pick(degradationTips)],
        metrics: securityMetrics,
    };
}

export function rerollPassword(
    report: PasswordReport
): PasswordReport {
    return {
        ...report,
        replacement: pick(mediocrePasswords),
    };
}