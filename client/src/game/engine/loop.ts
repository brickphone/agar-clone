let rafId: number | null = null;
let last = 0;
let acc = 0;
const DT_MS = 1000 / 60;

export function startLoop(update: (dt: number) => void, render: (alpha: number) => void): () => void {
	if (rafId !== null) cancelAnimationFrame(rafId);
	last = performance.now();
	acc = 0;
	const frame = (now: number) => {
		let delta = now - last;
		last = now;
		if (delta > 100) delta = 100;
		acc += delta;
		while (acc >= DT_MS) {
			update(DT_MS / 1000);
			acc -= DT_MS;
		}
		const alpha = acc / DT_MS;
		render(alpha);
		rafId = requestAnimationFrame(frame);
	};
	rafId = requestAnimationFrame(frame);
	return () => {
		if (rafId !== null) cancelAnimationFrame(rafId);
		rafId = null;
	};
}
