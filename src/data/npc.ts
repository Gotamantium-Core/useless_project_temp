export interface NpcStat {
    id: string;
    label: string;
}

export type NpcStatValue =
    Record<string, number>;

export interface NpcProfile {
    name: string;
    stats: NpcStatValue;
    ability: string;
    quote: string;
}

export const npcStats: NpcStat[] = [
    {
        id: "attendance",
        label: "Class Attendance",
    },
    {
        id: "sleep",
        label: "Sleep Schedule",
    },
    {
        id: "debt",
        label: "Assignment Debt",
    },
    {
        id: "social",
        label: "Social Battery",
    },
    {
        id: "canteen",
        label: "Canteen Dependency",
    },
];

export const npcAbilities: string[] = [
    "I'll start tomorrow",
    "Selective hearing: immune to morning announcements",
    "Emergency nap reserve",
    "Teleport: disappears the moment group work is mentioned",
    "Blackout: has no memory of last night's deadline",
    "Charm: somehow passes despite doing nothing",
    "Caffeine manipulation",
    "Lethargy aura: slows productivity of nearby students",
    "Procrastination shield: deflects all guilt",
    "Critical stare: intimidates professors into extending deadlines",
    "Wiki walk: follows one search into three hours of unrelated facts",
    "Social battery singularity",
    "Photographic memory, selectively erased",
    "Summon friend 'just checking in' every 4 minutes",
    "Ability to hear the canteen menu from any lecture hall",
    "Regeneration: recovers fully between weekend naps",
    "Crowd camo: blends into corridors when seen by faculty",
    "Deferred: pushes all tasks to an undefined future self",
];

export const npcQuotes: string[] = [
    "This NPC spawns only during free food events.",
    "Quest reward: one (1) genuine hi from a friend.",
    "Reputation with Study Group: Avoided.",
    "Does not have any quests for you. Only excuses.",
    "Dialogues reset every morning: 'how was the exam?'",
    "Feared by deadlines, loved by the chai stall.",
    "Has a 2% chance to appear in the library.",
    "Ambient dialogue: 'same pinch', delivered with no emotion.",
    "Refuses to fast-travel; the walk is character development.",
    "Also exists in the group chat. Barely.",
    "Has never unlocked the 'submitted on time' achievement.",
    "Warning: may aggro if asked about attendance.",
    "Respawn point: the last bench of every classroom.",
    "Side quest: find this NPC's charger. Reward: gratitude.",
    "Vulnerable to sunlight between 8 AM and 10 AM.",
    "Inventory: three pens, zero intention.",
    "Known to drop rare loot item: perfect notes (unused).",
    "This profile will be updated next semester. Probably.",
];