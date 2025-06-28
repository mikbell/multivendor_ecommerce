import type { Metadata } from "next";
import { Inter, Barlow } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const interFont = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const barlowFont = Barlow({
	variable: "--font-barlow",
	weight: ["500", "700"],
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "GoShop",
	description:
		"GoShop è un sito di e-commerce per la vendita di prodotti digitali.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="it" suppressHydrationWarning>
			<body
				className={`${interFont.variable} ${barlowFont.variable} antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
