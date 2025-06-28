"use client";

import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuItem,
	DropdownMenuContent,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes"; // Correct import for the hook

const ThemeToggle = () => {
	const { setTheme } = useTheme(); // This is where the hook is called

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="h-10 w-10 rounded-full"
					aria-label="Toggle theme" // Good accessibility practice
				>
					<SunIcon className="h-[1.4rem] w-[1.4rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<MoonIcon className="absolute h-[1.4rem] w-[1.4rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				{" "}
				{/* Added align="end" for better positioning */}
				<DropdownMenuItem
					onClick={() => {
						setTheme("light");
					}}>
					Chiaro
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						setTheme("dark");
					}}>
					Scuro
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						setTheme("system");
					}}>
					Sistema
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ThemeToggle;
