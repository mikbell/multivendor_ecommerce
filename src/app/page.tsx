import ThemeToggle from "@/components/shared/theme-toggle";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
	return (
		<div className="p-5">
			<div className="w-full gap-5 flex justify-end">
				<UserButton />
				<ThemeToggle />
			</div>
			<h1 className="font-barlow">GoShop Home Page</h1>
		</div>
	);
}
