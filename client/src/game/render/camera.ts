import type { Vec2 } from '../sim/types'

export class Camera {
	position: Vec2 = { x: 0, y: 0 };
	zoom = 1;

	follow(target: Vec2, dt: number): void {
		// critically damped simple follow
		const k = 10;
		this.position.x += (target.x - this.position.x) * Math.min(1, k * dt);
		this.position.y += (target.y - this.position.y) * Math.min(1, k * dt);
	}

	setZoomForMass(totalMass: number): void {
		const minZ = 0.4;
		const maxZ = 2.0;
		// Better zoom: smaller cells = more zoom (closer view)
		const z = 100 / Math.sqrt(totalMass);
		this.zoom = Math.min(maxZ, Math.max(minZ, z));
	}
}


