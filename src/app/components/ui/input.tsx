import * as React from "react";

import { cn } from "./utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          // Dari Design System Input Specifications
          "w-full bg-input-background border border-border rounded-md",
          "px-3.5 py-2.5 text-[13px] text-foreground font-['Sora']",
          "placeholder:text-[#BFBFBF]",
          "transition-dari",
          // Hover state
          "hover:border-border-hover",
          // Focus state
          "focus:border-primary focus:outline-none focus:ring-0",
          // Disabled state
          "disabled:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed",
          // Error state
          "aria-invalid:border-destructive",
          // File input styling
          "file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          // Selection
          "selection:bg-primary selection:text-primary-foreground",
          className,
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
