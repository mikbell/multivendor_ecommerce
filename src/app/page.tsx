import ThemeToggle from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<div className="p-5">
			<div className="w-full flex justify-end">
				<ThemeToggle />
			</div>
			<h1 className="font-barlow">Home</h1>
			<Button variant={"outline"}>Cliccami</Button>
		</div>
	);
}
