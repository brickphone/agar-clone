import { SpatialGrid } from './spatialGrid'
import { RNG } from './rng'
import { WORLD, massToRadius, speedForMass, PHYSICS } from './rules'
import type { Aabb, Body, Cell, EntityId, EntityKind, Food } from './types'
import { isCell } from './types'

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
		// Move cells
		for (const b of this.bodies.values()) {
			if (isCell(b)) {
				const c = b;
				const s = speedForMass(c.mass);
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

		// Check collisions - cells eating food
		const toRemove: EntityId[] = [];
		for (const b of this.bodies.values()) {
			if (isCell(b)) {
				const cell = b;
				// Query nearby bodies
				const nearby = this.grid.query({
					x0: cell.x - cell.r * 2,
					y0: cell.y - cell.r * 2,
					x1: cell.x + cell.r * 2,
					y1: cell.y + cell.r * 2
				});

				for (const other of nearby) {
					if (other.id === cell.id) continue;

					// Check if cell can eat food
					if (other.kind === 2) { // Food
						const dx = cell.x - other.x;
						const dy = cell.y - other.y;
						const distSq = dx * dx + dy * dy;
						const eatDist = cell.r * (1 - PHYSICS.eatMargin);

						if (distSq <= eatDist * eatDist) {
							// Eat the food
							const foodMass = Math.PI * other.r * other.r;
							cell.mass += foodMass;
							cell.r = massToRadius(cell.mass);
							toRemove.push(other.id);
						}
					}
				}
			}
		}

		// Remove eaten food
		for (const id of toRemove) {
			const body = this.bodies.get(id);
			if (body) {
				this.grid.remove(body);
				this.bodies.delete(id);
			}
		}
	}
}


