import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Trash2,
} from "lucide-react";

// --- TYPE DEFINITIONS ---
// Added 'deleted_at' to the generic type T for better type safety
export interface Column<T extends { deleted_at?: string | null }> {
  key: keyof T | string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: "left" | "center" | "right";
}

export interface ColumnFilter<T> {
  id: keyof T;
  label: string;
  options: { value: string | number; label: string }[];
}

// Updated T type for DataTableProps
interface DataTableProps<T extends { id: string | number; deleted_at?: string | null }> {
  columns: Column<T>[];
  data: T[];
  columnFilters?: ColumnFilter<T>[];
  emptyText?: string;
  striped?: boolean;
  hoverEffect?: boolean;
  rowHeight?: "sm" | "md" | "lg";
  headerStyle?: "light" | "dark" | "primary";
  onRowClick?: (row: T) => void;
  className?: string;
  initialPageSize?: number;
  onBulkDelete?: (selectedIds: T["id"][]) => void;
  enableBulkDelete?: boolean;
  globalFilterKey?: keyof T;
  // Removed serverPagination related props as we are doing client-side
  serverPagination?: boolean;
  pageCount?: number;
  pageIndex?: number;
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;

  // Add onFilterChange to allow parent component to receive filter values (optional, but good practice)
  onFilterChange?: (filters: Record<string, any>) => void;
  // Add onSelectedRowsChange
  onSelectedRowsChange?: (selectedIds: T["id"][]) => void;
  // Add selectedRows prop to control checked state externally
  selectedRows?: T["id"][];
}

