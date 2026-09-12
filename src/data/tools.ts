import type {
    ComponentType,
} from "react";

import ExcuseGenerator from "../pages/ExcuseGenerator";
import TyperChecker from "../pages/TyperChecker";
import ProcrastinationOptimizer from "../pages/ProcrastinationOptimizer";
import SlingshotSlider from "../pages/SlingshotSlider";
import NpcGenerator from "../pages/NpcGenerator";
import ShyCursor from "../pages/ShyCursor";
import PasswordDegrader from "../pages/PasswordDegrader";
import ScreenSmudger from "../pages/ScreenSmudger";
import Sensei from "../pages/Sensei";
import {
    ExcuseIcon,
    KeyboardIcon,
    ClockIcon,
    SlingshotIcon,
    NpcIcon,
    ShyCursorIcon,
    LockIcon,
    ScreenIcon,
    SenseiIcon,
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
    {
        id: "password-degrader",
        name: "Password Strength Degrader",
        tagline:
            "A security auditor with fundamentally antisocial priorities. Turns strong passwords into lifestyle choices.",
        icon: LockIcon,
        component: PasswordDegrader,
    },
    {
        id: "screen-smudger",
        name: "The Virtual Screen Smudger",
        tagline:
            "Applies decades of grime to your screen in seconds — until you press Remove, at which point it behaves like a gentleman.",
        icon: ScreenIcon,
        component: ScreenSmudger,
    },
    {
        id: "rogue-sensei",
        name: "The Rogue Sensei",
        tagline:
            "A low-poly anime gremlin that follows you around and makes sure the tool you clicked was never the one you wanted.",
        icon: SenseiIcon,
        component: Sensei,
    },
];