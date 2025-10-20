import type { Camera } from './camera'
import type { Body } from '../sim/types'

export class Renderer {
	private ctx: CanvasRenderingContext2D | null = null;
	private canvas: HTMLCanvasElement | null = null;
	private dpr = 1;

	attach(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('2D context not available');
		this.ctx = ctx;
		this.resize();
	}

	resize() {
		if (!this.canvas || !this.ctx) return;
		this.dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
		const { width, height } = this.canvas.getBoundingClientRect();
		this.canvas.width = Math.max(1, Math.floor(width * this.dpr));
		this.canvas.height = Math.max(1, Math.floor(height * this.dpr));
		this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
	}

	draw(bodies: Body[], camera: Camera) {
		if (!this.canvas || !this.ctx) return;
		const ctx = this.ctx;
		const { width, height } = this.canvas.getBoundingClientRect();

		ctx.clearRect(0, 0, width, height);

		// world->screen transform
		ctx.save();
		ctx.translate(width / 2, height / 2);
		ctx.scale(camera.zoom, camera.zoom);
		ctx.translate(-camera.position.x, -camera.position.y);

		// background grid
		ctx.save();
		ctx.strokeStyle = 'rgba(255,255,255,0.05)';
		ctx.lineWidth = 1 / camera.zoom;
		const grid = 64;
		const startX = Math.floor((camera.position.x - width) / grid) * grid - 5 * grid;
		const endX = startX + width * 2 + 10 * grid;
		const startY = Math.floor((camera.position.y - height) / grid) * grid - 5 * grid;
		const endY = startY + height * 2 + 10 * grid;
		for (let x = startX; x <= endX; x += grid) {
			ctx.beginPath();
			ctx.moveTo(x, startY);
			ctx.lineTo(x, endY);
			ctx.stroke();
		}
		for (let y = startY; y <= endY; y += grid) {
			ctx.beginPath();
			ctx.moveTo(startX, y);
			ctx.lineTo(endX, y);
			ctx.stroke();
		}
		ctx.restore();

		// sort back-to-front by radius
		const sorted = bodies.slice().sort((a, b) => a.r - b.r);
		for (const b of sorted) {
			ctx.beginPath();
			ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
			if (b.kind === 1) {
				ctx.fillStyle = '#5eead4';
			} else if (b.kind === 2) {
				ctx.fillStyle = '#fde047';
			} else {
				ctx.fillStyle = '#fca5a5';
			}
			ctx.fill();
		}

		ctx.restore();
	}
}


