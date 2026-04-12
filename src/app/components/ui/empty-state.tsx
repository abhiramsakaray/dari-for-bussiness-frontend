import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center py-12 px-4 text-center",
          className
        )}
        {...props}
      >
        {/* Icon */}
        {Icon && (
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
            <Icon className="h-6 w-6 text-border" />
          </div>
        )}

        {/* Title */}
        <h3 className="text-card-title mb-2">{title}</h3>

        {/* Description */}
        {description && (
          <p className="text-body text-muted-foreground mb-5 max-w-md">
            {description}
          </p>
        )}

        {/* Action Button */}
        {action && (
          <Button onClick={action.onClick} size="default">
            {action.label}
          </Button>
        )}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
