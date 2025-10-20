import path from "node:path"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	reactStrictMode: true,
	// use turbopack key instead of deprecated experimental.turbo
	turbopack: {},
}
nextConfig.outputFileTracingRoot = path.resolve(__dirname, '..');
export default nextConfig
