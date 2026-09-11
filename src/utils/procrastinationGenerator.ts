import {
    procActivities,
    procLevels,
} from "../data/procrastination";

import type {
    ProcActivity,
    ProcKind,
    ProcLevel,
    ProcLevelId,
} from "../data/procrastination";

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
}

const START_MINUTES = 20 * 60;

const GIVE_UP_LABELS = [
    "Give up",
    "Surrender",
    "Accept this is a lifestyle, not an evening",
    "Declare the exam a social construct and rest",
];

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

function truncate(text: string, max: number): string {
    if (text.length <= max) {
        return text;
    }

    return `${text.slice(0, max - 1).trimEnd()}…`;
}

function pickPool(
    pools: ReadonlyArray<ProcLevel["waves"][number][number]>
) {
    const index = Math.floor(
        Math.pow(Math.random(), 1.4) * pools.length
    );

    return pools[index];
}

function pickActivity(poolId: ProcLevel["waves"][number][number]): ProcActivity {
    const options = procActivities.filter(
        (activity) => activity.pool === poolId
    );

    return pick(options);
}

export function generateSchedule(
    task: string,
    levelId: ProcLevelId
): ProcSchedule {
    const level =
        procLevels.find((candidate) => candidate.id === levelId) ??
        procLevels[0];

    const entries: ProcEntry[] = [];
    let minute = 0;
    let procrastinatedMinutes = 0;
    let unnecessaryActivities = 0;
    let lastDistraction = "";

    const shortTask = truncate(task.trim(), 52);

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
        `Study — ${shortTask}`,
        randInt(2, 5)
    );

    level.waves.forEach((wave) => {
        const count = randInt(
            level.perWaveMin,
            level.perWaveMax
        );

        for (let i = 0; i < count; i += 1) {
            const poolId = pickPool(wave);
            let activity = pickActivity(poolId);

            if (activity.name === lastDistraction) {
                const retry = pickActivity(poolId);

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
            `Study — ${shortTask}`,
            randInt(1, 3)
        );
    });

    const giveUpLabel = pick(GIVE_UP_LABELS);

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

    return {
        entries,
        totalMinutes,
        stats: {
            procrastinatedMinutes,
            productivityAvoidedMinutes,
            unnecessaryActivities,
            regretMinutesAgo: Math.max(
                0,
                totalMinutes - productivityAvoidedMinutes
            ),
        },
    };
}