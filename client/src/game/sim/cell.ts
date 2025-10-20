import type { Cell, Vec2 } from './types'

export function setDesiredVelocity(cell: Cell, desired: Vec2): void {
	cell.vx = desired.x;
	cell.vy = desired.y;
}


