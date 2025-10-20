export function clampDeltaMs(deltaMs: number, maxMs = 100): number {
	return deltaMs > maxMs ? maxMs : deltaMs;
}

export function nowMs(): number {
	return typeof performance !== 'undefined' ? performance.now() : Date.now();
}


