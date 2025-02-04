import { AccessorColumnDef, DisplayColumnDef, GroupColumnDef } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  type ColumnDef<TData, TValue = unknown> = (
    | DisplayColumnDef<TData, TValue>
    | GroupColumnDef<TData, TValue>
    | AccessorColumnDef<TData, TValue>
  ) & { hideByDefault?: boolean; accessorKey?: string };
}
