import * as React from "react";
import { cn } from "./utils";

const DataTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
DataTable.displayName = "DataTable";

const DataTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("", className)} {...props} />
));
DataTableHeader.displayName = "DataTableHeader";

const DataTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("", className)} {...props} />
));
DataTableBody.displayName = "DataTableBody";

const DataTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t bg-muted/50 font-medium", className)}
    {...props}
  />
));
DataTableFooter.displayName = "DataTableFooter";

const DataTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { striped?: boolean }
>(({ className, striped, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-border transition-dari",
      "hover:bg-[#F9F9F9]",
      striped && "even:bg-muted/40",
      className
    )}
    {...props}
  />
));
DataTableRow.displayName = "DataTableRow";

const DataTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "px-4 py-4 text-left align-middle",
      "text-[12px] font-mono font-semibold uppercase tracking-wide",
      "text-muted-foreground",
      "border-b border-border",
      className
    )}
    {...props}
  />
));
DataTableHead.displayName = "DataTableHead";

const DataTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { secondary?: boolean }
>(({ className, secondary, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-4 py-4 align-middle text-sm",
      secondary ? "text-muted-foreground" : "text-foreground",
      className
    )}
    {...props}
  />
));
DataTableCell.displayName = "DataTableCell";

const DataTableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
DataTableCaption.displayName = "DataTableCaption";

export {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableFooter,
  DataTableHead,
  DataTableRow,
  DataTableCell,
  DataTableCaption,
};
