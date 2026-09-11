import {
    taskContextTemplates,
    taskKeywordRules,
} from "../data/procrastination";

import type {
    TaskCategoryId,
    TaskContextTemplates,
} from "../data/procrastination";

export interface TaskContext {
    categoryId: TaskCategoryId;
    templates: TaskContextTemplates;
    originalTask: string;
    shortTask: string;
}

function truncate(text: string, max: number): string {
    if (text.length <= max) {
        return text;
    }

    return `${text.slice(0, max - 1).trimEnd()}…`;
}

function detectCategory(task: string): TaskCategoryId {
    const matched = taskKeywordRules.find((rule) => {
        const pattern = new RegExp(
            `\\b(?:${rule.keywords.join("|")})\\b`,
            "i"
        );

        return pattern.test(task);
    });

    return matched?.id ?? "generic";
}

export function parseTask(task: string): TaskContext {
    const originalTask = task.trim();
    const normalized = originalTask.toLowerCase();

    const categoryId = detectCategory(normalized);

    const templates =
        taskContextTemplates.find(
            (candidate) =>
                candidate.category === categoryId
        ) ?? taskContextTemplates[0];

    return {
        categoryId,
        templates,
        originalTask,
        shortTask: truncate(originalTask, 52),
    };
}