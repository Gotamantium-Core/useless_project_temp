import { useEffect, useRef } from "react";

import * as THREE from "three";

import { buildSensei, projectToScreen } from "./senseiModel";

import type { ScreenPt } from "./senseiModel";

import {
    getCelebrate,
    getMeddleTarget,
    isNapping,
    poke,
} from "../utils/senseiStore";

import {
    djTakeWheel,
    ensureStarted,
    playPoof,
    playPop,
    playSnore,
    playSwapTone,
    playVictoryTone,
} from "../utils/senseiMusic";

import "./SenseiOverlay.css";

const WANDER_SPEED = 1.7;
const MEDDLE_TOTAL = 0.95;
const POOF_TIME = 0.16;
const SPIN_TIME = 0.34;
const POKE_RADIUS = 58;

const GROUND_LIMITS = {
    xMin: -5.6,
    xMax: 5.6,
    zMin: -3.4,
    zMax: 3.2,
};

type SenseiMode = "wander" | "meddle" | "nap" | "celebrate";

function randomTarget(src: THREE.Vector3): THREE.Vector3 {
    const out = new THREE.Vector3(
        THREE.MathUtils.randFloat(
            GROUND_LIMITS.xMin,
            GROUND_LIMITS.xMax
        ),
        0,
        THREE.MathUtils.randFloat(
            GROUND_LIMITS.zMin,
            GROUND_LIMITS.zMax
        )
    );

    if (out.distanceTo(src) < 0.7) {
        out.z = Math.min(GROUND_LIMITS.zMax, out.z + 1.2);
    }

    return out;
}

function disposeObject(root: THREE.Object3D) {
    root.traverse((child) => {
        const mesh = child as THREE.Mesh;

        if (!mesh.isMesh) {
            return;
        }

        mesh.geometry.dispose();

        const material = mesh.material as
            | THREE.Material
            | THREE.Material[];

        if (Array.isArray(material)) {
            material.forEach((m) => m.dispose());
        } else {
            material.dispose();
        }
    });
}

