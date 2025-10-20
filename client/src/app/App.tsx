import { useEffect, useRef } from 'react';
import { startLoop } from '../game/engine/loop';

export default function App() {
	const stopRef = useRef<() => void>(() => {});
	useEffect(() => {
		stopRef.current = startLoop(() => {}, () => {});
		return () => { if (stopRef.current) { stopRef.current(); } };
	}, []);
	return <div>OK</div>;
}
