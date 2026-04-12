import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "./utils";

export interface MetricDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label: string;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  prefix?: string;
  suffix?: string;
}

const MetricDisplay = React.forwardRef<HTMLDivElement, MetricDisplayProps>(
  ({ className, value, label, trend, prefix, suffix, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {/* Large Number */}
        <div className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-none">
          {prefix}
          {value}
          {suffix}
        </div>

        {/* Label */}
        <div className="text-label font-mono text-muted-foreground">
          {label}
        </div>

        {/* Trend Indicator */}
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-light",
              trend.direction === "up" ? "text-success" : "text-destructive"
            )}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    );
  }
);
MetricDisplay.displayName = "MetricDisplay";

export { MetricDisplay };
