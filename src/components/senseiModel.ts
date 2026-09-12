import * as THREE from "three";

import type { PerspectiveCamera } from "three";

const SKIN = new THREE.MeshLambertMaterial({ color: 0xffe0cd });
const ROBE = new THREE.MeshLambertMaterial({ color: 0x7c3aed });
const ROBE_DARK = new THREE.MeshLambertMaterial({
    color: 0x4c1d95,
});
const HAIR = new THREE.MeshLambertMaterial({ color: 0x312e81 });
const HAIR_LIGHT = new THREE.MeshLambertMaterial({
    color: 0x4338ca,
});
const INK = new THREE.MeshBasicMaterial({ color: 0x111827 });
const WHITE = new THREE.MeshBasicMaterial({ color: 0xffffff });
const IRIS = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
const BLUSH = new THREE.MeshBasicMaterial({
    color: 0xff9dbb,
    transparent: true,
    opacity: 0.55,
});
const SCARF = new THREE.MeshLambertMaterial({ color: 0xef4444 });
const GOLD = new THREE.MeshLambertMaterial({ color: 0xfbbf24 });
const SHOE = new THREE.MeshLambertMaterial({ color: 0x3730a3 });
const WAND = new THREE.MeshLambertMaterial({ color: 0xfffbeb });

export interface SenseiParts {
    sensei: THREE.Group;
    body: THREE.Group;
    headGroup: THREE.Group;
    eyes: THREE.Group[];
    armL: THREE.Group;
    armR: THREE.Group;
    legL: THREE.Group;
    legR: THREE.Group;
    scarf: THREE.Mesh;
    star: THREE.Mesh;
}

function makeEye(x: number): THREE.Group {
    const group = new THREE.Group();

    const shell = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 18, 14),
        WHITE
    );
    group.add(shell);

    const lens = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 16, 12),
        IRIS
    );
    lens.position.set(0, 0.01, 0.12);
    group.add(lens);

    const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 12, 10),
        INK
    );
    pupil.position.set(0, 0.02, 0.16);
    group.add(pupil);

    const glint = new THREE.Mesh(
        new THREE.SphereGeometry(0.026, 10, 8),
        WHITE
    );
    glint.position.set(0.035, 0.04, 0.155);
    group.add(glint);

    group.position.set(x, 0.04, 0.325);

    return group;
}

