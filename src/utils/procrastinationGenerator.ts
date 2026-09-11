import {
    procActivities,
    procLevels,
} from "../data/procrastination";

import type {
    ProcActivity,
    ProcKind,
    ProcLevel,
    ProcLevelId,
    ProcPoolId,
} from "../data/procrastination";

import { parseTask } from "./taskParser";

import type { TaskContext } from "./taskParser";

export interface ProcEntry {
    minute: number;
    time: string;
    label: string;
    kind: ProcKind;
}

export interface ProcStats {
    procrastinatedMinutes: number;
    productivityAvoidedMinutes: number;
    unnecessaryActivities: number;
    regretMinutesAgo: number;
}

export interface ProcSchedule {
    entries: ProcEntry[];
    stats: ProcStats;
    totalMinutes: number;
    categoryName: string;
    punchline: string;
}

const START_MINUTES = 20 * 60;

const CONTEXTUAL_BIAS = 0.55;

function randInt(min: number, max: number): number {
    return (
        Math.floor(Math.random() * (max - min + 1)) +
        min
    );
}

function pick<T>(items: readonly T[]): T {
    return items[
        Math.floor(Math.random() * items.length)
    ];
}

function formatTime(minuteOfDay: number): string {
    const hours = Math.floor(minuteOfDay / 60);
    const minutes = minuteOfDay % 60;

    const period = hours >= 12 ? "PM" : "AM";
    let hour = hours % 12;

    if (hour === 0) {
        hour = 12;
    }

    return `${hour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function formatRegretLabel(minutes: number): string {
    const rounded = Math.round(minutes);

    return rounded === 1
        ? "1 minute"
        : `${rounded} minutes`;
}

function fillPlaceholders(
    text: string,
    shortTask: string,
    timeLabel?: string
): string {
    let filled = text.replaceAll("{task}", shortTask);

    if (timeLabel !== undefined) {
        filled = filled.replaceAll("{time}", timeLabel);
    }

    return filled;
}

function pickPool(
    pools: ReadonlyArray<ProcLevel["waves"][number][number]>
) {
    const index = Math.floor(
        Math.pow(Math.random(), 1.4) * pools.length
    );

    return pools[index];
}

function pickActivity(poolId: ProcPoolId): ProcActivity {
    const options = procActivities.filter(
        (activity) => activity.pool === poolId
    );

    return pick(options);
}

function pickDistraction(
    poolId: ProcPoolId,
    context: TaskContext
): ProcActivity {
    const contextual =
        context.templates.distractions.filter(
            (activity) => activity.pool === poolId
        );

    let activity: ProcActivity;

    if (
        contextual.length > 0 &&
        Math.random() < CONTEXTUAL_BIAS
    ) {
        activity = pick(contextual);
    } else {
        activity = pickActivity(poolId);
    }

    return {
        ...activity,
        name: fillPlaceholders(
            activity.name,
            context.shortTask
        ),
    };
}

export function generateSchedule(
    task: string,
    levelId: ProcLevelId
): ProcSchedule {
    const context = parseTask(task);

    const level =
        procLevels.find((candidate) => candidate.id === levelId) ??
        procLevels[0];

    const entries: ProcEntry[] = [];
    let minute = 0;
    let procrastinatedMinutes = 0;
    let unnecessaryActivities = 0;
    let lastDistraction = "";

    const shortTask = context.shortTask;

    function push(
        kind: ProcKind,
        label: string,
        duration: number
    ) {
        entries.push({
            minute,
            time: formatTime(START_MINUTES + minute),
            label,
            kind,
        });

        minute += duration;
    }

    push(
        "study",
        fillPlaceholders(
            pick(context.templates.studySteps),
            shortTask
        ),
        randInt(2, 5)
    );

    level.waves.forEach((wave) => {
        const count = randInt(
            level.perWaveMin,
            level.perWaveMax
        );

        for (let i = 0; i < count; i += 1) {
            const poolId = pickPool(wave);
            let activity = pickDistraction(poolId, context);

            if (activity.name === lastDistraction) {
                const retry = pickDistraction(poolId, context);

                if (retry.name !== activity.name) {
                    activity = retry;
                }
            }

            lastDistraction = activity.name;

            const duration = randInt(
                activity.min,
                activity.max
            );

            push("distraction", activity.name, duration);

            procrastinatedMinutes += duration;
            unnecessaryActivities += 1;
        }

        push(
            "study",
            fillPlaceholders(
                pick(context.templates.studySteps),
                shortTask
            ),
            randInt(1, 3)
        );
    });

    const giveUpLabel = fillPlaceholders(
        pick(context.templates.giveUpLabels),
        shortTask
    );

    entries[entries.length - 1] = {
        ...entries[entries.length - 1],
        label: `${entries[entries.length - 1].label}, then…`,
    };

    push("giveup", giveUpLabel, 0);

    const productivityAvoidedMinutes = randInt(
        level.studyNeededMin,
        level.studyNeededMax
    );

    const totalMinutes = minute;

    const regretMinutesAgo = Math.max(
        0,
        totalMinutes - productivityAvoidedMinutes
    );

    const punchline = fillPlaceholders(
        pick(context.templates.punchlines),
        shortTask,
        formatRegretLabel(regretMinutesAgo)
    );

    return {
        entries,
        totalMinutes,
        categoryName: context.templates.name,
        punchline,
        stats: {
            procrastinatedMinutes,
            productivityAvoidedMinutes,
            unnecessaryActivities,
            regretMinutesAgo,
        },
    };
}