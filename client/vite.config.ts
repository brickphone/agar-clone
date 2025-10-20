import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@app': path.resolve(__dirname, 'src/app'),
			'@game': path.resolve(__dirname, 'src/game'),
			'@ui': path.resolve(__dirname, 'src/ui'),
			'@state': path.resolve(__dirname, 'src/state'),
		},
	},
})
