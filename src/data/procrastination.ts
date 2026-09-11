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

export type TaskCategoryId =
    | "exam"
    | "essay"
    | "math"
    | "code"
    | "project"
    | "creative"
    | "reading"
    | "generic";

export interface TaskKeywordRule {
    id: TaskCategoryId;
    keywords: string[];
}

export interface TaskContextTemplates {
    category: TaskCategoryId;
    name: string;
    studySteps: string[];
    distractions: ProcActivity[];
    punchlines: string[];
    giveUpLabels: string[];
}

export const taskKeywordRules: TaskKeywordRule[] = [
    {
        id: "exam",
        keywords: [
            "exam",
            "exams",
            "test",
            "tests",
            "quiz",
            "viva",
            "midsem",
            "midterm",
            "finals",
            "final exam",
        ],
    },
    {
        id: "essay",
        keywords: [
            "essay",
            "essays",
            "assignment",
            "report",
            "paper",
            "review",
            "draft",
        ],
    },
    {
        id: "math",
        keywords: [
            "math",
            "maths",
            "solve",
            "equation",
            "equations",
            "calculus",
            "algebra",
            "problem",
            "derive",
            "integrate",
            "physics",
        ],
    },
    {
        id: "code",
        keywords: [
            "code",
            "coding",
            "program",
            "programming",
            "app",
            "website",
            "debug",
            "build",
            "deploy",
            "api",
            "react",
            "frontend",
            "backend",
        ],
    },
    {
        id: "project",
        keywords: [
            "project",
            "presentation",
            "ppt",
            "slides",
            "demo",
            "thesis",
            "portfolio",
        ],
    },
    {
        id: "creative",
        keywords: [
            "draw",
            "drawing",
            "design",
            "paint",
            "sketch",
            "music",
            "video",
            "edit",
            "editing",
            "art",
            "illustrate",
            "poster",
        ],
    },
    {
        id: "reading",
        keywords: [
            "read",
            "reading",
            "chapter",
            "book",
            "literature",
            "notes",
            "article",
            "novel",
        ],
    },
];

