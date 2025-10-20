type Vec2 = { x: number; y: number };

export type InputSnapshot = {
	desiredDirection: Vec2; // normalized direction vector (0,0) when idle
	magnitude: number; // [0..1]
	buttons: {
		splitPressed: boolean;
		splitJustPressed: boolean;
		ejectPressed: boolean;
		ejectJustPressed: boolean;
	};
};

type InternalState = {
	keys: Set<string>;
	mouse: Vec2 | null; // in client coordinates relative to center
	touchId: number | null;
	touchOrigin: Vec2 | null;
	touchPos: Vec2 | null;
	prevButtons: { split: boolean; eject: boolean };
};

let internal: InternalState | null = null;
let attachedEl: HTMLElement | null = null;
const cleanupByElement = new WeakMap<HTMLElement, () => void>();

export function attachInputListeners(el: HTMLElement): void {
	if (internal) return;
	internal = {
		keys: new Set(),
		mouse: null,
		touchId: null,
		touchOrigin: null,
		touchPos: null,
		prevButtons: { split: false, eject: false },
	};
	attachedEl = el;

	const onKeyDown = (e: KeyboardEvent) => {
		internal!.keys.add(e.key.toLowerCase());
	};
	const onKeyUp = (e: KeyboardEvent) => {
		internal!.keys.delete(e.key.toLowerCase());
	};
	const onMouseMove = (e: MouseEvent) => {
		if (!attachedEl) return;
		const rect = attachedEl.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		internal!.mouse = { x: e.clientX - cx, y: e.clientY - cy };
	};
	const onTouchStart = (e: TouchEvent) => {
		if (internal!.touchId !== null) return;
		const t = e.changedTouches[0];
		internal!.touchId = t.identifier;
		internal!.touchOrigin = { x: t.clientX, y: t.clientY };
		internal!.touchPos = { x: t.clientX, y: t.clientY };
	};
	const onTouchMove = (e: TouchEvent) => {
		if (internal!.touchId === null) return;
		for (let i = 0; i < e.changedTouches.length; i++) {
			const t = e.changedTouches[i];
			if (t.identifier === internal!.touchId) {
				internal!.touchPos = { x: t.clientX, y: t.clientY };
				break;
			}
		}
	};
	const endTouch = (e: TouchEvent) => {
		if (internal!.touchId === null) return;
		for (let i = 0; i < e.changedTouches.length; i++) {
			const t = e.changedTouches[i];
			if (t.identifier === internal!.touchId) {
				internal!.touchId = null;
				internal!.touchOrigin = null;
				internal!.touchPos = null;
				break;
			}
		}
	};

	window.addEventListener('keydown', onKeyDown);
	window.addEventListener('keyup', onKeyUp);
	window.addEventListener('mousemove', onMouseMove);
	el.addEventListener('touchstart', onTouchStart, { passive: true });
	el.addEventListener('touchmove', onTouchMove, { passive: true });
	el.addEventListener('touchend', endTouch, { passive: true });
	el.addEventListener('touchcancel', endTouch, { passive: true });

    // store unsubscribe in WeakMap
    cleanupByElement.set(el, () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchmove', onTouchMove);
        el.removeEventListener('touchend', endTouch);
        el.removeEventListener('touchcancel', endTouch);
        attachedEl = null;
        internal = null;
    });
}

export function detachInputListeners(): void {
    if (attachedEl) {
        const fn = cleanupByElement.get(attachedEl);
        if (fn) fn();
    }
}

function normalize(v: Vec2): { v: Vec2; mag: number } {
	const mag = Math.hypot(v.x, v.y);
	if (mag === 0) return { v: { x: 0, y: 0 }, mag: 0 };
	return { v: { x: v.x / mag, y: v.y / mag }, mag: Math.min(1, mag > 1 ? 1 : mag) };
}

function keyboardVector(keys: Set<string>): Vec2 {
	let x = 0;
	let y = 0;
	if (keys.has('a') || keys.has('arrowleft')) x -= 1;
	if (keys.has('d') || keys.has('arrowright')) x += 1;
	if (keys.has('w') || keys.has('arrowup')) y -= 1;
	if (keys.has('s') || keys.has('arrowdown')) y += 1;
	return { x, y };
}

function pointerVector(): Vec2 | null {
	if (!internal || !attachedEl) return null;
	if (internal.mouse) return internal.mouse;
	if (internal.touchOrigin && internal.touchPos) {
		return {
			x: internal.touchPos.x - internal.touchOrigin.x,
			y: internal.touchPos.y - internal.touchOrigin.y,
		};
	}
	return null;
}

export function readInput(): InputSnapshot {
	if (!internal) {
		return {
			desiredDirection: { x: 0, y: 0 },
			magnitude: 0,
			buttons: {
				splitPressed: false,
				splitJustPressed: false,
				ejectPressed: false,
				ejectJustPressed: false,
			},
		};
	}

	// Direction: prefer pointer if available, else WASD
	const pointer = pointerVector();
	let dir: Vec2 = { x: 0, y: 0 };
	if (pointer) {
		dir = pointer;
	} else {
		dir = keyboardVector(internal.keys);
	}
	const { v, mag } = normalize(dir);

	// Buttons: split=Space, eject=W (note W also used for direction)
	const split = internal.keys.has(' ') || internal.keys.has('space');
	const eject = internal.keys.has('w');
	const splitJust = split && !internal.prevButtons.split;
	const ejectJust = eject && !internal.prevButtons.eject;
	internal.prevButtons = { split, eject };

	return {
		desiredDirection: v,
		magnitude: mag > 1 ? 1 : mag,
		buttons: {
			splitPressed: split,
			splitJustPressed: splitJust,
			ejectPressed: eject,
			ejectJustPressed: ejectJust,
		},
	};
}


