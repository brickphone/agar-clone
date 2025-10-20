import "./globals.css"
export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="m-0 p-0 overflow-hidden w-screen h-screen bg-neutral-950 text-neutral-100">{children}</body>
		</html>
	)
}