// --- REUSABLE DATA TABLE COMPONENT ---
export function DataTable<T extends { id:string | number; deleted_at?: string | null }>(
  {
    columns,
    data,
    columnFilters = [],
    emptyText = "No data available",
    striped = true,
    hoverEffect = true,
    rowHeight = "md",
    headerStyle = "light",
    onRowClick,
    className = "",
    initialPageSize = 10,
    onBulkDelete,
    enableBulkDelete = true,
    globalFilterKey,
    serverPagination ,// This prop is effectively ignored or can be removed
    pageCount,
    pageIndex,
    onPaginationChange,
    onFilterChange, // Received from parent
    onSelectedRowsChange, // Received from parent
    selectedRows: controlledSelectedRows = [], // Received from parent, default to empty array
  }: DataTableProps<T>) {
  // --- STATE MANAGEMENT ---
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T | string;
    direction: "asc" | "desc";
  } | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>(
    {}
  );
  // Internal pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialPageSize);
  // Use internal state for selected rows if not controlled externally
  const [internalSelectedRows, setInternalSelectedRows] = React.useState<T["id"][]>([]);
  const selectedRows = onSelectedRowsChange ? controlledSelectedRows : internalSelectedRows;


  // --- DATA PROCESSING & FILTERING ---
  const processedData = React.useMemo(() => {
    let filteredData = [...data]; // 'data' here is the `allCycles` from CyclesListPage

    // Global Filter (Search)
    if (globalFilter) {
      const lowercasedFilter = globalFilter.toLowerCase();
      if (globalFilterKey) {
        filteredData = filteredData.filter((row) =>
          String(row[globalFilterKey] ?? "")
            .toLowerCase()
            .includes(lowercasedFilter)
        );
      } else {
        filteredData = filteredData.filter((row) => {
          return columns.some(col => {
            const cellValue = row[col.key as keyof T];
            return String(cellValue ?? "").toLowerCase().includes(lowercasedFilter);
          });
        });
      }
    }

    // Column Filters (including the 'status' filter)
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== "all") { // Ensure value is not empty and not "all"
        filteredData = filteredData.filter((row) => {
          if (key === "status") {
            // Logic for the 'status' filter based on 'deleted_at'
            // Ensure row.deleted_at is checked correctly (null for active, non-null for inactive)
            if (value === "Actif") {
              return row.deleted_at === null;
            } else if (value === "Inactif") {
              return row.deleted_at !== null;
            }
            return false; // Should not happen with current options, but good fallback
          } else {
            // Existing logic for other filters
            return String(row[key as keyof T] ?? "") === value;
          }
        });
      }
    });

    // Sorting
    if (sortConfig) {
      filteredData.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
        if (aValue === bValue) return 0;
        const comparison = String(aValue).localeCompare(String(bValue));
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }
    return filteredData;
  }, [data, globalFilter, globalFilterKey, filterValues, sortConfig, columns]); // Ensure 'columns' is in dependency array if using it in filtering


  // --- Pagination (fully client-side) ---
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return processedData.slice(startIndex, startIndex + rowsPerPage);
  }, [processedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(processedData.length / rowsPerPage);

  // --- SELECTION HANDLERS ---
  const onSelectAll = (checked: boolean) => {
    const newSelectedIds = checked ? processedData.map((row) => row.id) : [];
    if (onSelectedRowsChange) {
      onSelectedRowsChange(newSelectedIds);
    } else {
      setInternalSelectedRows(newSelectedIds);
    }
  };

  const onSelectRow = (row: T, checked: boolean) => {
    const newSelectedIds = checked
      ? [...selectedRows, row.id]
      : selectedRows.filter((id) => id !== row.id);

    if (onSelectedRowsChange) {
      onSelectedRowsChange(newSelectedIds);
    } else {
      setInternalSelectedRows(newSelectedIds);
    }
  };

  const handleBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(selectedRows);
    }
    // Clear selection after action
    if (onSelectedRowsChange) {
      onSelectedRowsChange([]);
    } else {
      setInternalSelectedRows([]);
    }
  };

  // --- EVENT HANDLERS ---
  const requestSort = (key: keyof T | string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleGlobalFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newFilterValue = event.target.value;
    setGlobalFilter(newFilterValue);
    setCurrentPage(1); // Reset to first page on filter change
    if (onFilterChange) {
      // Notify parent about global filter change
      onFilterChange({ ...filterValues, globalFilterKey: newFilterValue });
    }
  };

  const handleFilterValueChange = (id: string, value: string) => {
    const newFilterValues = { ...filterValues, [id]: value === "all" ? "" : value };
    setFilterValues(newFilterValues);
    setCurrentPage(1); // Reset to first page on filter change
    if (onFilterChange) {
      // Notify parent about column filter change
      onFilterChange({ ...newFilterValues, globalFilter: globalFilter });
    }
  };

  const handleResetFilters = () => {
    setGlobalFilter("");
    setFilterValues({});
    setCurrentPage(1);
    if (onFilterChange) {
      // Notify parent about filter reset
      onFilterChange({});
    }
  };

  // --- STYLE HELPERS ---
  const getRowHeightClass = () =>
    ({ sm: "h-10", md: "h-12", lg: "h-14" }[rowHeight] || "h-12");
  const getHeaderStyleClass = () =>
    (
      {
        light: "bg-gray-50 text-gray-700",
        dark: "bg-gray-800 text-white",
        primary: "bg-gray-300 text-white",
      } as const
    )[headerStyle] || "bg-gray-50 text-gray-700";

  // --- RENDER ---
  return (
    <div className={`space-y-4 ${className}`}>
      {/* CONTROLS: SEARCH AND FILTERS */}
      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Input */}
          <div className="w-full md:w-1/3 mt-5.5 lg:w-1/4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="global-search"
                placeholder="Rechercher..."
                value={globalFilter}
                onChange={handleGlobalFilterChange}
                className="pl-10"
              />
            </div>
          </div>

          {/* Mapped Dropdown Filters */}
          {columnFilters.map((filter) => (
            <div key={String(filter.id)} className="w-full md:w-auto md:min-w-[180px]">
              <label
                htmlFor={`filter-${String(filter.id)}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {filter.label}
              </label>
              <Select
                value={filterValues[String(filter.id)] || "all"}
                onValueChange={(value) => handleFilterValueChange(String(filter.id), value)}
              >
                <SelectTrigger id={`filter-${String(filter.id)}`} className="w-full">
                  <SelectValue placeholder={`Tout...`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{`Tout ${filter.label
                    .split(" ")[0]
                    .toLowerCase()}`}</SelectItem>
                  {filter.options.map((opt) => (
                    <SelectItem key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Reset Button */}
          <div className="w-full md:w-auto md:ml-auto pt-0 md:pt-5">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="w-full flex items-center justify-center gap-2 text-gray-700"
            >
              <RotateCw size={14} /> Réinitialiser
            </Button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className={`${getHeaderStyleClass()} border-b border-gray-200`}>
              {enableBulkDelete && (
                <TableCell className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.length === paginatedData.length && // Check if all *displayed* rows are selected
                      paginatedData.length > 0 &&
                      selectedRows.length === processedData.length // Check if all *filtered* data is selected (for accurate "select all")
                    }
                    onChange={(e) => onSelectAll(e.target.checked)}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                      ? "text-right"
                      : "text-left"
                  }`}
                  style={{ width: col.width }}
                >
                  <div
                    className={`flex items-center ${
                      col.sortable ? "cursor-pointer hover:text-gray-900" : ""
                    } ${
                      col.align === "center"
                        ? "justify-center"
                        : col.align === "right"
                        ? "justify-end"
                        : ""
                    }`}
                    onClick={() => col.sortable && requestSort(col.key)}
                  >
                    {col.header}
                    {col.sortable && (
                      <span className="ml-1">
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (enableBulkDelete ? 1 : 0)} className="text-center py-16 bg-gray-50">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <div className="bg-gray-200 rounded-full p-3 mb-3">
                      <Search className="h-8 w-8" />
                    </div>
                    <p className="text-lg font-medium">{emptyText}</p>
                    <p className="mt-1 text-sm max-w-md">
                      Try adjusting your search or filter to find what you're looking for
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, i) => (
                <TableRow
                  key={row.id}
                  className={`${getRowHeightClass()} ${
                    striped ? (i % 2 === 0 ? "bg-white" : "bg-gray-50") : "bg-white"
                  } ${hoverEffect ? "hover:bg-gray-100 transition-colors" : ""} ${
                    onRowClick ? "cursor-pointer" : ""
                  } border-b border-gray-100 last:border-b-0`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {enableBulkDelete && (
                    <TableCell className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={(e) => onSelectRow(row, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell
                      key={String(col.key)}
                      className={`px-4 py-3 text-sm font-medium text-gray-800 ${
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* BULK DELETE BUTTON */}
      {enableBulkDelete && selectedRows.length > 0 && (
        <div className="flex justify-end my-2">
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} /> Supprimer la sélection ({selectedRows.length})
          </Button>
        </div>
      )}

      {/* PAGINATION CONTROLS (now client-side) */}
      <div className="flex items-center justify-between text-sm font-medium text-gray-600">
        <div className="flex items-center space-x-2">
          <span>Rows per page:</span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(value) => {
              setRowsPerPage(Number(value));
              setCurrentPage(1); // Reset to first page when rows per page changes
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue placeholder={String(rowsPerPage)} />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-4">
          <span>
            Page {totalPages > 0 ? currentPage : 0} of {totalPages}
          </span>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}