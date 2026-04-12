import * as React from "react";
import { cn } from "./utils";

export interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 12 | 8 | 6;
}

const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, columns = 12, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid gap-4 w-full",
          columns === 12 && "grid-cols-12",
          columns === 8 && "grid-cols-8",
          columns === 6 && "grid-cols-6",
          className
        )}
        {...props}
      />
    );
  }
);
BentoGrid.displayName = "BentoGrid";

export interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
  rowSpan?: 1 | 2;
  hover?: boolean;
}

const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, span = 12, rowSpan = 1, hover = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-card border border-border rounded-[20px] p-6 transition-all duration-[250ms]",
          hover && "hover:border-border-hover hover:shadow-[0_6px_24px_rgba(0,0,0,0.07)] hover:-translate-y-0.5",
          // Column spans
          span === 1 && "col-span-1",
          span === 2 && "col-span-2",
          span === 3 && "col-span-3",
          span === 4 && "col-span-4",
          span === 5 && "col-span-5",
          span === 6 && "col-span-6",
          span === 8 && "col-span-8",
          span === 12 && "col-span-12",
          // Row spans
          rowSpan === 2 && "row-span-2",
          // Responsive adjustments
          "max-lg:col-span-full",
          className
        )}
        {...props}
      />
    );
  }
);
BentoCard.displayName = "BentoCard";

const BentoCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-start justify-between mb-4", className)}
    {...props}
  />
));
BentoCardHeader.displayName = "BentoCardHeader";

const BentoCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-[14px] font-semibold text-foreground tracking-tight", className)}
    {...props}
  />
));
BentoCardTitle.displayName = "BentoCardTitle";

const BentoCardSubtitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[11px] font-mono text-muted-foreground mt-0.5", className)}
    {...props}
  />
));
BentoCardSubtitle.displayName = "BentoCardSubtitle";

const BentoCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
BentoCardContent.displayName = "BentoCardContent";

// KPI Card Component
export interface BentoKPICardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  sparkline?: boolean;
}

const BentoKPICard = React.forwardRef<HTMLDivElement, BentoKPICardProps>(
  ({ className, label, value, trend, sparkline, ...props }, ref) => {
    return (
      <BentoCard ref={ref} span={3} className={cn("", className)} {...props}>
        {/* Label */}
        <div className="text-[10px] font-mono font-medium uppercase tracking-wide text-muted-foreground mb-3">
          {label}
        </div>

        {/* Value */}
        <div className="text-[44px] font-bold tracking-tight text-foreground leading-none mb-3">
          {value}
        </div>

        {/* Trend Badge */}
        {trend && (
          <div
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium",
              trend.direction === "up"
                ? "bg-[#dcfce7] text-[#15803d]"
                : "bg-[#fee2e2] text-[#991b1b]"
            )}
          >
            <span>{trend.direction === "up" ? "↑" : "↓"}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}

        {/* Optional Sparkline Placeholder */}
        {sparkline && (
          <div className="mt-3 h-10 flex items-end gap-0.5">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-muted rounded-sm"
                style={{ height: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        )}
      </BentoCard>
    );
  }
);
BentoKPICard.displayName = "BentoKPICard";

export {
  BentoGrid,
  BentoCard,
  BentoCardHeader,
  BentoCardTitle,
  BentoCardSubtitle,
  BentoCardContent,
  BentoKPICard,
};
