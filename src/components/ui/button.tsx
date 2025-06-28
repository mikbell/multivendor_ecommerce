import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Define the base styles for the button
const baseButtonStyles =
	"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

// Define styles for icons within the button
const buttonIconStyles =
	"[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0";

const buttonVariants = cva(cn(baseButtonStyles, buttonIconStyles, "gap-2"), {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive:
				"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline:
				"border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary:
				"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline",
		},
		size: {
			default: "h-10 px-4 py-2",
			sm: "h-9 px-3",
			lg: "h-11 px-8",
			icon: "size-10",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});

// --- CHANGES START HERE ---

// Use React.forwardRef to allow the Button component to receive and forward a ref
const Button = React.forwardRef<
	HTMLButtonElement, // This specifies the type of HTML element the ref will be attached to
	React.ComponentPropsWithoutRef<"button"> & // Use ComponentPropsWithoutRef to avoid conflicts with 'ref'
		VariantProps<typeof buttonVariants> & {
			asChild?: boolean;
		}
>(({ className, variant, size, asChild = false, ...props }, ref) => {
	// 'ref' is now the second argument
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			ref={ref} // <<< Pass the ref to the underlying HTML element or Slot component
			{...props}
		/>
	);
});
Button.displayName = "Button"; // Good practice for debugging with React DevTools

// --- CHANGES END HERE ---

export { Button, buttonVariants };
