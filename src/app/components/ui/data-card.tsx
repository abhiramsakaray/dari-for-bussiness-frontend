import * as React from "react";
import { cn } from "./utils";

export interface DataCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const DataCard = React.forwardRef<HTMLDivElement, DataCardProps>(
  ({ className, hover = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-card border border-border rounded-xl p-6 md:p-7",
          hover && "card-hover cursor-pointer",
          className
        )}
        {...props}
      />
    );
  }
);
DataCard.displayName = "DataCard";

const DataCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-start justify-between mb-4", className)}
    {...props}
  />
));
DataCardHeader.displayName = "DataCardHeader";

const DataCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-card-title text-foreground", className)}
    {...props}
  />
));
DataCardTitle.displayName = "DataCardTitle";

const DataCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-body text-muted-foreground", className)}
    {...props}
  />
));
DataCardDescription.displayName = "DataCardDescription";

const DataCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-3", className)} {...props} />
));
DataCardContent.displayName = "DataCardContent";

const DataCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3 mt-4 pt-4 border-t border-border", className)}
    {...props}
  />
));
DataCardFooter.displayName = "DataCardFooter";

export {
  DataCard,
  DataCardHeader,
  DataCardTitle,
  DataCardDescription,
  DataCardContent,
  DataCardFooter,
};