export const taskContextTemplates: TaskContextTemplates[] = [
    {
        category: "exam",
        name: "Exam prep",
        studySteps: [
            "Open notes for {task}, close them with dread",
            "Panic-read a chapter of {task} material, absorb nothing",
            "Attempt a sample question on {task}, judge yourself instantly",
            "Revise yesterday's notes, which were never made",
        ],
        distractions: [
            {
                name: "Google 'how to study in one night' (for the third night running)",
                pool: "micro",
                min: 1,
                max: 4,
            },
            {
                name: "Text a friend to confirm {task} is really tomorrow",
                pool: "small",
                min: 4,
                max: 9,
            },
            {
                name: "Calculate the bare minimum marks needed",
                pool: "micro",
                min: 1,
                max: 4,
            },
            {
                name: "Write a perfect study timetable for next time",
                pool: "medium",
                min: 9,
                max: 18,
            },
            {
                name: "Watch 'How I scored 100% without studying'",
                pool: "medium",
                min: 9,
                max: 18,
            },
            {
                name: "Read about how exams ruin sleep (rhetorically)",
                pool: "deep",
                min: 20,
                max: 35,
            },
            {
                name: "Look at previous year papers and feel personally attacked",
                pool: "small",
                min: 4,
                max: 9,
            },
        ],
        punchlines: [
            "You have consumed {task} in exactly the wrong order.",
            "You could have finished {task} {time} ago. Your GPA would like a word.",
            "The exam is not scary. The you who does the exam is.",
        ],
        giveUpLabels: [
            "Give up and let tomorrow you handle it",
            "Admit the exam is a social construct after all",
            "Sleep with the textbook as an emotional support item",
        ],
    },
    {
        category: "essay",
        name: "Essay writing",
        studySteps: [
            "Stare at the blank page for {task} (this is drafting)",
            "Write the introduction to {task} for the third time",
            "Rearrange the same three {task} points into fresh paragraphs",
            "Read {task} aloud to judge its vibes",
        ],
        distractions: [
            {
                name: "Research fonts for the perfect title page",
                pool: "micro",
                min: 1,
                max: 4,
            },
            {
                name: "Check if citation formats get you arrested",
                pool: "small",
                min: 4,
                max: 9,
            },
            {
                name: "Update the resume to feel productive",
                pool: "medium",
                min: 9,
                max: 18,
            },
            {
                name: "Read Wikipedia articles adjacent to {task}",
                pool: "deep",
                min: 20,
                max: 40,
            },
            {
                name: "Watch video essays about writing video essays",
                pool: "medium",
                min: 9,
                max: 18,
            },
            {
                name: "Count how many references you could plausibly invent",
                pool: "small",
                min: 4,
                max: 9,
            },
            {
                name: "Reopen {task}, scroll straight to the word count",
                pool: "micro",
                min: 1,
                max: 3,
            },
        ],
        punchlines: [
            "Your thesis statement has left the chat.",
            "You could have finished {task} {time} ago. The word count remembers.",
            "Somewhere a citation is filing a restraining order.",
        ],
        giveUpLabels: [
            "Give up and cite Wikipedia",
            "Submit the placeholder draft and hope",
        ],
    },
    {
        category: "math",
        name: "Math problems",
        studySteps: [
            "Re-derive a formula for {task} you will never use",
            "Attempt one problem on {task}, then set it down gently",
            "Write up all the steps for {task}, omit the final one",
            "Stare at an equation for {task} until it feels like abstract art",
        ],
        distractions: [
            {
                name: "Verify a random symbol's Unicode history",
                pool: "micro",
                min: 1,
                max: 4,
            },
            {
                name: "Compute the exact marks needed to pass",
                pool: "micro",
                min: 1,
                max: 4,
            },
            {
                name: "Re-solve last week's problems to feel something",
                pool: "medium",
                min: 9,
                max: 18,
            },
            {
                name: "Watch a video on chaos theory as a palate cleanser",
                pool: "deep",
                min: 20,
                max: 40,
            },
            {
                name: "Check if your calculator dreams of solving things",
                pool: "small",
                min: 4,
                max: 9,
            },
            {
                name: "Memorise pi digits you will never need",
                pool: "medium",
                min: 9,
                max: 18,
            },
        ],
        punchlines: [
            "The math does not add up, and neither do you.",
            "You could have solved {task} {time} ago. The formula is waiting.",
            "Your final answer is correct in another dimension.",
        ],
        giveUpLabels: [
            "Give up and guess C",
            "Accept that 'show your work' means inventing it",
        ],
    },
    {
        category: "code",
        name: "Coding",
        studySteps: [
            "Refactor a function in {task} that was already working",
            "Rename variables in {task} until the code stops being suspicious",
            "Write a comment for {task} explaining what you wished you had done",
            "Run the linter on {task} and question your life choices",
        ],
        distractions: [
            {
                name: "Test if your keyboard has a satisfying spring",
                pool: "micro",
                min: 1,
                max: 4,
            },
            {
                name: "Reorganise your VS Code extensions by virtue",
                pool: "small",
                min: 4,
                max: 9,
            },
            {
                name: "Find the perfect colour scheme for {task} (again)",
                pool: "small",
                min: 4,
                max: 9,
            },
            {
                name: "Watch a video about Rust you will never use",
                pool: "deep",
                min: 20,
                max: 40,
            },
            {
                name: "Search your own stack trace on Stack Overflow",
                pool: "medium",
                min: 9,
                max: 18,
            },
            {
                name: "Rewrite the README for {task} as if anyone will read it",
                pool: "medium",
                min: 9,
                max: 18,
            },
            {
                name: "Check if your dependencies are still alive",
                pool: "micro",
                min: 1,
                max: 4,
            },
        ],
        punchlines: [
            "One of your dependencies is now deprecated, and so are you.",
            "You could have shipped {task} {time} ago; instead you shipped excuses.",
            "Your commit messages have become an apology tour.",
        ],
        giveUpLabels: [
            "Give up and push anyway",
            "Accept that the bug is now a feature",
        ],
    },
    {
        category: "project",
        name: "Project work",
        studySteps: [
            "Pick a slide theme for {task} (this is progress)",
            "Reorder the slides for {task} into a worse narrative",
            "Practise the {task} demo in your head",
            "Write bullet points for {task}, delete them for honesty",
        ],
        distractions: [
            {
                name: "Customise slide transitions, one painful second at a time",
                pool: "medium",
                min: 9,
                max: 18,
            },
            {
                name: "Rebrand your project folder for the fifth time",
                pool: "small",
                min: 4,
                max: 9,
            },
            {
                name: "Watch other people's presentations and feel superior",
                pool: "deep",
                min: 20,
                max: 40,
            },
            {
                name: "Update the README for the {task} demo nobody saw",
                pool: "medium",
                min: 9,
                max: 18,
            },
            {
                name: "Rehearse the presenter persona in the mirror",
                pool: "small",
                min: 4,
                max: 9,
            },
            {
                name: "Check the venue's projector budget",
                pool: "micro",
                min: 1,
                max: 4,
            },
        ],
        punchlines: [
            "The slideshow will outlive the project.",
            "You could have delivered {task} {time} ago. The projector disagrees.",
            "Your demo gods have been summoned and they are laughing.",
        ],
        giveUpLabels: [
            "Give up and present from memory",
            "Submit the slides, run from the room",
        ],
    },
    {
        category: "creative",
        name: "Creative work",
        studySteps: [
            "Sketch thumbnails for {task}, skip the real work",
            "Moodboard {task} (this is definitely progress)",
            "Reorganise every brush and filter for {task}",
            "Doodle concepts for {task}, call it ideation",
        ],
        distractions: [
            {
                name: "Test every brush in the pack, one at a time",
                pool: "small",
                min: 4,
                max: 9,
            },
            {
                name: "Curate references for {task} you will never open again",
                pool: "small",
                min: 4,
                max: 9,
            },
            {
                name: "Redesign your own logo for the fourth time",
                pool: "medium",
                min: 9,
                max: 18,
            },
            {
                name: "Rearrange your workspace into an aesthetic habitat",
                pool: "medium",
                min: 9,
                max: 18,
            },
            {
                name: "Watch timelapses of other people finishing things",
                pool: "deep",
                min: 20,
                max: 40,
            },
            {
                name: "Stare at your own portfolio with mild nausea",
                pool: "micro",
                min: 1,
                max: 4,
            },
        ],
        punchlines: [
            "Your muse has requested a cease and desist.",
            "You could have finished {task} {time} ago. The canvas remembers.",
            "Your process is beautiful. Your output is not.",
        ],
        giveUpLabels: [
            "Give up and post a 'progress' shot",
            "Declare the piece finished, then plan a v2",
        ],
    },
    {
        category: "reading",
        name: "Reading",
        studySteps: [
            "Read the first page of {task} as a warm-up",
            "Summarise {task} in your head, realise you were skimming",
            "Annotate {task} with questionable authority",
            "Re-read the same sentence of {task} five times",
        ],
        distractions: [
            {
                name: "Test how long you can stare at a single word",
                pool: "micro",
                min: 1,
                max: 4,
            },
            {
                name: "Look up the author's Wikipedia page",
                pool: "small",
                min: 4,
                max: 9,
            },
            {
                name: "Buy a second book about {task}, read neither",
                pool: "small",
                min: 4,
                max: 9,
            },
            {
                name: "Watch a summary video of {task} instead",
                pool: "medium",
                min: 9,
                max: 18,
            },
            {
                name: "Skim the discussion questions and pre-mourn",
                pool: "medium",
                min: 9,
                max: 18,
            },
            {
                name: "Start a reading journal for the introspective reader",
                pool: "deep",
                min: 20,
                max: 35,
            },
        ],
        punchlines: [
            "The book has aged better than your commitment.",
            "You could have finished {task} {time} ago. The bookmark remembers.",
            "Cliff notes are now the cliff you fell off.",
        ],
        giveUpLabels: [
            "Give up and watch the film adaptation",
            "Accept the summary as canon",
        ],
    },
    {
        category: "generic",
        name: "General",
        studySteps: [
            "Study — {task}",
            "Rebuild your notes for {task} from scratch",
            "Skim the material for {task}, call it revision",
            "Plan how to approach {task}, exhaust yourself",
        ],
        distractions: [],
        punchlines: [
            "You could have finished {task} {time} ago. You chose emotions instead.",
            "Your to-do list has filed a complaint about being ignored.",
            "Even your notifications feel bad for you now.",
        ],
        giveUpLabels: [
            "Give up",
            "Surrender",
            "Declare the task a social construct and rest",
            "Accept this is a lifestyle, not an evening",
        ],
    },
];