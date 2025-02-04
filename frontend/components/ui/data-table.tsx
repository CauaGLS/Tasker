"use client";

import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  Table as ReactTable,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDown, EyeOff, SlidersHorizontal, Trash2 } from "lucide-react";
import React, { useState } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Input } from "./input";
import { Skeleton } from "./skeleton";

interface FilterProps {
  column: string;
  title: string;
  options: { value: string; label: string }[];
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[];
  className?: string;
  isLoading?: boolean;
  multiSelect?: boolean;
  noResultsMessage?: string;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (state: RowSelectionState) => void;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  searchColumn?: string;
  search?: string;
  onSearchChange?: (search: string) => void;
  onRowClick?: (row: TData) => void;
  filters?: FilterProps[];
  initialFilters?: ColumnFiltersState;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  showOptions?: boolean;
}

export function DataTable<TData, TValue>({
  data = [],
  columns,
  className,
  isLoading,
  multiSelect = false,
  noResultsMessage = "Sem resultados",
  onRowClick,
  rowSelection = {},
  onRowSelectionChange,
  sorting,
  onSortingChange,
  searchColumn,
  search,
  onSearchChange,
  filters,
  initialFilters,
  columnFilters,
  onColumnFiltersChange,
  showOptions,
}: DataTableProps<TData, TValue>) {
  const [_sorting, _setSorting] = React.useState<SortingState>([]);
  const [_columnFilters, _setColumnFilters] = React.useState<ColumnFiltersState>(initialFilters || []);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (e) => (onSortingChange ? onSortingChange(e as SortingState) : _setSorting(e)),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: (e) =>
      onColumnFiltersChange ? onColumnFiltersChange(e as ColumnFiltersState) : _setColumnFilters(e),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newState = updater instanceof Function ? updater(rowSelection) : updater;
      onRowSelectionChange?.(newState);
    },
    enableMultiRowSelection: multiSelect,
    manualSorting: !!onSortingChange,
    manualPagination: true,
    state: {
      sorting: sorting || _sorting,
      columnFilters: columnFilters || _columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const isFiltered = table.getState().columnFilters.length > 0;
  const [isManualClick, setIsManualClick] = useState(false);

  return (
    <>
      {(showOptions || searchColumn || filters || search != undefined) && (
        <div className="flex items-center gap-2">
          {(searchColumn || search != undefined) && (
            <div className="w-full md:max-w-sm">
              <Input
                placeholder="Buscar..."
                value={searchColumn ? (table.getColumn(searchColumn)?.getFilterValue() as string) : search}
                onChange={(event) =>
                  onSearchChange
                    ? onSearchChange(event.target.value)
                    : table.getColumn(searchColumn!)?.setFilterValue(event.target.value)
                }
              />
            </div>
          )}
          {filters?.map((e) => (
            <DataTableFacetedFilter
              key={e.column}
              column={table.getColumn(e.column)}
              title={e.title}
              options={e.options}
            />
          ))}
          {isFiltered && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              onClick={() => table.resetColumnFilters()}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
          {showOptions && (
            <>
              <div className="ml-auto" />
              <DataTableViewOptions table={table} />
            </>
          )}
        </div>
      )}
      <Table className={className}>
        <TableHeader className="z-[1]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} style={{ width: `${header.getSize()}px` }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {!!table?.getRowModel()?.rows?.length &&
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={(e) => {
                  e.preventDefault();

                  if (isManualClick) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    onRowClick && onRowClick(row.original);
                    setIsManualClick(false);
                  }
                }}
                onMouseDown={() => setIsManualClick(true)}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {!table.getRowModel().rows?.length &&
            (isLoading ? (
              <>
                {Array.from({ length: 20 }).map((_, index) => (
                  <TableRow key={index}>
                    {table
                      .getAllColumns()
                      // @ts-ignore
                      .filter((e) => !e.columnDef.hideByDefault)
                      .map((c, i) => (
                        <TableCell key={c.id + i}>
                          <Skeleton className="h-5" />
                        </TableCell>
                      ))}
                  </TableRow>
                ))}
              </>
            ) : (
              <TableRow className="hover:bg-inherit">
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {noResultsMessage}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </>
  );
}

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  tooltip?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  tooltip,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("flex items-center text-nowrap", className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2 text-nowrap", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            title={tooltip}
            className="-ml-3 h-8 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={!column.getCanHide()} onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Ocultar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface DataTableViewOptionsProps<TData> {
  table: ReactTable<TData>;
}

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0">
            <SlidersHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="">
          <DropdownMenuLabel>Colunas</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
            .map((column) => {
              let title;
              if (typeof column.columnDef.header === "string") {
                title = column.columnDef.header;
              } else if (typeof column.columnDef.header === "function") {
                // @ts-ignore
                const HeaderComponent = column.columnDef.header({ column });
                title = HeaderComponent.props.title || column.id;
              } else {
                title = column.id;
              }
              if (!title || title === "") return null;
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {title}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
