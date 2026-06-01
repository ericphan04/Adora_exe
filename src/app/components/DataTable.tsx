import React from "react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  className?: string;
}

export function DataTable({ columns, data, className = "" }: DataTableProps) {
  return (
    <div className={`bg-card rounded-lg border border-border/80 overflow-hidden ${className}`}>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="bg-surface/60 border-b border-border/80">
              {columns.map((col) => {
                const widthAndSpacingClasses = col.className
                  ? col.className
                      .split(" ")
                      .filter((c) => c.startsWith("min-w-") || c.startsWith("w-") || c.startsWith("max-w-") || c.includes("nowrap"))
                      .join(" ")
                  : "";
                return (
                  <th
                    key={col.key}
                    className={`text-left px-4 py-3.5 text-xs text-muted-foreground uppercase tracking-wider font-semibold ${
                      col.headerClassName || ""
                    } ${widthAndSpacingClasses}`}
                  >
                    {col.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border/40 last:border-0 hover:bg-surface/30 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 text-sm text-foreground align-middle ${
                      col.className || ""
                    }`}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}