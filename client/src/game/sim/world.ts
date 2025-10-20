import { SpatialGrid } from './spatialGrid'
import { RNG } from './rng'
import { WORLD, massToRadius, speedForMass } from './rules'
import type { Aabb, Body, Cell, EntityId, EntityKind, Food } from './types'

export class World {
	readonly grid: SpatialGrid<Body>;
	readonly rng: RNG;
	readonly bodies: Map<EntityId, Body> = new Map();
	private nextId = 1;

	constructor(seed = 1234) {
		this.grid = new SpatialGrid<Body>(64);
		this.rng = new RNG(seed);
	}

	createFood(count: number): void {
		for (let i = 0; i < count; i++) {
			const id = this.nextId++;
			const x = this.rng.nextRange(0, WORLD.width);
			const y = this.rng.nextRange(0, WORLD.height);
			const r = 2 + this.rng.nextRange(0, 1);
			const f: Food = { id, kind: 2 as EntityKind, x, y, r };
			this.bodies.set(id, f);
			this.grid.insert(f);
		}
	}

	createCell(ownerId: number, mass: number, x: number, y: number): EntityId {
		const id = this.nextId++;
		const r = massToRadius(mass);
		const c: Cell = { id, kind: 1 as EntityKind, x, y, r, mass, vx: 0, vy: 0, ownerId, canMergeAt: 0 };
		this.bodies.set(id, c);
		this.grid.insert(c);
		return id;
	}

	query(aabb: Aabb): Body[] {
		return this.grid.query(aabb);
	}

	step(dt: number): void {
		// minimal movement for cells; collisions handled later
		for (const b of this.bodies.values()) {
			if ((b as Cell).mass !== undefined) {
				const c = b as Cell;
				const s = speedForMass(c.mass);
				// integrate velocity with a simple cap
				const oldX = c.x;
				const oldY = c.y;
				c.x += c.vx * s * dt;
				c.y += c.vy * s * dt;
				// clamp world bounds
				c.x = Math.max(c.r, Math.min(WORLD.width - c.r, c.x));
				c.y = Math.max(c.r, Math.min(WORLD.height - c.r, c.y));
				this.grid.update(c, oldX, oldY);
			}
		}
	}
}


