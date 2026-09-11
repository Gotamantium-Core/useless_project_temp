export type ProcKind =
    | "study"
    | "distraction"
    | "giveup";

export type ProcPoolId =
    | "micro"
    | "small"
    | "medium"
    | "deep";

export type ProcLevelId =
    | "dabbling"
    | "avoidance"
    | "olympic";

export interface ProcActivity {
    name: string;
    pool: ProcPoolId;
    min: number;
    max: number;
}

export interface ProcLevel {
    id: ProcLevelId;
    name: string;
    description: string;
    waves: ReadonlyArray<ReadonlyArray<ProcPoolId>>;
    perWaveMin: number;
    perWaveMax: number;
    studyNeededMin: number;
    studyNeededMax: number;
}

export const procActivities: ProcActivity[] = [
    {
        name: "Check Instagram",
        pool: "micro",
        min: 1,
        max: 4,
    },
    {
        name: "Check Twitter",
        pool: "micro",
        min: 1,
        max: 4,
    },
    {
        name: "Look at notifications, find none, reload anyway",
        pool: "micro",
        min: 1,
        max: 3,
    },
    {
        name: "Refresh email (nothing new)",
        pool: "micro",
        min: 1,
        max: 3,
    },
    {
        name: "Look out the window meaningfully",
        pool: "micro",
        min: 1,
        max: 4,
    },
    {
        name: "Quote something to the group chat",
        pool: "micro",
        min: 1,
        max: 4,
    },
    {
        name: "Get water",
        pool: "small",
        min: 4,
        max: 9,
    },
    {
        name: "Make a coffee you will consume cold",
        pool: "small",
        min: 4,
        max: 8,
    },
    {
        name: "Stretch for 90 seconds, feel accomplished",
        pool: "small",
        min: 4,
        max: 9,
    },
    {
        name: "Water a plant that does not need water",
        pool: "small",
        min: 4,
        max: 8,
    },
    {
        name: "Text someone “hahaha” to revive a conversation",
        pool: "small",
        min: 4,
        max: 9,
    },
    {
        name: "Rearrange the pen jar by colour",
        pool: "small",
        min: 4,
        max: 10,
    },
    {
        name: "Rearrange desktop icons into a satisfying grid",
        pool: "medium",
        min: 9,
        max: 18,
    },
    {
        name: "Sort the Downloads folder by relevance to your life",
        pool: "medium",
        min: 9,
        max: 20,
    },
    {
        name: "Update the to-do list app (no tasks were added)",
        pool: "medium",
        min: 9,
        max: 17,
    },
    {
        name: "Watch a study motivation video",
        pool: "medium",
        min: 9,
        max: 18,
    },
    {
        name: "Tidy your desk with aggressive enthusiasm",
        pool: "medium",
        min: 9,
        max: 20,
    },
    {
        name: "Plan how to study instead of actually studying",
        pool: "medium",
        min: 9,
        max: 20,
    },
    {
        name: "Watch “How CPUs Work”",
        pool: "deep",
        min: 20,
        max: 35,
    },
    {
        name: "Research mechanical keyboards (seriously)",
        pool: "deep",
        min: 22,
        max: 40,
    },
    {
        name: "Fall down a Wikipedia hole adjacent to the exam",
        pool: "deep",
        min: 20,
        max: 40,
    },
    {
        name: "Watch a 45-minute essay on a topic you do not need",
        pool: "deep",
        min: 24,
        max: 45,
    },
    {
        name: "Reorganise notes into a new and worse colour system",
        pool: "deep",
        min: 20,
        max: 40,
    },
    {
        name: "Remind everyone you're “almost done”",
        pool: "deep",
        min: 20,
        max: 35,
    },
];

export const procLevels: ProcLevel[] = [
    {
        id: "dabbling",
        name: "Casual Dabbling",
        description:
            "A gentle, largely symbolic attempt.",
        waves: [
            ["micro", "small"],
            ["micro", "small", "medium"],
        ],
        perWaveMin: 1,
        perWaveMax: 3,
        studyNeededMin: 20,
        studyNeededMax: 35,
    },
    {
        id: "avoidance",
        name: "Professional Avoidance",
        description:
            "Full-time dedication to doing nothing.",
        waves: [
            ["micro", "small"],
            ["small", "medium"],
            ["small", "medium", "deep"],
        ],
        perWaveMin: 1,
        perWaveMax: 3,
        studyNeededMin: 25,
        studyNeededMax: 45,
    },
    {
        id: "olympic",
        name: "Olympic Procrastination",
        description:
            "A gold-medal performance in wasting time.",
        waves: [
            ["micro", "small"],
            ["small", "medium"],
            ["medium", "deep"],
            ["deep"],
        ],
        perWaveMin: 2,
        perWaveMax: 3,
        studyNeededMin: 30,
        studyNeededMax: 55,
    },
];