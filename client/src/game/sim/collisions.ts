import type { Body, Cell } from './types'

export function circlesOverlap(a: Body, b: Body): boolean {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	const rr = (a.r + b.r) * (a.r + b.r);
	return dx * dx + dy * dy <= rr;
}

export function resolveSimpleCollision(a: Cell, b: Cell): void {
	// basic positional separation; momentum-less for now
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const dist = Math.hypot(dx, dy) || 1;
	const overlap = a.r + b.r - dist;
	if (overlap > 0) {
		const nx = dx / dist;
		const ny = dy / dist;
		a.x -= (overlap * nx) / 2;
		a.y -= (overlap * ny) / 2;
		b.x += (overlap * nx) / 2;
		b.y += (overlap * ny) / 2;
	}
}


