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
import { type Dispatch, type SetStateAction } from "react";


export interface Column<T> {
  key: keyof T | 'actions' | string; // 'string' added for keys that might not be directly on T, like 'partner_logo'
  header: string | React.ReactNode;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: "left" | "center" | "right";
  maxWidth?: number;
}

// FIX: Removed unused generic TData from ColumnFilter
export interface ColumnFilter {
  id: string; // The filter key (e.g., "region", "status")
  label: string;
  options: { value: string | number; label: string }[];
  isLoading?: boolean; 
}

// T must extend an object with an 'id' property of type string or number
interface DataTableProps<T extends { id: string | number }> {
  columns: Column<T>[];
  data: T[];
  columnFilters?: ColumnFilter[];
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
  globalFilterKey?: keyof T; // globalFilterKey should directly refer to a key of T
  serverPagination?: boolean;
  pageCount?: number; // Total number of pages from server
  pageIndex?: number; // Current page index (0-based) from server
  totalItems?: number; // FIX 9: Add totalItems prop for server-side pagination display
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  // FIX 2: onFilterChange should match the signature of the handler in UnitsListPage
  onFilterChange?: (filters: Record<string, string | string[]>) => void;
  // FIX 3: Add onGlobalSearchChange and onSortChange props
  onGlobalSearchChange?: (value: string) => void;
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
  // FIX 4: Add sortConfig and globalSearchTerm as controlled props
  sortConfig?: { key: string; direction: "asc" | "desc" } | null;
  globalSearchTerm?: string;
  selectedRows?: T[];
  onSelectedRowsChange?: Dispatch<SetStateAction<T[]>>;
  isLoading?: boolean;
  searchColumns?: (keyof T)[]; // NEW PROP
}

