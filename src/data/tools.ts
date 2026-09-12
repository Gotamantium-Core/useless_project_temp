import type {
    ComponentType,
} from "react";

import ExcuseGenerator from "../pages/ExcuseGenerator";
import TyperChecker from "../pages/TyperChecker";
import ProcrastinationOptimizer from "../pages/ProcrastinationOptimizer";
import SlingshotSlider from "../pages/SlingshotSlider";
import NpcGenerator from "../pages/NpcGenerator";
import ShyCursor from "../pages/ShyCursor";
import {
    ExcuseIcon,
    KeyboardIcon,
    ClockIcon,
    SlingshotIcon,
    NpcIcon,
    ShyCursorIcon,
} from "../components/ToolIcons";

export interface UselessTool {
    id: string;
    name: string;
    tagline: string;
    icon: ComponentType;
    component: ComponentType;
}

export const tools: UselessTool[] = [
    {
        id: "excuse-generator",
        name: "Excuse Generator",
        tagline:
            "Accountability avoidance technology for situations that probably didn't need an excuse.",
        icon: ExcuseIcon,
        component: ExcuseGenerator,
    },
    {
        id: "typer-checker",
        name: "The Typer Checker",
        tagline:
            "Judges your typing and whatever dark secrets it reveals about you as a person.",
        icon: KeyboardIcon,
        component: TyperChecker,
    },
    {
        id: "procrastination-optimizer",
        name: "The Procrastination Optimizer",
        tagline:
            "Converts doomed goals into beautifully choreographed evenings of doing anything else.",
        icon: ClockIcon,
        component: ProcrastinationOptimizer,
    },
    {
        id: "slingshot-volume",
        name: "The Slingshot Volume Slider",
        tagline:
            "A volume control that requires upper-body strength, a prayer, and a song that starts from a completely random point.",
        icon: SlingshotIcon,
        component: SlingshotSlider,
    },
    {
        id: "shy-cursor",
        name: "The Shy Cursor",
        tagline:
            "A pointer with harsh opinions about your buttons, enforced from a safe distance of at least fifty pixels.",
        icon: ShyCursorIcon,
        component: ShyCursor,
    },
    {
        id: "campus-npc",
        name: "Campus NPC Generator",
        tagline:
            "Transforms your classmates into low-resolution RPG characters with questionable stats and zero side quests.",
        icon: NpcIcon,
        component: NpcGenerator,
    },
];