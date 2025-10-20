import type { Aabb, Body } from './types'

type CellKey = string;

export class SpatialGrid<T extends Body> {
	private readonly cellSize: number;
	private readonly cells: Map<CellKey, Set<T>> = new Map();

	constructor(cellSize = 64) {
		this.cellSize = cellSize;
	}

	private key(ix: number, iy: number): CellKey {
		return `${ix},${iy}`;
	}

	private toIndex(x: number, y: number): { ix: number; iy: number } {
		return { ix: Math.floor(x / this.cellSize), iy: Math.floor(y / this.cellSize) };
	}

	insert(b: T): void {
		const { ix, iy } = this.toIndex(b.x, b.y);
		const k = this.key(ix, iy);
		let set = this.cells.get(k);
		if (!set) this.cells.set(k, (set = new Set()));
		set.add(b);
	}

	remove(b: T): void {
		const { ix, iy } = this.toIndex(b.x, b.y);
		const k = this.key(ix, iy);
		const set = this.cells.get(k);
		if (set) set.delete(b);
	}

	update(b: T, oldX: number, oldY: number): void {
		const a = this.toIndex(oldX, oldY);
		const c = this.toIndex(b.x, b.y);
		if (a.ix === c.ix && a.iy === c.iy) return;
		const oldK = this.key(a.ix, a.iy);
		const newK = this.key(c.ix, c.iy);
		const oldSet = this.cells.get(oldK);
		if (oldSet) oldSet.delete(b);
		let newSet = this.cells.get(newK);
		if (!newSet) this.cells.set(newK, (newSet = new Set()));
		newSet.add(b);
	}

	query(aabb: Aabb): T[] {
		const min = this.toIndex(aabb.x0, aabb.y0);
		const max = this.toIndex(aabb.x1, aabb.y1);
		const out: T[] = [];
		for (let iy = min.iy; iy <= max.iy; iy++) {
			for (let ix = min.ix; ix <= max.ix; ix++) {
				const set = this.cells.get(this.key(ix, iy));
				if (!set) continue;
				for (const b of set) out.push(b);
			}
		}
		return out;
	}
}