// --- REUSABLE DATA TABLE COMPONENT ---
export function NewDataTable<T extends { id: string | number }>({
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
  serverPagination = false,
  pageCount,
  pageIndex,
  onPaginationChange,
  onFilterChange,
  selectedRows: controlledSelectedRows,
  onSelectedRowsChange: setControlledSelectedRows,
  searchColumns, // NEW PROP
  onGlobalSearchChange,
  globalSearchTerm,
}: DataTableProps<T>) {
  // --- STATE MANAGEMENT ---
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T | string; // Can be a direct key or a string for nested (though your current Site is flat)
    direction: "asc" | "desc";
  } | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      columnFilters.forEach(f => {
        if (f.id === 'is_active') initial['is_active'] = 'true';
      });
      return initial;
    }
  );
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialPageSize);

  // Use controlled state if provided, otherwise internal state
  const [internalSelectedRowIds, setInternalSelectedRowIds] = React.useState<T["id"][]>([]);

  // Determine which selectedRows to use: controlled (from props) or internal
  const selectedRowIds = controlledSelectedRows ? controlledSelectedRows.map(row => row.id) : internalSelectedRowIds;

  const setSelectedRowIds = (idsOrUpdater: T["id"][] | ((prevIds: T["id"][]) => T["id"][])) => {
      const newIds = typeof idsOrUpdater === "function" ? idsOrUpdater(selectedRowIds) : idsOrUpdater;
      if (setControlledSelectedRows && controlledSelectedRows !== undefined) {
          // Convert ids back to T[] based on the data prop (important if data might change)
          const newSelectedRowsData = data.filter(row => newIds.includes(row.id));
          setControlledSelectedRows(newSelectedRowsData);
      } else {
          setInternalSelectedRowIds(newIds);
      }
  };


  // --- DATA PROCESSING & FILTERING ---

  // Helper to safely get nested values (e.g., "commune.cercle.name")
  // This helper will still be useful if you later reintroduce nested objects.
  // For the current Site interface, it will act like direct property access.
  const getDeepValue = <U extends object>(obj: U, path: string): unknown => { // Changed return type to unknown
    // It's challenging to make this fully type-safe for arbitrary paths without
    // very advanced type-level programming or accepting some 'any'.
    // 'unknown' is safer than 'any' as it forces you to narrow the type later.
    return path.split('.').reduce((acc: unknown, part: string) => {
      if (acc && typeof acc === "object" && part in acc) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  };

  const processedData = React.useMemo(() => {
    // If backend search is enabled, skip local filtering by globalFilter
    if (onGlobalSearchChange) {
      return data;
    }
    let filteredData = [...data];

    if (globalFilter) {
      const lowercasedFilter = globalFilter.toLowerCase();

      if (globalFilterKey) {
        filteredData = filteredData.filter((row) =>
          String(getDeepValue(row, String(globalFilterKey)) ?? "") // Use getDeepValue for globalFilterKey as well
            .toLowerCase()
            .includes(lowercasedFilter)
        );
      } else if (searchColumns && searchColumns.length > 0) {
        filteredData = filteredData.filter((row) => {
          return searchColumns.some(colKey => {
            const cellValue = getDeepValue(row, String(colKey));
            return String(cellValue ?? "").toLowerCase().includes(lowercasedFilter);
          });
        });
      } else {
        filteredData = filteredData.filter((row) => {
          return columns.some(col => {
            const cellValue = getDeepValue(row, String(col.key)); // Always use getDeepValue
            return String(cellValue ?? "").toLowerCase().includes(lowercasedFilter);
          });
        });
      }
    }

    Object.entries(filterValues).forEach(([key, value]) => {
      if (value) {
        filteredData = filteredData.filter(
          (row) => String(getDeepValue(row, key) ?? "") === value // Use getDeepValue for filter values
        );
      }
    });

    if (sortConfig) {
      filteredData.sort((a, b) => {
        const aValue = getDeepValue(a, String(sortConfig.key)); // Use getDeepValue for sort key
        const bValue = getDeepValue(b, String(sortConfig.key)); // Use getDeepValue for sort key

        if (aValue === bValue) return 0;
        const comparison = String(aValue ?? "").localeCompare(String(bValue ?? "")); // Handle null/undefined during comparison
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }
    return filteredData;
  }, [data, globalFilter, globalFilterKey, filterValues, sortConfig, columns, searchColumns, onGlobalSearchChange]);

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return processedData.slice(startIndex, startIndex + rowsPerPage);
  }, [processedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(processedData.length / rowsPerPage);

  // --- SELECTION HANDLERS ---
  const onSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = processedData.map((row) => row.id);
      setSelectedRowIds(allIds);
    } else {
      setSelectedRowIds([]);
    }
  };

  const onSelectRow = (row: T, checked: boolean) => {
    if (checked) {
      setSelectedRowIds(
        (prevIds: T["id"][]) => [...prevIds, row.id] as T["id"][] // Explicitly cast the result
      );
    } else {
      setSelectedRowIds(
        (prevIds: T["id"][]) => prevIds.filter((id: T["id"]) => id !== row.id) as T["id"][] // Explicitly cast the result
      );
    }
  };

  const handleBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(selectedRowIds);
    }
    setSelectedRowIds([]); // Clear selection after initiating bulk delete
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
    setGlobalFilter(event.target.value);
    setCurrentPage(1);
    if (onGlobalSearchChange) {
      onGlobalSearchChange(event.target.value);
    }
  };

  // State for is_active filter if present

  // Merge is_active with other filters and call onFilterChange
  React.useEffect(() => {
    if (onFilterChange) {
      onFilterChange({ ...filterValues});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ filterValues]);

  // When other filters change, call onFilterChange with merged filters
  const handleFilterValueChange = (id: string, value: string) => {
    const newFilterValues = { ...filterValues, [id]: value === "all" ? "" : value };
    setFilterValues(newFilterValues);
    setCurrentPage(1);
    if (onFilterChange) {
      // Merge is_active with new filter values
      onFilterChange({ ...newFilterValues});
    }
  };

  const handleResetFilters = () => {
    setGlobalFilter("");
    setFilterValues({});
    setCurrentPage(1);
    if (onFilterChange) {
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
        primary: "bg-gray-300 text-white", // Changed from original (bg-[#576CBC]) to something more generic
      } as const
    )[headerStyle] || "bg-gray-50 text-gray-700";

  // If serverPagination, use props; else use internal state
  const effectivePage = serverPagination && typeof pageIndex === 'number' ? pageIndex + 1 : currentPage;
  const effectiveTotalPages = serverPagination && typeof pageCount === 'number' ? pageCount : totalPages;
  const effectiveRowsPerPage = serverPagination && typeof initialPageSize === 'number' ? initialPageSize : rowsPerPage;

  // --- RENDER ---
  return (
    <div className={`space-y-4 ${className}`}>
      {/* GLOBAL FILTERS: SEARCH AND is_active */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
        {/* is_active filter if present */}
       
        {/* Search Input */}
        <div className="w-full md:w-1/3 mt-5.5 lg:w-1/4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="global-search"
              placeholder="Rechercher..."
              value={onGlobalSearchChange ? (globalSearchTerm ?? "") : globalFilter}
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
              className="block text-sm font-medium text-gray-700 mb-1 text-left" // changed to left-aligned
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
                {filter.id !== "is_active" && (
                  <SelectItem value="all">{`Tout ${filter.label
                    .split(" ")[0]
                    .toLowerCase()}`}</SelectItem>
                )}
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
                      selectedRowIds.length === processedData.length &&
                      processedData.length > 0
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
                        checked={selectedRowIds.includes(row.id)}
                        onChange={(e) => onSelectRow(row, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => {
                    const cellValue = getDeepValue(row, String(col.key)); // Always use getDeepValue for cell rendering

                    return (
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
                            {col.render
                                ? col.render(row)
                                : (typeof cellValue === 'string' && cellValue.length > 15
                                    ? <span title={cellValue}>{cellValue.slice(0, 15) + '...'}</span>
                                    : String(cellValue ?? ""))}
                        </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* BULK DELETE BUTTON */}
      {enableBulkDelete && selectedRowIds.length > 0 && (
        <div className="flex justify-end my-2">
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} /> Supprimer la sélection ({selectedRowIds.length})
          </Button>
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      <div className="flex items-center justify-between text-sm font-medium text-gray-600">
        <div className="flex items-center space-x-2">
          <span>Rows per page:</span>
          <Select
            value={String(effectiveRowsPerPage)}
            onValueChange={(value) => {
              if (serverPagination && onPaginationChange) {
                onPaginationChange({ pageIndex: 0, pageSize: Number(value) });
              } else {
                setRowsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue placeholder={String(effectiveRowsPerPage)} />
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
            Page {effectiveTotalPages > 0 ? effectivePage : 0} of {effectiveTotalPages}
          </span>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (serverPagination && onPaginationChange) {
                  onPaginationChange({ pageIndex: Math.max(0, (pageIndex || 0) - 1), pageSize: effectiveRowsPerPage });
                } else {
                  setCurrentPage((p) => Math.max(1, p - 1));
                }
              }}
              disabled={effectivePage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (serverPagination && onPaginationChange) {
                  onPaginationChange({ pageIndex: Math.min((pageCount || 1) - 1, (pageIndex || 0) + 1), pageSize: effectiveRowsPerPage });
                } else {
                  setCurrentPage((p) => Math.min(effectiveTotalPages, p + 1));
                }
              }}
              disabled={effectivePage === effectiveTotalPages || effectiveTotalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}