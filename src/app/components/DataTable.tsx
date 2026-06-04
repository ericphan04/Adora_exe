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
      {/* Desktop Table View - shown on large screens (lg:block) */}
      <div className="hidden lg:block overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse">
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
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-sm text-muted-foreground">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View - shown on smaller screens (lg:hidden) */}
      <div className="lg:hidden divide-y divide-border/30">
        {data.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Không có dữ liệu
          </div>
        ) : (
          data.map((row, i) => (
            <div key={i} className="p-4 hover:bg-surface/20 transition-colors flex flex-col gap-2.5">
              {columns.map((col) => {
                const isActions = col.key === "actions" || col.key === "action";
                
                if (isActions) {
                  return (
                    <div key={col.key} className="pt-3 border-t border-border/20 mt-2 flex items-center justify-end gap-2 shrink-0">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </div>
                  );
                }

                return (
                  <div key={col.key} className="flex justify-between items-start gap-4">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider shrink-0 mt-0.5">
                      {col.label}
                    </span>
                    <span className="text-xs font-semibold text-foreground text-right break-all">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}