export function buildSensei(): SenseiParts {
    const sensei = new THREE.Group();
    const body = new THREE.Group();

    const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(0.8, 24),
        new THREE.MeshLambertMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.18,
        })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    sensei.add(shadow);

    const legL = new THREE.Group();
    legL.position.set(-0.18, 0.8, 0);

    const legMeshL = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.16, 0.3, 4, 10),
        ROBE_DARK
    );
    legMeshL.position.y = -0.28;
    legL.add(legMeshL);

    const shoeL = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 16, 12),
        SHOE
    );
    shoeL.position.set(0, -0.52, 0.04);
    legL.add(shoeL);

    const legR = new THREE.Group();
    legR.position.set(0.18, 0.8, 0);

    const legMeshR = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.16, 0.3, 4, 10),
        ROBE_DARK
    );
    legMeshR.position.y = -0.28;
    legR.add(legMeshR);

    const shoeR = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 16, 12),
        SHOE
    );
    shoeR.position.set(0, -0.52, 0.04);
    legR.add(shoeR);

    const torso = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.34, 0.42, 4, 14),
        ROBE
    );
    torso.position.y = 1.15;

    const belt = new THREE.Mesh(
        new THREE.TorusGeometry(0.33, 0.06, 8, 20),
        ROBE_DARK
    );
    belt.rotation.x = Math.PI / 2;
    belt.position.y = 0.82;

    const armL = new THREE.Group();
    armL.position.set(-0.54, 1.42, 0);

    const armMeshL = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.11, 0.34, 4, 10),
        ROBE
    );
    armMeshL.position.y = -0.34;
    armL.add(armMeshL);

    const handL = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 12, 10),
        SKIN
    );
    handL.position.y = -0.71;
    armL.add(handL);

    const armR = new THREE.Group();
    armR.position.set(0.54, 1.42, 0);

    const armMeshR = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.11, 0.34, 4, 10),
        ROBE
    );
    armMeshR.position.y = -0.34;
    armR.add(armMeshR);

    const handR = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 12, 10),
        SKIN
    );
    handR.position.y = -0.71;
    armR.add(handR);

    const wand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.85, 8),
        WAND
    );
    wand.position.y = -0.95;
    wand.rotation.z = 0.35;
    armR.add(wand);

    const star = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.09),
        GOLD
    );
    star.position.set(0.24, -1.36, 0);
    star.rotation.y = Math.PI / 4;
    armR.add(star);

    const scarf = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.09, 8, 22),
        SCARF
    );
    scarf.rotation.x = Math.PI / 2;
    scarf.position.y = 1.5;

    const headGroup = new THREE.Group();
    headGroup.position.y = 1.82;

    const cranium = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 32, 24),
        SKIN
    );
    headGroup.add(cranium);

    const hairCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.44, 28, 18),
        HAIR
    );
    hairCap.position.set(0, 0.06, -0.1);
    hairCap.scale.set(1.04, 0.84, 0.9);
    headGroup.add(hairCap);

    const spikeGeo = new THREE.ConeGeometry(0.08, 0.2, 8);

    const spikeA = new THREE.Mesh(spikeGeo, HAIR_LIGHT);
    spikeA.position.set(0, 0.42, 0.16);
    spikeA.rotation.x = -0.35;
    headGroup.add(spikeA);

    const spikeB = new THREE.Mesh(spikeGeo, HAIR);
    spikeB.position.set(-0.2, 0.4, 0.26);
    spikeB.rotation.x = -0.2;
    spikeB.rotation.z = 0.3;
    headGroup.add(spikeB);

    const spikeC = new THREE.Mesh(spikeGeo, HAIR);
    spikeC.position.set(0.2, 0.4, 0.26);
    spikeC.rotation.x = -0.2;
    spikeC.rotation.z = -0.3;
    headGroup.add(spikeC);

    const ahoge = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.24, 8),
        HAIR_LIGHT
    );
    ahoge.position.set(0.04, 0.52, 0.14);
    ahoge.rotation.x = -0.8;
    headGroup.add(ahoge);

    const tail = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.1, 0.55, 4, 10),
        HAIR
    );
    tail.position.set(-0.15, 0.06, -0.46);
    tail.rotation.x = Math.PI / 2.6;
    headGroup.add(tail);

    const band = new THREE.Mesh(
        new THREE.TorusGeometry(0.44, 0.04, 6, 22),
        SCARF
    );
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.22;
    headGroup.add(band);

    const bandKnot = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.16, 0.04),
        SCARF
    );
    bandKnot.position.set(0.16, 0.16, 0.4);
    headGroup.add(bandKnot);

    const eyeL = makeEye(-0.155);
    const eyeR = makeEye(0.155);
    headGroup.add(eyeL, eyeR);

    const blushL = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 12, 10),
        BLUSH
    );
    blushL.position.set(-0.27, -0.04, 0.31);
    headGroup.add(blushL);

    const blushR = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 12, 10),
        BLUSH
    );
    blushR.position.set(0.27, -0.04, 0.31);
    headGroup.add(blushR);

    const mouth = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.02, 0.02),
        INK
    );
    mouth.position.set(0, -0.12, 0.4);
    headGroup.add(mouth);

    body.add(
        legL,
        legR,
        torso,
        belt,
        armL,
        armR,
        scarf,
        headGroup
    );
    sensei.add(body);

    return {
        sensei,
        body,
        headGroup,
        eyes: [eyeL, eyeR],
        armL,
        armR,
        legL,
        legR,
        scarf,
        star,
    };
}

export interface ScreenPt {
    x: number;
    y: number;
}

export function projectToScreen(
    world: THREE.Vector3,
    camera: PerspectiveCamera,
    out: ScreenPt
) {
    const v = world.clone().project(camera);

    out.x = (v.x + 1) * 0.5 * window.innerWidth;
    out.y = (1 - (v.y + 1) * 0.5) * window.innerHeight;

    return out;
}