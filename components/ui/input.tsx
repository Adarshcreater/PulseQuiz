import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn("focus-ring h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-sm text-white placeholder:text-white/45", className)}
    {...props}
  />
));
Input.displayName = "Input";
