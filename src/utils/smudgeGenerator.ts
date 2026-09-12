import { smudgeConfig } from "../data/smudges";

export interface SmudgeRect {
    l: number;
    t: number;
    r: number;
    b: number;
}

export interface FingerprintBlob {
    type: "fingerprint";
    x: number;
    y: number;
    scale: number;
    rotation: number;
    opacity: number;
    arcs: string[];
}

export interface CoffeeBlob {
    type: "coffee";
    x: number;
    y: number;
    radius: number;
    rotation: number;
    opacity: number;
}

export interface DustBlob {
    type: "dust";
    x: number;
    y: number;
    r: number;
    opacity: number;
}

export type SmudgeBlob =
    | FingerprintBlob
    | CoffeeBlob
    | DustBlob;

export interface SmudgeSet {
    blobs: SmudgeBlob[];
    film: number;
    seed: number;
}

function mulberry32(seed: number): () => number {
    let a = seed >>> 0;

    return () => {
        a += 0x6d2b79f5;
        let t = a;

        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function rand(
    prng: () => number,
    min: number,
    max: number
): number {
    return min + prng() * (max - min);
}

function randInt(
    prng: () => number,
    min: number,
    max: number
): number {
    return Math.floor(rand(prng, min, max + 1));
}

function polar(radius: number, angle: number) {
    return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
    };
}

function fingerprintArcs(prng: () => number): string[] {
    const arcs: string[] = [];
    const rings = randInt(prng, 2, 4);

    let angle = rand(prng, 0, Math.PI * 2);

    for (let ring = 0; ring < rings; ring += 1) {
        const radius = 12 + ring * rand(prng, 4, 8);
        const segments = randInt(prng, 3, 5);

        for (let i = 0; i < segments; i += 1) {
            const a0 = angle + rand(prng, 0.1, 0.9);
            const a1 = angle + rand(prng, 0.5, 1.5);
            const p0 = polar(radius, a0);
            const p1 = polar(radius, a1);
            const sweep = prng() < 0.5 ? 0 : 1;

            arcs.push(
                `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} ` +
                    `A ${radius.toFixed(2)} ${radius.toFixed(2)} ` +
                    `0 0 ${sweep} ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`
            );

            angle = a1;
        }
    }

    return arcs;
}

function pointInRect(
    rect: SmudgeRect,
    prng: () => number
) {
    const w = rect.r - rect.l;
    const h = rect.b - rect.t;
    const inset = 0.22;

    return {
        x:
            rect.l +
            w * (inset + (1 - inset * 2) * prng()),
        y:
            rect.t +
            h * (inset + (1 - inset * 2) * prng()),
    };
}

function cornerPoint(
    rect: SmudgeRect,
    prng: () => number
) {
    const w = rect.r - rect.l;
    const h = rect.b - rect.t;
    const corner = randInt(prng, 0, 3);

    let cx = corner % 2 === 0 ? rect.l : rect.r;
    let cy = corner < 2 ? rect.t : rect.b;

    cx += (corner % 2 === 0 ? 1 : -1) * w * rand(prng, 0.08, 0.35);
    cy += (corner < 2 ? 1 : -1) * h * rand(prng, 0.08, 0.35);

    return { x: cx, y: cy };
}

function pickRects(
    rects: SmudgeRect[],
    count: number,
    prng: () => number
): SmudgeRect[] {
    if (rects.length === 0) {
        return [];
    }

    const pool = [...rects];

    const picked: SmudgeRect[] = [];

    for (let i = 0; i < count && pool.length > 0; i += 1) {
        const index = randInt(prng, 0, pool.length - 1);

        picked.push(pool[index]);
        pool.splice(index, 1);
    }

    return picked;
}

export function generateSmudgeSet(
    rects: SmudgeRect[],
    seed: number
): SmudgeSet {
    const prng = mulberry32(seed);
    const blobs: SmudgeBlob[] = [];

    const config = smudgeConfig;

    const fingerprintCount = randInt(
        prng,
        config.fingerprint.min,
        config.fingerprint.max
    );
    const coffeeCount = randInt(
        prng,
        config.coffee.min,
        config.coffee.max
    );

    const fingerprintRects = pickRects(
        rects,
        fingerprintCount,
        prng
    );
    const coffeeRects = pickRects(rects, coffeeCount, prng);

    fingerprintRects.forEach((rect) => {
        const size = rand(
            prng,
            config.fingerprint.sizeMin,
            config.fingerprint.sizeMax
        );
        const point = pointInRect(rect, prng);

        blobs.push({
            type: "fingerprint",
            x: point.x,
            y: point.y,
            scale: size / 60,
            rotation: rand(prng, 0, 360),
            opacity: rand(
                prng,
                config.fingerprint.opacityMin,
                config.fingerprint.opacityMax
            ),
            arcs: fingerprintArcs(prng),
        });
    });

    coffeeRects.forEach((rect) => {
        const radius =
            rand(
                prng,
                config.coffee.sizeMin,
                config.coffee.sizeMax
            ) / 2;
        const point = cornerPoint(rect, prng);

        blobs.push({
            type: "coffee",
            x: point.x,
            y: point.y,
            radius,
            rotation: rand(prng, 0, 360),
            opacity: rand(
                prng,
                config.coffee.opacityMin,
                config.coffee.opacityMax
            ),
        });
    });

    const dustRects = pickRects(
        rects,
        config.dust.min,
        prng
    );

    const dustCount =
        rects.length > 0
            ? config.dust.min +
              Math.floor(rand(prng, 0, config.dust.max - config.dust.min))
            : 0;

    for (let i = 0; i < dustCount; i += 1) {
        const rect =
            i < dustRects.length
                ? dustRects[i]
                : rects[randInt(prng, 0, rects.length - 1)];

        const point = pointInRect(rect, prng);

        blobs.push({
            type: "dust",
            x: point.x,
            y: point.y,
            r: rand(
                prng,
                config.dust.sizeMin,
                config.dust.sizeMax
            ),
            opacity: rand(
                prng,
                config.dust.opacityMin,
                config.dust.opacityMax
            ),
        });
    }

    return {
        blobs,
        film: config.dust.filmOpacity,
        seed,
    };
}