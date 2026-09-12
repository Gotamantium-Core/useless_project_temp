import { useState, useSyncExternalStore } from "react";

import AppHeader from "./components/AppHeader";
import Dashboard from "./pages/Dashboard";
import SmudgeOverlay from "./components/SmudgeOverlay";

import { tools } from "./data/tools";
import { readStats, recordOpen } from "./utils/stats";
import { getActive, subscribe } from "./utils/smudgeStore";

import type {
    ToolStats,
} from "./utils/stats";

import "./styles/global.css";

function App() {
    const [activeToolId, setActiveToolId] =
        useState<string | null>(null);

    const [stats, setStats] =
        useState<ToolStats>(readStats);

    const smudgesActive = useSyncExternalStore(
        subscribe,
        getActive
    );

    const activeTool = tools.find(
        (tool) => tool.id === activeToolId
    );

    function handleOpenTool(toolId: string) {
        setStats(recordOpen(toolId));
        setActiveToolId(toolId);
    }

    function handleBack() {
        setActiveToolId(null);
    }

    const ActiveToolComponent = activeTool?.component;

    return (
        <div className="app">
            <AppHeader
                onBack={activeTool ? handleBack : undefined}
            />

            <main className="main-content">
                {activeTool && ActiveToolComponent ? (
                    <ActiveToolComponent />
                ) : (
                    <Dashboard
                        stats={stats}
                        onOpenTool={handleOpenTool}
                    />
                )}
            </main>

            {smudgesActive && <SmudgeOverlay />}
        </div>
    );
}

export default App;