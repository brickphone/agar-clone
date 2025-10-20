'use client'
import { useEffect, useRef } from 'react'
import { startLoop } from '../src/game/engine/loop'
import { attachInputListeners, detachInputListeners, readInput } from '../src/game/engine/input'
import { World } from '../src/game/sim/world'
import { setDesiredVelocity } from '../src/game/sim/cell'
import { isCell } from '../src/game/sim/types'
import { Camera } from '../src/game/render/camera'
import { Renderer } from '../src/game/render/renderer'

export default function Page() {
	const stopRef = useRef<() => void>(() => {})
	const mountRef = useRef<HTMLDivElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	useEffect(() => {
		if (mountRef.current) attachInputListeners(mountRef.current)
		const world = new World(123)
		world.createFood(300)
		const localId = world.createCell(1, 500, 2500, 2500)
		const camera = new Camera()
		// Initialize camera at player position
		camera.position = { x: 2500, y: 2500 }
		camera.setZoomForMass(500)
		const renderer = new Renderer()
		if (canvasRef.current) {
			renderer.attach(canvasRef.current)
			renderer.resize() // Initial resize
			const onResize = () => renderer.resize()
			window.addEventListener('resize', onResize)
			stopRef.current = startLoop(
				(dt) => {
					const input = readInput()
					const cell = world.bodies.get(localId)
					if (cell && isCell(cell)) setDesiredVelocity(cell, input.desiredDirection)
					world.step(dt)
					if (cell && isCell(cell)) {
						camera.follow({ x: cell.x, y: cell.y }, dt)
						camera.setZoomForMass(cell.mass)
					}
				},
				() => {
					renderer.draw(Array.from(world.bodies.values()), camera)
				}
			)
			return () => {
				if (stopRef.current) { stopRef.current() }
				window.removeEventListener('resize', onResize)
			}
		}
		return () => {
			if (stopRef.current) { stopRef.current() }
			detachInputListeners()
		}
	}, [])
	return (
		<div ref={mountRef} style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', display: 'block' }}>
			<canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
		</div>
	)
}