function SenseiOverlay() {
    const mountRef = useRef<HTMLDivElement>(null);
    const bubbleRef = useRef<HTMLDivElement>(null);
    const zzzRef = useRef<HTMLDivElement>(null);
    const alarmRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        const bubble = bubbleRef.current;
        const zzz = zzzRef.current;
        const alarm = alarmRef.current;

        if (!mount || !bubble || !zzz || !alarm) {
            return;
        }

        const mountEl = mount;
        const bubbleEl = bubble;
        const zzzEl = zzz;
        const alarmEl = alarm;

        let renderer: THREE.WebGLRenderer;

        try {
            renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true,
            });
        } catch {
            return;
        }

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);

        const host = document.createElement("div");
        host.className = "sensei-canvas-host";
        host.appendChild(renderer.domElement);
        mountEl.appendChild(host);

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        camera.position.set(0, 2.7, 9);
        camera.lookAt(0, 1.1, 0);

        scene.add(new THREE.AmbientLight(0xffffff, 0.85));

        const keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
        keyLight.position.set(4, 7, 5);
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0xc4b5fd, 0.55);
        rimLight.position.set(-4, 3, -4);
        scene.add(rimLight);

        const parts = buildSensei();
        scene.add(parts.sensei);

        parts.sensei.position.set(0, 0, 1.3);

        const ray = new THREE.Raycaster();
        const groundPlane = new THREE.Plane(
            new THREE.Vector3(0, 1, 0),
            0
        );

        const worldHead = new THREE.Vector3();
        const screenHead: ScreenPt = { x: window.innerWidth / 2, y: 0 };

        function screenToGround(x: number, y: number) {
            const ndcX = (x / window.innerWidth) * 2 - 1;
            const ndcY = -(y / window.innerHeight) * 2 + 1;

            ray.setFromCamera(
                new THREE.Vector2(ndcX, ndcY),
                camera
            );

            const hit = new THREE.Vector3();
            ray.ray.intersectPlane(groundPlane, hit);

            return hit;
        }

        const modeRef: { current: SenseiMode } = {
            current: "wander",
        };
        const moveTarget = new THREE.Vector3(2, 0, 1.3);
        const moving = { current: false };
        const idleLeft = { current: 1.2 };

        const walkPhase = { current: 0 };
        const eyeBlink = {
            at: Math.random() * 2,
            closedUntil: 0,
        };
        const headPhase = { current: 0 };
        const cursorNdc = { x: 0, y: 0 };

        const meddleElapsed = { current: 0 };
        const meddleWorld = new THREE.Vector3();
        const meddleScreen: ScreenPt = { x: 0, y: 0 };
        let lastMeddleT = 0;

        let celebrateSeen = 0;

        const djCountdown = { current: 8 + Math.random() * 5 };
        const danceLeft = { current: 0 };

        const bubbleText = { current: "" };

        function showBubble(text: string) {
            bubbleText.current = text;
            bubbleEl.textContent = text;
            bubbleEl.classList.add("sensei-bubble-show");
        }

        function hideBubble() {
            bubbleText.current = "";
            bubbleEl.classList.remove("sensei-bubble-show");
        }

        function pickNewTarget() {
            moveTarget.copy(randomTarget(parts.sensei.position));
            moving.current = true;
        }

        function flipCard(x: number, y: number) {
            const el = document.elementFromPoint(x, y);
            const card = el?.closest(".tool-card");

            if (!card) {
                return;
            }

            card.classList.add("sensei-swapped");

            window.setTimeout(() => {
                card.classList.remove("sensei-swapped");
            }, 750);
        }

        const onPointerMove = (e: PointerEvent) => {
            cursorNdc.x = (e.clientX / window.innerWidth) * 2 - 1;
            cursorNdc.y =
                -(e.clientY / window.innerHeight) * 2 + 1;
        };

        const onWindowClick = (e: MouseEvent) => {
            if (modeRef.current !== "wander") {
                return;
            }

            const dx = e.clientX - screenHead.x;
            const dy = e.clientY - screenHead.y - 40;
            const d2 = dx * dx + dy * dy;

            if (d2 > POKE_RADIUS * POKE_RADIUS) {
                return;
            }

            if (poke()) {
                playPop();
                modeRef.current = "celebrate";
                meddleElapsed.current = 0;
                showBubble("Nyaa!");
            }
        };

        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("click", onWindowClick);
        window.addEventListener("resize", onResize);

        ensureStarted();

        let raf = 0;
        let last = performance.now();

        const tick = (now: number) => {
            const dtMs = Math.min(now - last, 50);
            last = now;
            const dt = dtMs / 1000;

            const pos = parts.sensei.position;
            const body = parts.body;
            const head = parts.headGroup;
            const sleeping = isNapping();
            const wasMode = modeRef.current;

            if (sleeping && modeRef.current !== "nap") {
                modeRef.current = "nap";
                playSnore();
                hideBubble();
            } else if (
                !sleeping &&
                modeRef.current === "nap"
            ) {
                modeRef.current = "wander";
                moving.current = true;
                pickNewTarget();
            }

            const cele = getCelebrate();
            if (cele > celebrateSeen) {
                celebrateSeen = cele;
                if (modeRef.current !== "nap") {
                    modeRef.current = "celebrate";
                    meddleElapsed.current = 0;
                    playVictoryTone();
                    showBubble("Nyaa~");
                }
            }

            const mt = getMeddleTarget();
            if (mt.t > lastMeddleT) {
                lastMeddleT = mt.t;
                modeRef.current = "meddle";
                meddleElapsed.current = 0;
                meddleWorld.copy(screenToGround(mt.x, mt.y));
                meddleScreen.x = mt.x;
                meddleScreen.y = mt.y;
                playPoof();
                flipCard(mt.x, mt.y);
                showBubble("Puff!");
            }

            pos.y = 0;
            body.position.y = 0;
            body.rotation.z = 0;
            body.scale.set(1, 1, 1);
            parts.star.rotation.z += dt * 1.5;

            const mode = modeRef.current;
            let movingNow = false;

            if (mode === "wander") {
                if (moving.current) {
                    const dx = moveTarget.x - pos.x;
                    const dz = moveTarget.z - pos.z;
                    const dist = Math.hypot(dx, dz);

                    if (dist < 0.12) {
                        moving.current = false;
                        idleLeft.current =
                            1.1 + Math.random() * 1.7;
                    } else {
                        movingNow = true;
                        const step = Math.min(dt * WANDER_SPEED, dist);
                        pos.x += (dx / dist) * step;
                        pos.z += (dz / dist) * step;

                        parts.sensei.rotation.y = Math.atan2(dx, dz);
                    }
                } else {
                    idleLeft.current -= dt;

                    if (idleLeft.current <= 0) {
                        pickNewTarget();
                    }
                }

                body.rotation.z +=
                    dt * 0.2 * Math.sin(headPhase.current * 0.8);
            } else if (mode === "meddle") {
                meddleElapsed.current += dt;
                const p = meddleElapsed.current / MEDDLE_TOTAL;

                if (p < POOF_TIME) {
                    const k = p / POOF_TIME;
                    body.scale.set(1 - k, 1 - k, 1 - k);
                } else if (p < POOF_TIME + SPIN_TIME) {
                    const k =
                        (p - POOF_TIME) / SPIN_TIME;

                    if (wasMode !== "meddle" || p - dt / MEDDLE_TOTAL < POOF_TIME) {
                        pos.set(meddleWorld.x, 0, meddleWorld.z);
                        body.scale.set(0.001, 0.001, 0.001);
                        playSwapTone();
                        showBubble("Wrong.");
                    }

                    const ease =
                        1 - Math.pow(1 - k, 3);
                    body.scale.set(ease, ease, ease);
                    parts.sensei.rotation.y =
                        k * Math.PI * 2;
                } else if (p < 0.85) {
                    body.scale.set(1, 1, 1);
                } else {
                    hideBubble();
                }

                if (p >= 1) {
                    modeRef.current = "wander";
                    moving.current = true;
                    pickNewTarget();
                }
            } else if (mode === "nap") {
                body.scale.set(1, 0.84, 1);
                body.rotation.z = 0.07;
            } else if (mode === "celebrate") {
                meddleElapsed.current += dt;
                const p = meddleElapsed.current / 0.8;
                const hop =
                    Math.sin(Math.min(p, 1) * Math.PI) * 0.42;

                body.position.y = hop;

                if (p >= 1) {
                    body.position.y = 0;
                    modeRef.current = "wander";
                    moving.current = true;
                    hideBubble();
                    pickNewTarget();
                }
            }

            if (mode === "wander") {
                djCountdown.current -= dt;

                if (djCountdown.current <= 0) {
                    djCountdown.current = 7 + Math.random() * 7;

                    const dj = djTakeWheel();

                    if (dj) {
                        danceLeft.current = 1.6;
                        showBubble(dj.caption);

                        window.setTimeout(() => {
                            if (bubbleText.current === dj.caption) {
                                hideBubble();
                            }
                        }, 1900);
                    }
                }
            }

            walkPhase.current += dt * (movingNow ? 10 : 2.2);

            const swing = Math.sin(walkPhase.current) * (movingNow ? 0.7 : 0.06);
            const counter = Math.sin(walkPhase.current + Math.PI) * (movingNow ? 0.7 : 0.06);

            parts.legL.rotation.x = swing;
            parts.legR.rotation.x = counter;
            parts.armL.rotation.x = movingNow ? -counter * 0.6 : 0.1 + Math.sin(headPhase.current * 1.3) * 0.05;
            parts.armR.rotation.x = movingNow ? -swing * 0.6 : 0.1;

            headPhase.current += dt;
            body.position.y =
                movingNow
                    ? Math.abs(Math.sin(walkPhase.current)) * 0.05
                    : Math.sin(headPhase.current * 2) * 0.008;

            if (danceLeft.current > 0) {
                danceLeft.current -= dt;

                const t = now;

                parts.armL.rotation.x = -1.5 + Math.sin(t * 0.014) * 0.35;
                parts.armR.rotation.x = -1.5 + Math.sin(t * 0.014 + 0.9) * 0.35;
                parts.legL.rotation.x = Math.sin(t * 0.02) * 0.25;
                parts.legR.rotation.x = Math.sin(t * 0.02 + Math.PI) * 0.25;
                body.rotation.z = Math.sin(t * 0.009) * 0.07;
                body.position.y = Math.abs(Math.sin(t * 0.02)) * 0.06;
            }

            const sleepingNow = mode === "nap";
            const headTargetYaw =
                (sleepingNow ? 0 : cursorNdc.x * 0.35) + 0;
            const headTargetPitch = sleepingNow
                ? 0.5
                : Math.max(-0.12, cursorNdc.y * 0.15);

            head.rotation.y +=
                (headTargetYaw - head.rotation.y) * Math.min(1, dt * 4);
            head.rotation.x +=
                (headTargetPitch - head.rotation.x) * Math.min(1, dt * 4);

            eyeBlink.at -= dt;
            if (eyeBlink.at <= 0) {
                eyeBlink.closedUntil = now + 120;
                eyeBlink.at = 2.2 + Math.random() * 3.4;
            }

            const eyesClosed =
                sleepingNow ||
                now - eyeBlink.closedUntil < 0 &&
                eyeBlink.closedUntil !== 0;

            parts.eyes.forEach((eye) => {
                const targetScale = eyesClosed ? 0.05 : 1;
                eye.scale.y +=
                    (targetScale - eye.scale.y) * Math.min(1, dt * 18);
            });

            parts.scarf.rotation.y += dt * 2.2;
            parts.scarf.position.y = 1.5 + Math.sin(headPhase.current * 1.4) * 0.02;

            worldHead.set(pos.x, 2.05 + body.position.y, pos.z);
            projectToScreen(worldHead, camera, screenHead);

            const bubbleOffset = screenHead.y - 8;
            if (bubbleText.current) {
                bubble.style.transform = `translate(${screenHead.x}px, ${bubbleOffset}px)`;
            }

            if (sleepingNow) {
                const float = Math.sin(now * 0.004) * 6;
                zzzEl.style.transform = `translate(${screenHead.x + 26}px, ${screenHead.y - 96 + float}px)`;
                zzzEl.classList.add("sensei-zzz-show");
                alarmEl.classList.add("sensei-alarm-on");
            } else {
                zzzEl.classList.remove("sensei-zzz-show");
                alarmEl.classList.remove("sensei-alarm-on");
            }

            renderer.render(scene, camera);

            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);

            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("click", onWindowClick);
            window.removeEventListener("resize", onResize);

            disposeObject(scene);

            renderer.dispose();
            host.remove();
        };
    }, []);

    return (
        <>
            <div
                className="sensei-mount"
                ref={mountRef}
                aria-hidden="true"
            />
            <div
                className="sensei-bubble"
                ref={bubbleRef}
                aria-hidden="true"
            />
            <div
                className="sensei-zzz"
                ref={zzzRef}
                aria-hidden="true"
            >
                <span>z</span>
                <span>Z</span>
                <span>Z</span>
            </div>
            <div
                className="sensei-nap-alarm"
                ref={alarmRef}
                aria-hidden="true"
            >
                <span className="sensei-alarm-z">zZz</span>
                It's asleep. Grab your tool!
            </div>
        </>
    );
}

export default SenseiOverlay;