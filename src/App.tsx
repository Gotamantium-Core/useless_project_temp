import {
    lazy,
    Suspense,
    useEffect,
    useState,
    useSyncExternalStore,
} from "react";

import AppHeader from "./components/AppHeader";
import Dashboard from "./pages/Dashboard";
import SmudgeOverlay from "./components/SmudgeOverlay";
import MusicPill from "./components/MusicPill";

import { tools } from "./data/tools";
import { readStats, recordOpen } from "./utils/stats";
import { getActive, subscribe } from "./utils/smudgeStore";
import { armAutostart } from "./utils/senseiMusic";
import {
    clearPending as clearPendingOpen,
    getPending,
    requestOpen,
    subscribe as subscribeRouter,
} from "./utils/toolRouter";
import {
    finishMeddle,
    isActive as isSenseiActive,
    isNapping,
    recordMeddle,
    recordSuccess,
    subscribe as subscribeSensei,
} from "./utils/senseiStore";

import type { ToolStats } from "./utils/stats";

import "./styles/global.css";

const SenseiOverlay = lazy(
    () => import("./components/SenseiOverlay")
);

function App() {
    const [activeToolId, setActiveToolId] =
        useState<string | null>(null);

    const [stats, setStats] =
        useState<ToolStats>(readStats);

    const smudgesActive = useSyncExternalStore(
        subscribe,
        getActive
    );

    const senseiActive = useSyncExternalStore(
        subscribeSensei,
        isSenseiActive
    );

    const activeTool = tools.find(
        (tool) => tool.id === activeToolId
    );

    useEffect(() => {
        return subscribeRouter(() => {
            const next = getPending();

            if (!next) {
                return;
            }

            clearPendingOpen();
            setActiveToolId(next);
        });
    }, []);

    useEffect(() => {
        return armAutostart();
    }, []);

    function handleOpenTool(toolId: string, rect?: DOMRect) {
        if (senseiActive && !rect) {
            return;
        }

        if (senseiActive) {
            if (isNapping()) {
                recordSuccess();
                setStats(recordOpen(toolId));
                setActiveToolId(toolId);
                return;
            }

            const meddled = recordMeddle({
                x: rect!.left + rect!.width / 2,
                y: rect!.top + rect!.height / 2,
            });

            if (!meddled) {
                return;
            }

            const candidates = tools.filter(
                (tool) => tool.id !== toolId
            );
            const wrong =
                candidates[
                    Math.floor(
                        Math.random() * candidates.length
                    )
                ];

            setStats(recordOpen(wrong.id));

            window.setTimeout(() => {
                finishMeddle();
                requestOpen(wrong.id);
            }, 850);

            return;
        }

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
            {senseiActive && (
                <Suspense fallback={null}>
                    <SenseiOverlay />
                </Suspense>
            )}

            <MusicPill />
        </div>
    );
}

export default App;