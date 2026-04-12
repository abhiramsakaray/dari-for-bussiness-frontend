import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-mono font-medium uppercase tracking-wide transition-all",
  {
    variants: {
      variant: {
        // Default: Border with gray text
        default: "border border-border bg-transparent text-muted-foreground",
        
        // Success/Active: Green background (Dari spec)
        success: "border-0 bg-[#dcfce7] text-[#15803d]",
        
        // Pending: Yellow/Orange background (Dari spec)
        pending: "border-0 bg-[#fef3c7] text-[#92400e]",
        
        // Error/Failed: Red background (Dari spec)
        destructive: "border-0 bg-[#fee2e2] text-[#991b1b]",
        
        // Info: Blue background
        info: "border-0 bg-blue-50 text-blue-700",
        
        // Warning: Orange background
        warning: "border-0 bg-orange-50 text-orange-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean;
}

function Badge({ className, variant, pulse, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant }),
        pulse && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
