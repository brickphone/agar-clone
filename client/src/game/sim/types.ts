export type EntityId = number;

export type Vec2 = { x: number; y: number };

export enum EntityKind {
	PlayerCell = 1,
	Food = 2,
	Virus = 3,
}

export interface Body {
	id: EntityId;
	kind: EntityKind;
	x: number;
	y: number;
	r: number; // radius in world units
}

export interface Cell extends Body {
	mass: number;
	vx: number;
	vy: number;
	ownerId: number; // local/player id for grouping
	canMergeAt: number; // ms timestamp
}

export type Food = Body;
export type Virus = Body;

export interface Aabb { x0: number; y0: number; x1: number; y1: number }


