export const WORLD = {
	width: 5000,
	height: 5000,
};

export const PHYSICS = {
	eatMargin: 0.06,
	minRadius: 2,
	maxSpeed: 6,
	minSpeed: 1.5,
	splitCooldownMs: 1000,
	ejectCooldownMs: 200,
};

export function massToRadius(mass: number): number {
	return Math.max(PHYSICS.minRadius, Math.sqrt(mass / Math.PI));
}

export function speedForMass(mass: number): number {
	// inverse relation; tweak as needed
	const t = Math.max(1, Math.log10(mass + 10));
	return Math.max(PHYSICS.minSpeed, PHYSICS.maxSpeed / t);
}


