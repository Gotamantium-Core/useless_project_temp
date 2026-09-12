import { npcAbilities, npcQuotes, npcStats } from "../data/npc";

import type {
    NpcProfile,
    NpcStatValue,
} from "../data/npc";

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

export function generateNpcProfile(name: string): NpcProfile {
    const stats: NpcStatValue = {};

    npcStats.forEach((stat) => {
        stats[stat.id] = randInt(0, 100);
    });

    return {
        name: name.trim(),
        stats,
        ability: pick(npcAbilities),
        quote: pick(npcQuotes),
    };
}