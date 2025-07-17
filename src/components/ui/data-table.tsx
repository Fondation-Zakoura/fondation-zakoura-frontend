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
  Loader2,
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

export interface ColumnFilter {
  id: string; // The filter key (e.g., "region", "status")
  label: string;
  options: { value: string | number; label: string }[];
  isLoading?: boolean;
  defaultValue?: string | number; // Added defaultValue property
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
  totalItems?: number; // Total number of items from server for display
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  onFilterChange?: (filters: Record<string, string | string[]>) => void;
  onGlobalSearchChange?: (value: string) => void; // Callback for global search input changes
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void; // Callback for sort changes
  sortConfig?: { key: string; direction: "asc" | "desc" } | null; // Controlled sort state
  // globalSearchTerm is not directly used in DataTable's logic, it's a controlled prop for the parent
  // globalSearchTerm?: string; // Removed to avoid TS6133 if not directly used in DataTable's logic
  selectedRows?: T[];
  onSelectedRowsChange?: Dispatch<SetStateAction<T[]>>;
  isLoading?: boolean; // Indicates if data is currently loading (e.g., from API)
  searchColumns?: (keyof T)[]; // Columns to search if no globalFilterKey is provided
  globalFilterValue?: string; // Prop to receive the immediate search input value
}

// --- REUSABLE DATA TABLE COMPONENT ---
export function DataTable<T extends { id: string | number }>({
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
  globalFilterKey, // Used to identify the global search field
  serverPagination = false,
  pageCount,
  pageIndex,
  totalItems = 0, // Default to 0 if not provided
  onPaginationChange,
  onFilterChange,
  onGlobalSearchChange, // Destructure new props
  onSortChange, // Destructure new props
  sortConfig: controlledSortConfig, // Controlled sort state
  // globalSearchTerm: controlledGlobalSearchTerm, // Removed from destructuring as it's not directly used
  globalFilterValue, // Destructure the immediate search input value
  selectedRows: controlledSelectedRows,
  onSelectedRowsChange: setControlledSelectedRows,
  searchColumns,
  isLoading, // Destructure isLoading prop
}: DataTableProps<T>) {
  // --- STATE MANAGEMENT ---
  // Internal state for column filters (managed by DataTable, but changes are communicated via onFilterChange)
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>(() => {
    // Initialize filterValues from columnFilters, respecting defaultValue
    const initialFilters: Record<string, string> = {};
    columnFilters.forEach(filter => {
      if (filter.defaultValue !== undefined) {
        initialFilters[filter.id] = String(filter.defaultValue);
      }
    });
    return initialFilters;
  });

  // Internal pagination state for client-side pagination (used only if serverPagination is false)
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialPageSize);

  // Use controlled state for selection if provided, otherwise internal state
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

  // --- DATA PROCESSING & FILTERING (Client-side only if not serverPagination) ---
  const processedData = React.useMemo(() => {
    if (serverPagination) {
      // If server-side pagination/filtering is enabled, assume data is already processed
      return data;
    }

    let filteredData = [...data];

    // Client-side global filter (only if not server-side)
    // Use globalFilterValue for client-side filtering logic
    if (globalFilterValue) {
      const lowercasedFilter = globalFilterValue.toLowerCase();
      if (globalFilterKey) {
        filteredData = filteredData.filter((row) =>
          String(getDeepValue(row, String(globalFilterKey)) ?? "")
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
            const cellValue = getDeepValue(row, String(col.key));
            return String(cellValue ?? "").toLowerCase().includes(lowercasedFilter);
          });
        });
      }
    }

    // Client-side column filters (only if not server-side)
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value) {
        filteredData = filteredData.filter(
          (row) => String(getDeepValue(row, key) ?? "") === value
        );
      }
    });

    // Client-side sorting (only if not server-side)
    if (controlledSortConfig) { // Use controlledSortConfig for client-side sorting logic
      filteredData.sort((a, b) => {
        const aValue = getDeepValue(a, String(controlledSortConfig.key));
        const bValue = getDeepValue(b, String(controlledSortConfig.key));

        if (aValue === bValue) return 0;
        const comparison = String(aValue ?? "").localeCompare(String(bValue ?? ""));
        return controlledSortConfig.direction === "asc" ? comparison : -comparison;
      });
    }
    return filteredData;
  }, [data, globalFilterValue, globalFilterKey, filterValues, controlledSortConfig, columns, searchColumns, serverPagination]); // Dependency changed to globalFilterValue

  const paginatedData = React.useMemo(() => {
    if (serverPagination) {
      return data; // If server-side, `data` is already the paginated slice
    }
    const startIndex = (currentPage - 1) * rowsPerPage;
    return processedData.slice(startIndex, startIndex + rowsPerPage);
  }, [processedData, currentPage, rowsPerPage, data, serverPagination]);

  // Total pages calculation depends on serverPagination
  const totalPages = serverPagination ? (pageCount || 0) : Math.ceil(processedData.length / rowsPerPage);

  // Helper to safely get nested values (e.g., "commune.cercle.name")
  const getDeepValue = <U extends object>(obj: U, path: string): unknown => {
    return path.split('.').reduce((acc: unknown, part: string) => {
      if (acc && typeof acc === "object" && part in acc) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  };

  // --- SELECTION HANDLERS ---
  const onSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedData.map((row) => row.id); // Select only visible items
      setSelectedRowIds(allIds);
    } else {
      setSelectedRowIds([]);
    }
  };

  const onSelectRow = (row: T, checked: boolean) => {
    if (checked) {
      setSelectedRowIds(
        (prevIds: T["id"][]) => [...prevIds, row.id] as T["id"][]
      );
    } else {
      setSelectedRowIds(
        (prevIds: T["id"][]) => prevIds.filter((id: T["id"]) => id !== row.id) as T["id"][]
      );
    }
  };

  const handleBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(selectedRowIds);
    }
    // Selection clearing should be handled by the parent component after the bulk action
    // if using controlled `selectedRows`
    if (!controlledSelectedRows) {
      setSelectedRowIds([]);
    }
  };

  // --- EVENT HANDLERS ---
  const requestSort = (key: keyof T | string) => {
    let direction: "asc" | "desc" = "asc";
    // Determine the next sort direction based on the current sort config
    if (controlledSortConfig && controlledSortConfig.key === key && controlledSortConfig.direction === "asc") {
      direction = "desc";
    }
    // If onSortChange callback is provided, use it to notify parent
    if (onSortChange) {
      onSortChange(String(key), direction);
    } else {
      // Fallback for client-side sorting if onSortChange is not provided
    }
  };

  const handleGlobalFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (onGlobalSearchChange) {
      onGlobalSearchChange(event.target.value); // Use the prop callback
    } else {
      // Fallback for client-side filtering if onGlobalSearchChange is not provided
      setCurrentPage(1); // Reset page for client-side pagination
    }
  };

  const handleFilterValueChange = (id: string, value: string) => {
    // If the value is "all" (which is now removed from options), treat it as an empty string
    const newValue = value === "all" ? "" : value;
    const newFilterValues = { ...filterValues, [id]: newValue };
    setFilterValues(newFilterValues); // Update internal state for client-side filtering

    if (onFilterChange) {
      // If onFilterChange is provided, pass the combined filters (including global search)
      // The parent component is responsible for merging and debouncing as needed.
      const currentGlobalSearch = globalFilterValue || ''; // Use globalFilterValue here
      const combinedFiltersToSend = { ...newFilterValues };
      if (globalFilterKey && currentGlobalSearch) {
        combinedFiltersToSend[String(globalFilterKey)] = currentGlobalSearch;
      }
      onFilterChange(combinedFiltersToSend);
    } else {
      setCurrentPage(1); // Reset page on filter change for client-side pagination
    }
  };

  const handleResetFilters = () => {
    if (onGlobalSearchChange) {
      onGlobalSearchChange(""); // Reset global search via callback
    }
    // Reset internal filter values to defaults (including 'active' for activation_status)
    const resetFilters: Record<string, string> = {};
    columnFilters.forEach(filter => {
      if (filter.defaultValue !== undefined) {
        resetFilters[filter.id] = String(filter.defaultValue);
      }
    });
    setFilterValues(resetFilters);
    setCurrentPage(1); // Reset page for client-side pagination

    if (onFilterChange) {
      // Notify parent of filter reset, including the default 'active' status
      const combinedResetFilters: Record<string, string | string[]> = {};
      columnFilters.forEach(filter => {
        if (filter.defaultValue !== undefined) {
          combinedResetFilters[filter.id] = String(filter.defaultValue);
        }
      });
      onFilterChange(combinedResetFilters);
    }
    if (onSortChange) {
      onSortChange('', 'asc'); // Reset sort via callback (or to default)
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
        primary: "bg-[#576CBC] text-white", // Reverted to original primary color
      } as const
    )[headerStyle] || "bg-gray-50 text-gray-700";

  // If serverPagination, use props; else use internal state
  const effectivePage = serverPagination && typeof pageIndex === 'number' ? pageIndex + 1 : currentPage;
  const effectiveTotalPages = serverPagination && typeof pageCount === 'number' ? pageCount : totalPages;
  const effectiveRowsPerPage = serverPagination && typeof initialPageSize === 'number' ? initialPageSize : rowsPerPage;

  // Show loading overlay if isLoading is true
  const showLoadingOverlay = isLoading && data.length === 0;


  // --- RENDER ---
  return (
    <div className={`space-y-4 ${className}`}>
      {/* CONTROLS: SEARCH AND FILTERS */}
      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:flex-wrap items-center gap-4"> {/* Added md:flex-wrap */}
          {/* Search Input */}
          <div className="w-full md:w-1/3 lg:w-1/4 mt-0 md:mt-5.5"> {/* Adjusted margin-top */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="global-search"
                placeholder="Rechercher..."
                value={globalFilterValue ?? ''}
                onChange={handleGlobalFilterChange}
                className="pl-10"
              />
            </div>
          </div>

          {/* Mapped Dropdown Filters */}
          {columnFilters.map((filter) => (
            <div key={String(filter.id)} className="w-full md:w-auto md:min-w-[180px] flex-grow"> {/* Added flex-grow */}
              <label
                htmlFor={`filter-${String(filter.id)}`}
                className="block text-sm font-medium text-gray-700 mb-1 text-left"
              >
                {filter.label}
              </label>
              <Select
                value={filterValues[String(filter.id)] || ""} // Default to empty string
                onValueChange={(value) => handleFilterValueChange(String(filter.id), value)}
              >
                <SelectTrigger id={`filter-${String(filter.id)}`} className="w-full">
                  <SelectValue placeholder={filter.id === 'activation_status' ? "Sélectionner un statut" : `Tout ${filter.label.split(" ")[0].toLowerCase()}`} /> {/* Updated placeholder */}
                </SelectTrigger>
                <SelectContent>
                  {/* Removed the "Tout statut" SelectItem */}
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
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm relative">
        {showLoadingOverlay && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <Loader2 className="h-10 w-10 animate-spin text-[#576CBC]" />
            <p className="ml-4 text-lg text-gray-600">Chargement des données...</p>
          </div>
        )}
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className={`${getHeaderStyleClass()} border-b border-gray-200`}>
              {enableBulkDelete && (
                <TableCell className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedRowIds.length === paginatedData.length &&
                      paginatedData.length > 0
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
                        {controlledSortConfig?.key === col.key ? (
                          controlledSortConfig.direction === "asc" ? (
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
            {paginatedData.length === 0 && !isLoading ? (
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
                    const cellValue = getDeepValue(row, String(col.key));

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
