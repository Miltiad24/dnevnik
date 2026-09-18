import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "h-11 w-full rounded-md border border-line bg-sheet px-3 text-base text-ink outline-none",
        "placeholder:text-subtle",
        "transition-[box-shadow,border-color] duration-150 ease-out",
        "focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_rgb(42_95_82_/0.18)]",
        "disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
