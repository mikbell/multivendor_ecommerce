// tailwind.config.js
const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class", // Abilita il dark mode tramite classe
	content: [
		"./src/**/*.{html,js,jsx,ts,tsx}",
		// Aggiungi altri percorsi dei tuoi file qui
	],
	theme: {
		extend: {
			fontFamily: {
				inter: ["var(--font-inter)"],
				barlow: ["var(--font-barlow)"],
			},
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
				card: {
					DEFAULT: "var(--card)",
					foreground: "var(--card-foreground)",
				},
				popover: {
					DEFAULT: "var(--popover)",
					foreground: "var(--popover-foreground)",
				},
				primary: {
					DEFAULT: "var(--primary)",
					foreground: "var(--primary-foreground)",
				},
				secondary: {
					DEFAULT: "var(--secondary)",
					foreground: "var(--secondary-foreground)",
				},
				muted: {
					DEFAULT: "var(--muted)",
					foreground: "var(--muted-foreground)",
				},
				accent: {
					DEFAULT: "var(--accent)",
					foreground: "var(--accent-foreground)",
				},
				destructive: {
					DEFAULT: "var(--destructive)",
					foreground: "var(--destructive-foreground)", // Assicurati di definire --destructive-foreground se lo usi
				},
				border: "var(--border)",
				input: "var(--input)",
				ring: "var(--ring)",
				chart: {
					1: "var(--chart-1)",
					2: "var(--chart-2)",
					3: "var(--chart-3)",
					4: "var(--chart-4)",
					5: "var(--chart-5)",
				},
				sidebar: {
					DEFAULT: "var(--sidebar)",
					foreground: "var(--sidebar-foreground)",
					primary: {
						DEFAULT: "var(--sidebar-primary)",
						foreground: "var(--sidebar-primary-foreground)",
					},
					accent: {
						DEFAULT: "var(--sidebar-accent)",
						foreground: "var(--sidebar-accent-foreground)",
					},
					border: "var(--sidebar-border)",
					ring: "var(--sidebar-ring)",
				},
			},
			borderRadius: {
				lg: "var(--radius-lg)",
				md: "var(--radius-md)",
				sm: "var(--radius-sm)",
				xl: "var(--radius-xl)", // Aggiungi questa per supportare --radius-xl
			},
			// Se "tw-animate-css" è un plugin Tailwind, assicurati di includerlo qui
			// plugins: [require('tailwindcss-animate')], // esempio se fosse un plugin npm
		},
	},
	plugins: [
		// Se hai un plugin 'tw-animate-css' basato su JS, importalo qui
		// Esempio: require('./plugins/tw-animate-css'),
		// Puoi definire qui un plugin per la variante custom se necessario,
		// altrimenti affidati al dark mode di Tailwind.
		plugin(function ({ addVariant }) {
			addVariant("dark", "&.dark &"); // Adatta il selettore se necessario per @custom-variant dark
			// O semplicemente: addVariant('dark', '.dark &');
		}),
	],
};
