'use client'
import { useEffect, useRef } from 'react'
import { startLoop } from '../src/game/engine/loop'
import { attachInputListeners, detachInputListeners, readInput } from '../src/game/engine/input'

export default function Page() {
	const stopRef = useRef<() => void>(() => {})
	const mountRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (mountRef.current) attachInputListeners(mountRef.current)
		stopRef.current = startLoop(
			() => {
				const input = readInput()
				// simple runtime check: no-op, but ensures code path executes
				void input
			},
			() => {}
		)
		return () => {
			if (stopRef.current) { stopRef.current() }
			detachInputListeners()
		}
	}, [])
	return <div ref={mountRef} style={{ width: '100dvw', height: '100dvh' }}>OK</div>
}
